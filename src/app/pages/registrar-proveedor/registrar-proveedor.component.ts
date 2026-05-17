import { Component, OnInit } from '@angular/core'; // Añadimos OnInit para cargar la lista al iniciar
import { ProveedorService } from '../../services/proveedor.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common'; // Necesario para pipes como 'date'
import { FormsModule } from '@angular/forms'; // Necesario para ngModel

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-registrar-proveedor',
  templateUrl: './registrar-proveedor.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    ToastModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class RegistrarProveedorComponent implements OnInit {
  // Lista para la tabla
  proveedores: any[] = [];

  nuevoProveedor: any = {
    nombre: '',
    ruc: '',
    correo: '',
    direccion: '',
    telefono: ''
  };

  proveedorSeleccionado: any = null;

  constructor(
    private proveedorService: ProveedorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarProveedores(); // Cargamos la lista apenas abre el componente
  }

  onRowSelect(event: any) {
    this.nuevoProveedor = { ...event.data };
    this.proveedorSeleccionado = event.data;
  }

  cargarProveedores() {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
      },
      error: (err) => console.error('Error al cargar proveedores', err)
    });
  }

  registrar() {
    if (!this.nuevoProveedor.nombre || !this.nuevoProveedor.ruc || !this.nuevoProveedor.correo) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete los campos obligatorios.' });
      return;
    }

    if (this.proveedorSeleccionado) {
      this.modificarProveedor();
    } else {
      this.guardarNuevo();
    }
  }

  // Lógica de Modificación con Confirmación
  modificarProveedor() {
    this.confirmationService.confirm({
      message: '¿Desea guardar los cambios realizados en este proveedor?',
      header: 'Confirmación de Modificación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-info',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Usamos idProveedor (CamelCase del modelo Java)
        const id = this.proveedorSeleccionado.idProveedor;

        this.proveedorService.actualizarProveedor(id, this.nuevoProveedor).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Datos modificados correctamente' });
            this.finalizarAccion();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
        });
      }
    });
  }

  // Lógica de Eliminación con Confirmación
  eliminarProveedor() {
    if (!this.proveedorSeleccionado) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar a ${this.proveedorSeleccionado.nombre}?`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-info',
      accept: () => {
        const id = this.proveedorSeleccionado.idProveedor;

        this.proveedorService.eliminarProveedor(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor borrado del sistema' });
            this.finalizarAccion();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la eliminación' })
        });
      }
    });
  }

  // Método auxiliar para guardar nuevo
  guardarNuevo() {
    this.proveedorService.registrarProveedor(this.nuevoProveedor).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor registrado correctamente' });
        this.finalizarAccion();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar' })
    });
  }

  finalizarAccion() {
    this.limpiarForm();
    this.proveedorSeleccionado = null;
    this.cargarProveedores();
  }

  limpiarForm() {
    this.nuevoProveedor = { nombre: '', ruc: '', correo: '', direccion: '', telefono: '' };
  }

  soloNumeros(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    // Solo permite números (teclas del 0 al 9)
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}