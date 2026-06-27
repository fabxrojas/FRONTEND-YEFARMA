import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
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
  selector: 'app-registrar-cliente',
  templateUrl: './registrar-cliente.component.html',
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
export class RegistrarClienteComponent implements OnInit {
  // Lista para la tabla
  clientes: any[] = [];
  formularioModificado: boolean = false;

  nuevoCliente: any = {
    nombre: '',
    ruc: '',
    correo: '',
    direccion: '',
    telefono: ''
  };
  clienteSeleccionado: any = null;
  clienteOriginal: any = null;

  constructor(
    private clienteService: ClienteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarClientes();
  }

  // --- SE EJECUTA AL HACER CLIC EN LA TABLA ---
  onRowSelect(event: any) {
    this.nuevoCliente = { ...event.data };
    this.clienteSeleccionado = event.data;
    this.clienteOriginal = { ...event.data };
    this.formularioModificado = false;
  }

  esFormularioValido(): boolean {
    if (!this.clienteSeleccionado) return false;
    return JSON.stringify(this.nuevoCliente) !== JSON.stringify(this.clienteOriginal);
  }

  cargarClientes() {
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });
  }

  registrar() {
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.ruc || !this.nuevoCliente.correo) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete los campos obligatorios.' });
      return;
    }

    if (this.clienteSeleccionado) {
      this.modificarCliente();
    } else {
      this.guardarNuevo();
    }
  }

  modificarCliente() {
    this.confirmationService.confirm({
      message: '¿Desea guardar los cambios realizados en este cliente?',
      header: 'Confirmación de Modificación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-info',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        const id = this.clienteSeleccionado.idCliente;

        this.clienteService.actualizarCliente(id, this.nuevoCliente).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Datos modificados correctamente' });
            this.finalizarAccion();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
        });
      }
    });
  }

  eliminarCliente() {
    if (!this.clienteSeleccionado) return;
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar a ${this.clienteSeleccionado.nombre}?`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-info',
      accept: () => {
        const id = this.clienteSeleccionado.idCliente;

        this.clienteService.eliminarCliente(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente borrado del sistema' });
            this.finalizarAccion();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la eliminación' })
        });
      }
    });
  }

  guardarNuevo() {
    this.clienteService.registrarCliente(this.nuevoCliente).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente registrado correctamente' });
        this.finalizarAccion();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar' })
    });
  }

  finalizarAccion() {
    this.limpiarFormulario();
    this.clienteSeleccionado = null;
    this.cargarClientes();
  }

  limpiarFormulario() {
    this.nuevoCliente = { nombre: '', ruc: '', correo: '', direccion: '', telefono: '' };
    this.clienteSeleccionado = null;
    this.clienteOriginal = null;
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