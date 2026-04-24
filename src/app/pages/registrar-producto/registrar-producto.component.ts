import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { ProductoService } from '../../services/producto.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-registrar-producto',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule,
    CardModule, InputTextModule, InputNumberModule, SelectModule, ButtonModule,
  ],
  providers: [ProductoService],
  templateUrl: './registrar-producto.component.html',
  styleUrls: ['./registrar-producto.component.css']
})
export class RegistrarProductoComponent implements OnInit {
  productoForm: FormGroup;
  tipos: any[] = []; // Se llenará desde el Backend
  formas: any[] = []; // Se llenará desde el Backend

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService // Inyectamos el servicio
  ) {
    // Inicializamos el formulario con los nombres de tu tabla SQL
    this.productoForm = this.fb.group({
      producto: ['', Validators.required],
      registroSanitario: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0.1)]],
      tipo: [null, Validators.required], // Objeto TipoProducto
      formaFarmaceutica: [null, Validators.required] // Objeto FormaFarmaceutica
    });
  }

  ngOnInit(): void {
    // 1. Cargamos los tipos desde la DB (Medicamento/Dispositivo)
    this.productoService.getTipos().subscribe({
      next: (data) => this.tipos = data,
      error: (err) => console.error('Error cargando tipos:', err)
    });

    // 2. Cargamos las formas desde la DB (Tableta/Jarabe/etc)
    this.productoService.getFormas().subscribe({
      next: (data) => this.formas = data,
      error: (err) => console.error('Error cargando formas:', err)
    });
  }

 guardarProducto() {
    if (this.productoForm.valid) {
      // Obtenemos los datos del formulario
      const datosForm = this.productoForm.value;
      
      this.productoService.registrar(datosForm).subscribe({
        next: (response) => {
          console.log('Registro exitoso en MySQL:', response);
          alert('¡Producto registrado correctamente!'); // Luego lo cambiamos por un Toast
          this.limpiarFormulario();
        },
        error: (err) => {
          console.error('Error al registrar producto:', err);
          alert('Hubo un error al guardar. Revisa la consola.');
        }
      });
    } else {
      // Marcamos los campos para que el usuario vea qué falta
      Object.values(this.productoForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  limpiarFormulario() {
    this.productoForm.reset();
  }
}