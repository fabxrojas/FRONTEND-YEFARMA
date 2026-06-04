import { Component, OnInit } from '@angular/core';
import { ProveedorService } from '../../services/proveedor.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  formularioModificado: boolean = false;

  nuevoProveedor: any = {
    nombre: '',
    ruc: '',
    correo: '',
    direccion: '',
    telefono: ''
  };

  proveedorSeleccionado: any = null;
  proveedorOriginal: any = null;

  constructor(
    private proveedorService: ProveedorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarProveedores();
  }

  // --- SE EJECUTA AL HACER CLIC EN LA TABLA ---
  onRowSelect(event: any) {
    this.nuevoProveedor = { ...event.data };
    this.proveedorSeleccionado = event.data;
    this.proveedorOriginal = { ...event.data };
    this.formularioModificado = false; this.formularioModificado = false;
  }

  esFormularioValido(): boolean {
    if (!this.proveedorSeleccionado) return false;

    return JSON.stringify(this.nuevoProveedor) !== JSON.stringify(this.proveedorOriginal);
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
    this.proveedorSeleccionado = null;
    this.proveedorOriginal = null; 
    this.formularioModificado = false;
  }

  soloNumeros(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}