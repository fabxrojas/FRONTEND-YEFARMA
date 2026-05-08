import { Component, OnInit } from '@angular/core'; // Añadimos OnInit para cargar la lista al iniciar
import { ProveedorService } from '../../services/proveedor.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common'; // Necesario para pipes como 'date'
import { FormsModule } from '@angular/forms'; // Necesario para ngModel

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast'; // Para que el MessageService funcione en el HTML

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
    ToastModule
  ],
  providers: [MessageService]
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

  constructor(
    private proveedorService: ProveedorService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.cargarProveedores(); // Cargamos la lista apenas abre el componente
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
    // 1. Verificación de campos vacíos
    if (!this.nuevoProveedor.nombre || !this.nuevoProveedor.ruc ||
      !this.nuevoProveedor.correo || !this.nuevoProveedor.telefono ||
      !this.nuevoProveedor.direccion) {

      // Mensaje de alerta global
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe completar todos los campos obligatorios antes de continuar.'
      });
      return; // Bloquea el registro
    }

    // 2. Verificación de longitud mínima (RUC y Teléfono)
    if (this.nuevoProveedor.ruc.length < 11 || this.nuevoProveedor.telefono.length < 9) {
      this.messageService.add({
        severity: 'error',
        summary: 'Datos Inválidos',
        detail: 'El RUC debe tener 11 dígitos y el teléfono 9 dígitos.'
      });
      return;
    }

    // 3. Si todo está correcto, proceder al guardado
    this.proveedorService.registrarProveedor(this.nuevoProveedor).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Proveedor registrado correctamente.'
        });
        this.limpiarForm();
        this.cargarProveedores(); // Actualiza la tabla
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar. Verifique si el RUC ya existe.'
        });
      }
    });
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