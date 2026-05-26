import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DispensacionService } from '../../services/dispensacion.service';

import { ProductoService } from '../../services/producto.service';

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
    TagModule
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

  // Variables del Carrito de Dispensación
  carrito: any[] = [];
  totalDispensacion: number = 0;

  constructor(
    private dispensacionService: DispensacionService,
    private productoService: ProductoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
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
  agregarAlCarrito() {
    if (!this.productoSeleccionado) {
      this.mostrarMensaje('warn', 'Atención', 'Seleccione un producto de la tabla.');
      return;
    }

    if (this.cantidadAgregar <= 0) {
      this.mostrarMensaje('warn', 'Atención', 'La cantidad debe ser al menos 1.');
      return;
    }

    if (this.cantidadAgregar > this.productoSeleccionado.stockTotal) {
      this.mostrarMensaje('error', 'Stock Insuficiente', 'No hay suficientes unidades en el inventario.');
      return;
    }

    const subtotal = this.productoSeleccionado.precio * this.cantidadAgregar;

    // Buscamos si el producto ya está en el carrito
    const index = this.carrito.findIndex(item => item.idProducto === this.productoSeleccionado.idProducto);

    if (index !== -1) {
      // Si ya está, verificamos que la suma no supere el stock global
      if ((this.carrito[index].cantidad + this.cantidadAgregar) > this.productoSeleccionado.stockTotal) {
        this.mostrarMensaje('error', 'Stock Excedido', 'La suma en el carrito supera el stock disponible.');
        return;
      }
      this.carrito[index].cantidad += this.cantidadAgregar;
      this.carrito[index].subtotal += subtotal;
    } else {
      // Si es nuevo, lo agregamos como nueva fila
      this.carrito.push({
        idProducto: this.productoSeleccionado.idProducto,
        nombre: this.productoSeleccionado.producto,
        precio: this.productoSeleccionado.precio,
        cantidad: this.cantidadAgregar,
        subtotal: subtotal
      });
    }

    this.calcularTotal();
    this.mostrarMensaje('success', 'Éxito', `${this.cantidadAgregar}x ${this.productoSeleccionado.producto} al carrito.`);

    // Limpiamos la selección para seguir buscando
    this.productoSeleccionado = null;
    this.cantidadAgregar = 1;
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalDispensacion = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  // --- PROCESAR LA ORDEN HACIA SPRING BOOT ---
  procesarDispensacion() {
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
          idUsuario: 1, // TODO: Aquí deberías poner el ID del usuario que inició sesión
          total: this.totalDispensacion,
          detalles: this.carrito.map(item => ({
            idProducto: item.idProducto,
            cantidad: item.cantidad,
            subtotal: item.subtotal
          }))
        };

        this.dispensacionService.procesarDispensacion(request).subscribe({
          next: (res) => {
            this.mostrarMensaje('success', 'Dispensación Exitosa', 'El stock ha sido actualizado (FEFO).');
            this.cancelarOrden(); // Limpiamos el carrito
            this.cargarProductos(); // Recargamos para ver el nuevo stock
          },
          error: (err) => {
            console.error(err);
            this.mostrarMensaje('error', 'Error del Servidor', 'No se pudo procesar la dispensación.');
          }
        });
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