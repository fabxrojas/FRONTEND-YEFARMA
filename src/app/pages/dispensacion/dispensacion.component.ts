import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DispensacionService } from '../../services/dispensacion.service';

import { ProductoService } from '../../services/producto.service';
import { RefreshService } from '../../services/refresh.service';

// Importaciones de PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dispensacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    ConfirmDialogModule,
    ToastModule,
    InputNumberModule,
    TagModule, TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dispensacion.component.html',
  styleUrl: './dispensacion.component.css'
})
export class DispensacionComponent implements OnInit {

  // Variables para la Búsqueda
  textoBusqueda: string = '';
  productosDisponibles: any[] = [];
  productoSeleccionado: any = null;
  cantidadAgregar: number = 1;
  searchTimer: any;

  // Variables del Carrito de Dispensación
  carrito: any[] = [];
  totalDispensacion: number = 0;

  constructor(
    private dispensacionService: DispensacionService,
    private productoService: ProductoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private refreshService: RefreshService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Al cargar la pantalla, podríamos traer los productos
    this.cargarProductos();
  }

  // --- LÓGICA DE BÚSQUEDA ---
  cargarProductos() {
    this.productoService.listarConStock().subscribe({
      next: (res) => this.productosDisponibles = res,
      error: (err) => this.mostrarMensaje('error', 'Error', 'No se pudo cargar.')
    });
  }

  buscarProductoBackend() {
    if (!this.textoBusqueda || this.textoBusqueda.trim() === '') {
      this.cargarProductos();
      return;
    }

    this.productoService.buscarConStock(this.textoBusqueda).subscribe({
      next: (res) => {
        // CAMBIA ESTO:
        this.productosDisponibles = res;
      },
      error: (err) => {
        this.mostrarMensaje('error', 'Error', 'Fallo en la búsqueda.');
      }
    });
  }

  seleccionarProducto(prod: any) {
    this.productoSeleccionado = prod;
    this.cantidadAgregar = 1;
  }

  // --- LÓGICA DEL CARRITO ---
  agregarAlCarrito(prod: any, cantidadInput: number = 1) {
    if (cantidadInput <= 0) {
      this.mostrarMensaje('warn', 'Atención', 'La cantidad debe ser al menos 1.');
      return;
    }

    if (cantidadInput > prod.stockTotal) {
      this.mostrarMensaje('error', 'Error', `Solo quedan ${prod.stockTotal} unidades.`);
      return;
    }

    const subtotal = prod.precio * cantidadInput;

    const index = this.carrito.findIndex(item => item.idProducto === prod.idProducto);

    if (index !== -1) {
      if ((this.carrito[index].cantidad + cantidadInput) > prod.stockTotal) {
        this.mostrarMensaje('error', 'Error', 'La suma en el carrito supera el stock disponible.');
        return;
      }
      this.carrito[index].cantidad += cantidadInput;
      this.carrito[index].subtotal += subtotal;
    } else {
      this.carrito.push({
        idProducto: prod.idProducto,
        nombre: prod.producto,
        precio: prod.precio,
        cantidad: cantidadInput,
        subtotal: subtotal,
        stockMaximo: prod.stockTotal
      });
    }

    this.calcularTotal();
    this.mostrarMensaje('success', 'Agregado', `Se añadió ${prod.producto} al carrito.`);

    // Limpiamos la búsqueda para el siguiente cliente si es necesario
    // this.textoBusqueda = '';
    // this.productosDisponibles = [];
  }

  actualizarSubtotalCarrito(item: any) {
    if (item.cantidad > item.stockMaximo) {
      item.cantidad = item.stockMaximo;
      this.mostrarMensaje('warn', 'Atención', 'No hay más stock disponible.');
    }
    item.subtotal = item.precio * item.cantidad;
    this.calcularTotal();
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalDispensacion = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  procesarDispensacion() {

    const idUsuario = this.authService.getCurrentUserId();
    console.log("ID recuperado:", idUsuario); // <-- ¿Qué número sale aquí exactamente?

    if (idUsuario === 0) {
      this.mostrarMensaje('error', 'Error', 'Usuario no identificado. Inicie sesión nuevamente.');
      return;
    }
    this.confirmationService.confirm({
      message: `¿Desea confirmar esta dispensación por un total de S/ ${this.totalDispensacion.toFixed(2)}?`,
      header: 'Confirmar Orden',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-info',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {

        // Estructura exacta que espera nuestro DispensacionRequest.java
        const request = {
          idUsuario: this.authService.getCurrentUserId(),
          total: this.totalDispensacion,
          detalles: this.carrito.map(item => ({
            idProducto: item.idProducto,
            cantidad: item.cantidad,
            subtotal: item.subtotal
          }))
        };

        this.dispensacionService.procesarDispensacion(request).subscribe({
          next: (res) => {
            console.log("Respuesta del Backend:", res);
            this.mostrarMensaje('success', 'Éxito', 'Dispensación procesada correctamente.');

            if (res && res.idDispensacion) {
              this.descargarTicket(res.idDispensacion);
            }
            this.cancelarOrden(); // Limpiamos el carrito
            this.cargarProductos(); // Recargamos para ver el nuevo stock
            this.refreshService.triggerRefresh(); // Notificamos a otros componentes que deben refrescar datos

          },
          error: (err) => {
            console.error(err);
            this.mostrarMensaje('error', 'Error', 'No se pudo procesar la dispensación.');
          }
        });
      }
    });
  }

  // Método para manejar la descarga del PDF
  private descargarTicket(id: number) {
    this.dispensacionService.obtenerTicketPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket_dispensacion_${id}.pdf`;
        document.body.appendChild(a); // Necesario para algunos navegadores
        a.click();
        document.body.removeChild(a); // Limpieza
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.mostrarMensaje('error', 'Error', 'No se pudo descargar el ticket.');
      }
    });
  }

  buscarEnTiempoReal() {
    // Si el usuario sigue escribiendo rápido, cancelamos la búsqueda anterior
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    // Esperamos 300 milisegundos (0.3 seg) después de que deje de teclear para ir al Backend
    this.searchTimer = setTimeout(() => {
      this.ejecutarBusqueda();
    }, 300);
  }

  private ejecutarBusqueda() {
    if (!this.textoBusqueda || this.textoBusqueda.trim() === '') {
      this.cargarProductos();
      return;
    }

    this.productoService.buscarConStock(this.textoBusqueda).subscribe({
      next: (res) => {
        this.productosDisponibles = res;
      },
      error: (err) => {
        this.mostrarMensaje('error', 'Error', 'Fallo en la búsqueda.');
      }
    });
  }

  cancelarOrden() {
    this.carrito = [];
    this.calcularTotal();
    this.productoSeleccionado = null;
  }

  // Utilidad para mostrar notificaciones Toast
  private mostrarMensaje(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }


}