import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Para ngModel y ngForm
import { CommonModule } from '@angular/common'; // Para *ngIf

// Importaciones de PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true, // Asegúrate de que esto diga true
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
export class LoginComponent {
  loginData = { username: '', password: '' };
  errorMessage: string = '';

  constructor(private router: Router) { }

  onLogin() {
    console.log('Intento de login:', this.loginData); // Agrega esto para ver si el botón responde

    const { username, password } = this.loginData;

    // Validación de campos vacíos (Escenario ES-003)
    if (!username || !password) {
      this.errorMessage = 'Campos incompletos. Intente completar los campos nuevamente';
      return;
    }

    // Simulación de credenciales (Escenario ES-001)
    // Usuario: FabrizioRO | Pass: 123
    if (username === 'FabrizioRO' && password === '123') {
      localStorage.setItem('userRole', 'QUIMICO FARMACEUTICO');
      console.log('Redirigiendo a Químico...');
      this.router.navigate(['/dashboard-quimico']);
    }
    // Usuario: AbrahamNR | Pass: 123
    else if (username === 'AbrahamNR' && password === '123') {
      localStorage.setItem('userRole', 'TECNICO FARMACEUTICO');
      console.log('Redirigiendo a Técnico...');
      this.router.navigate(['/dashboard-tecnico']);
    }
    else {
      this.errorMessage = 'Credenciales inválidas. Ingrese sus datos correctos nuevamente';
    }
  }
}