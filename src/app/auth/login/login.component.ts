import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog'; // Nuevo
import { ToastModule } from 'primeng/toast'; // Nuevo
import { MessageService } from 'primeng/api'; // Nuevo

import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service'; // Asegúrate de tenerlo

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DialogModule,
    ToastModule
  ],
  providers: [MessageService], // Proveedor local para mensajes
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginData = { username: '', password: '' };
  errorMessage: string = '';

  // Variables para la recuperación
  displayModal: boolean = false;
  emailRecuperar: string = '';
  cargandoRecuperacion: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loginData = { username: '', password: '' };
    this.errorMessage = '';
  }

  // Métodos de Recuperación
  abrirDialogoRecuperar() {
    this.displayModal = true;
    this.emailRecuperar = '';
  }

  enviarSolicitudRecuperacion() {
    if (!this.emailRecuperar) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingrese su correo electrónico' });
      return;
    }

    this.cargandoRecuperacion = true;

    this.usuarioService.solicitarRecuperacion(this.emailRecuperar).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Revise su bandeja de entrada' });
        this.displayModal = false;
        this.cargandoRecuperacion = false;
      },
      error: (err) => {
        this.cargandoRecuperacion = false;
        const msg = err.status === 404 ? 'El correo no está registrado' : 'Error al conectar con el servidor';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  onLogin() {
    // Validamos que no envíe campos vacíos
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Por favor, complete todos los campos.';
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        console.log('Objeto recibido:', res);

        // Si llega aquí, es porque el servidor respondió 200 OK
        if (res && res.status === 'success') {
          localStorage.setItem('usuario', JSON.stringify(res));

          const rol = res.rol;
          if (rol === 1) {
            this.router.navigate(['/dashboard-quimico']);
          } else if (rol === 2) {
            this.router.navigate(['/dashboard-tecnico']);
          } else {
            this.errorMessage = 'Rol no reconocido: ' + rol;
          }
        } else {
          // Caso poco común: respondió 200 pero el status no es success
          this.errorMessage = 'No se pudo iniciar sesión. Verifique sus datos.';
        }
      },
      error: (err) => {
        console.error('Detalle del error:', err);

        if (err.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado en el servidor.';
        }

        // Limpiamos la contraseña por seguridad
        this.loginData.password = '';
      }
    });
  }
}