import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Usaremos Model-Driven para la tabla editable
import { HttpClientModule } from '@angular/common/http';

// PRIMENG MODULES
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { Table } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

// SERVICIOS Y API
import { ProductoService } from '../../services/producto.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-registrar-producto',
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule,
    TableModule, ToastModule, ConfirmDialogModule, TooltipModule,
    ButtonModule, InputTextModule, InputNumberModule, SelectModule, CardModule
  ],
  providers: [ProductoService, ConfirmationService, MessageService],
  templateUrl: './registrar-producto.component.html',
  styleUrls: ['./registrar-producto.component.css']
})
export class RegistrarProductoComponent implements OnInit {
  @ViewChild('dt') table!: Table; //Referencia a la tabla del HTML
  productos: any[] = [];
  tipos: any[] = [];
  formas: any[] = [];


  // Para revertir cambios si el usuario cancela la edición de una fila
  clonProductos: { [s: string]: any } = {};

  constructor(
    private productoService: ProductoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.obtenerDatosIniciales();
  }



  obtenerDatosIniciales(): void {
    // Cargamos la lista completa de productos para la tabla
    this.productoService.listarTodos().subscribe(data => this.productos = data);

    // Cargamos los selectores
    this.productoService.getTipos().subscribe(data => this.tipos = data);
    this.productoService.getFormas().subscribe(data => this.formas = data);
  }

  // --- LÓGICA DE EDICIÓN EN FILA ---

  onRowEditInit(producto: any) {
    // Guardamos una copia de la fila antes de editar
    this.clonProductos[producto.id_producto] = { ...producto };
  }

  onRowEditSave(producto: any) {
    // 1. Validación básica antes de enviar
    if (producto.producto && producto.producto.trim().length > 0 && producto.precio > 0) {

      this.productoService.registrar(producto).subscribe({
        next: (response) => {
          // 2. Mensaje de éxito
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: producto.id_producto ? 'Producto actualizado' : 'Producto registrado'
          });

          // 3. Limpiar el clon si existía (solo para productos editados)
          if (producto.id_producto) {
            delete this.clonProductos[producto.id_producto];
          }

          // 4. CRÍTICO: Recargar la lista de la base de datos
          // Esto trae el nuevo ID y el Código (N000XX) generado por el Trigger de MySQL
          this.obtenerDatosIniciales();
        },
        error: (err) => {
          console.error('Error en el servidor:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar en la base de datos'
          });
        }
      });
    } else {
      // 5. Validación si el usuario dejó campos vacíos
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'El nombre y el precio son obligatorios'
      });



    }
    const esValido =
      producto.producto?.trim().length > 0 &&
      producto.precio > 0 &&
      producto.tipo != null &&
      producto.formaFarmaceutica != null;

    if (esValido) {
      this.productoService.registrar(producto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto guardado' });
          if (producto.nuevo) delete producto.nuevo;
          delete this.clonProductos[producto.id_producto];
          this.obtenerDatosIniciales(); // Recarga para ver el Código N000XX
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error en el servidor' });
        }
      });
    } else {
      // Si falta algo, NO SE GUARDA y avisamos al Químico
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos Incompletos',
        detail: 'Por favor, complete el nombre, precio, tipo y forma antes de guardar.'
      });
    }
  }

  onRowEditCancel(producto: any, index: number) {
    if (producto.nuevo) {
      this.productos.shift(); // Quita la primera fila si era la nueva
    } else {
      this.productos[index] = this.clonProductos[producto.id_producto];
      delete this.clonProductos[producto.id_producto];
    }
  }

  // --- ELIMINACIÓN CON VENTANA EMERGENTE ---

  confirmarEliminacion(producto: any) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${producto.producto}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productoService.eliminar(producto.id_producto).subscribe({
          next: () => {
            this.productos = this.productos.filter(p => p.id_producto !== producto.id_producto);
            this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Registro borrado de la base de datos' });
          }
        });
      }
    });
  }

  agregarNuevaFila() {
    // Creamos el objeto nuevo
    const nuevoProducto = {
      producto: '',
      precio: 0,
      tipo: null,
      formaFarmaceutica: null,
      nuevo: true // Marcador temporal para saber que es una fila nueva
    };

    // Lo agregamos al inicio del arreglo
    this.productos = [nuevoProducto, ...this.productos];

    // 4. EL TRUCO: Esperamos un milisegundo a que Angular renderice la fila y activamos la edición
    setTimeout(() => {
      this.table.initRowEdit(nuevoProducto);
    }, 1);
  }

  validarYGuardar(producto: any) {
    // 1. Validación estricta
    const esValido = producto.producto?.trim() &&
      producto.precio > 0 &&
      producto.tipo &&
      producto.formaFarmaceutica;

    if (!esValido) {
      // Mostramos el error y NO cerramos la fila
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe completar todos los campos (Nombre, Tipo, Forma y Precio > 0)'
      });
      return; // Detenemos la ejecución aquí
    }

    // 2. Si es válido, procedemos a guardar en MySQL
    this.productoService.registrar(producto).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado' });

        // 3. Cerramos el modo edición manualmente
        this.table.cancelRowEdit(producto);

        // 4. Recargamos para ver el código N000XX generado
        this.obtenerDatosIniciales();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar con el servidor' });
      }
    });
  }
}