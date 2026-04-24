import { Component, OnInit } from '@angular/core'; // IMPORTANTE: Añadido OnInit
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit { // IMPORTANTE: "implements OnInit"
  loginData = { username: '', password: '' };
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  // Se ejecuta automáticamente al cargar la página
  ngOnInit(): void {
    // Forzamos la limpieza al entrar a la ruta
    this.loginData = { username: '', password: '' };
    this.errorMessage = '';
  }

  private limpiarCampos() {
    this.loginData = { username: '', password: '' };
    this.errorMessage = '';
  }

  onLogin() {
    // 1. Extraemos los valores del formulario
    const user = this.loginData.username;
    const pass = this.loginData.password;

    // 2. Validación corregida
    if (!user || !pass) {
      this.errorMessage = 'Campos incompletos. Intente completar los campos nuevamente';
      return;
    }

    // 3. Enviamos el objeto loginData (que ya tiene username y password)
    console.log('Enviando a Java:', this.loginData);

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        if (res && res.status === 'success') {
          localStorage.setItem('userName', res.username);
          localStorage.setItem('realName', res.nombre);
          localStorage.setItem('userRole', res.rol.toString());

          // Redirección corregida (sin .html)
          if (res.rol === 1) {
            // USA LA RUTA EXACTA QUE DEFINISTE EN app.routes.ts
            this.router.navigate(['/dashboard-quimico']);
          } else if (res.rol === 2) {
            this.router.navigate(['/dashboard-tecnico']);
          }
        }
      },
      error: (err) => {
        console.error('Error 401 capturado:', err);

        // 1. Asignamos el mensaje específico para el 401
        if (err.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos. Verifique sus datos.';
        } else {
          this.errorMessage = 'No se pudo conectar con el servidor de Yefarma.';
        }

       this.limpiarCampos();
      }
    });
  }
}