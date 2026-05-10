import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-restablecer-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordModule, ButtonModule],
  templateUrl: './restablecer-contrasena.component.html'
})
export class RestablecerContrasenaComponent implements OnInit {
  token: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    if (!this.token) {
      this.router.navigate(['/login']);
    }
  }

  cambiarContrasena() {
    if (!this.nuevaContrasena || this.nuevaContrasena !== this.confirmarContrasena) {
      alert("Las contraseñas deben ser iguales y no estar vacías.");
      return;
    }

    this.usuarioService.cambiarContrasena(this.token, this.nuevaContrasena).subscribe({
      next: (res) => {
        alert("Tu contraseña ha sido actualizada.");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en la petición:', err);
        alert("El enlace ha expirado o es inválido. Solicita uno nuevo.");
      }
    });
  }
}