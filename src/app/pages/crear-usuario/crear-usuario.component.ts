import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

// Importaciones de PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    TableModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './crear-usuario.component.html',
  styleUrl: './crear-usuario.component.css'
})
export class CrearUsuarioComponent implements OnInit {
  usuarios: any[] = [];

  // Objeto vinculado al formulario con valores iniciales limpios
  usuario: any = {
    idUsuario: null, // Cambiado a CamelCase
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    correo: '',
    contrasena: '',
    idRol: 2
  };

  usuarioOriginalJSON: string = '';
  botonModificarDesactivado: boolean = true;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.limpiarFormulario(); // Forzamos limpieza al cargar
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (res) => this.usuarios = res,
      error: () => this.mostrarMensaje('error', 'Error', 'No se pudo cargar la lista')
    });
  }

  seleccionarFila(u: any) {
    this.usuario = { ...u };
    this.usuarioOriginalJSON = JSON.stringify(this.usuario);
    this.botonModificarDesactivado = true;
  }

  detectarCambios() {
    if (this.usuario.idUsuario) { // Cambiado a CamelCase
      this.botonModificarDesactivado = this.usuarioOriginalJSON === JSON.stringify(this.usuario);
    }
  }

  crearUsuario() {
    if (!this.usuario.nombre || !this.usuario.apellidoP || !this.usuario.correo || !this.usuario.contrasena) {
      this.mostrarMensaje('warn', 'Advertencia', 'Complete los campos obligatorios');
      return;
    }

    this.usuarioService.registrarUsuario(this.usuario).subscribe({
      next: () => {
        this.mostrarMensaje('success', 'Éxito', 'Técnico registrado correctamente');
        this.limpiarFormulario();
        this.cargarUsuarios();
      },
      error: (err) => {
        const msg = err.status === 400 ? "El correo ya existe" : "Error al registrar";
        this.mostrarMensaje('error', 'Error', msg);
      }
    });
  }

  modificarUsuario() {
    this.confirmationService.confirm({
      message: '¿Desea guardar los cambios realizados?',
      header: 'Confirmación de Modificación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-info',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Cambiado a CamelCase
        this.usuarioService.actualizarUsuario(this.usuario.idUsuario, this.usuario).subscribe({
          next: () => {
            this.mostrarMensaje('success', 'Éxito', 'Datos modificados correctamente');
            this.limpiarFormulario();
            this.cargarUsuarios();
          },
          error: () => this.mostrarMensaje('error', 'Error', 'No se pudo actualizar')
        });
      }
    });
  }

  eliminarUsuario() {
    if (this.usuario.idRol === 1) {
      this.mostrarMensaje('error', 'Error', 'No se puede eliminar al Químico Farmacéutico.');
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar a ${this.usuario.nombre}? Esta acción no se puede deshacer.`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-info',
      accept: () => {
        // Cambiado a CamelCase
        this.usuarioService.eliminarUsuario(this.usuario.idUsuario).subscribe({
          next: () => {
            this.mostrarMensaje('success', 'Éxito', 'Usuario borrado del sistema');
            this.limpiarFormulario();
            this.cargarUsuarios();
          },
          error: () => this.mostrarMensaje('error', 'Error', 'No se pudo completar la eliminación')
        });
      }
    });
  }

  bloquearNumeros(event: KeyboardEvent) {
    const key = event.key;
    const apenasLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;
    if (!apenasLetras.test(key) && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
  }

  validarLetras(event: any, campo: string) {
    const regex = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g;
    const valorLimpio = event.target.value.replace(regex, '');
    this.usuario[campo] = valorLimpio;
    event.target.value = valorLimpio;
    this.detectarCambios();
  }

  limpiarFormulario() {
    this.usuario = {
      idUsuario: null, // Cambiado a CamelCase
      nombre: '',
      apellidoP: '',
      apellidoM: '',
      correo: '',
      contrasena: '',
      idRol: 2 // ¡CORREGIDO EL BUG AQUÍ!
    };

    this.botonModificarDesactivado = true;
    this.usuarioOriginalJSON = '';

    setTimeout(() => {
      this.usuario.correo = '';
      this.usuario.contrasena = '';
    }, 50);
  }

  private mostrarMensaje(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
}