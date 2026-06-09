import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

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
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginData = { username: '', password: '', codigo: '' };
  errorMessage: string = '';
  paso: number = 1; // Para controlar el paso del login

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
    this.loginData = { username: '', password: '', codigo: '' };
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

    // Asegúrate de enviar el objeto con la clave 'correo' que espera el Backend
    this.usuarioService.solicitarRecuperacion({ correo: this.emailRecuperar }).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: res.message }); // Usamos res.message
        this.displayModal = false;
        this.cargandoRecuperacion = false;
      },
      error: (err) => {
        this.cargandoRecuperacion = false;
        // Ahora leemos el mensaje que viene del backend en el body
        const msg = err.error?.message || 'Error al conectar con el servidor';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  enviarPaso1() {
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Complete los campos.';
      return;
    }

    // Llamamos al nuevo método del servicio que apunta a /login-paso1
    this.authService.loginPaso1({
      username: this.loginData.username,
      password: this.loginData.password
    }).subscribe({
      next: (res) => {
        this.paso = 2; // Todo bien, pedimos el código
        this.errorMessage = '';
        this.messageService.add({ severity: 'info', summary: 'Código enviado', detail: 'Revise su correo' });
      },
      error: (err) => {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
        this.loginData.password = '';
      }
    });
  }

  // PASO 2: Validar código 2FA
  enviarPaso2() {
    if (!this.loginData.codigo) {
      this.errorMessage = 'Ingrese el código de 6 dígitos.';
      return;
    }

    this.authService.loginPaso2({
      username: this.loginData.username,
      codigo: this.loginData.codigo
    }).subscribe({
      next: (res) => {

        if (res.rol === 1) this.router.navigate(['/dashboard-quimico']);
        else if (res.rol === 2) this.router.navigate(['/dashboard-tecnico']);
      },
      error: (err) => {
        this.errorMessage = 'Código incorrecto o expirado.';
      }
    });
  }

  /*onLogin() {
    // Validamos que no envíe campos vacíos
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Por favor, complete todos los campos.';
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        if (res && res.status === 'success') {
          const rol = this.authService.getRolUsuario();

          if (rol === 1) {
            this.router.navigate(['/dashboard-quimico']);
          } else if (rol === 2) {
            this.router.navigate(['/dashboard-tecnico']);
          } else {
            this.errorMessage = 'Rol no reconocido: ' + rol;
          }
        } else {
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
  }*/
}