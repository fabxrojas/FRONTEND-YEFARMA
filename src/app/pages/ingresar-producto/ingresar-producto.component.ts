import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker'; // O Calendar según tu versión de PrimeNG
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ProductoService } from '../../services/producto.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-ingresar-producto',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AutoCompleteModule, InputNumberModule,
    DatePickerModule, SelectModule, ButtonModule, CardModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './ingresar-producto.component.html',
  styleUrls: ['./ingresar-producto.component.css']
})
export class IngresarProductoComponent implements OnInit {
  // Datos para los selectores
  marcas: any[] = [];
  presentaciones: any[] = [];
  proveedores: any[] = [];
  
  // Búsqueda de productos
  productoSeleccionado: any = null;
  resultadosBusqueda: any[] = [];

  // Objeto de ingreso (Lote)
  nuevoIngreso: any = {
    lote: '', // Se puede autogenerar o ingresar manualmente
    cantidad: 1,
    fechaFabricacion: null,
    fechaVencimiento: null,
    marca: null,
    presentacion: null,
    proveedor: null
  };

  constructor(
    private productoService: ProductoService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.productoService.getMarcas().subscribe(data => this.marcas = data);
    this.productoService.getPresentaciones().subscribe(data => this.presentaciones = data);
    // Nota: Aquí necesitarás un servicio para proveedores más adelante
    this.proveedores = [{ id: 1, nombre: 'ALKOFARMA E.I.R.L' }, { id: 2, nombre: 'PORTUGAL S.A.' }];
  }

  // Lógica de búsqueda dinámica para el Autocomplete
  buscarProducto(event: any) {
    const query = event.query;
    this.productoService.buscarPorNombre(query).subscribe(data => {
      this.resultadosBusqueda = data;
    });
  }

  confirmarIngreso() {
    if (!this.validarDatos()) return;

    // Estructura para enviar al backend (tabla de movimientos/lotes)
    const datosEnvio = {
      id_producto: this.productoSeleccionado.id_producto,
      ...this.nuevoIngreso
    };

    console.log('Enviando ingreso:', datosEnvio);
    
    // Aquí llamarías a tu servicio de movimientos
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Ingreso Exitoso', 
      detail: `Se han añadido ${this.nuevoIngreso.cantidad} unidades al stock.` 
    });
    
    this.limpiarFormulario();
  }

  validarDatos(): boolean {
    if (!this.productoSeleccionado) {
      this.mostrarError('Debe seleccionar un producto del catálogo.');
      return false;
    }
    if (this.nuevoIngreso.cantidad <= 0) {
      this.mostrarError('La cantidad debe ser mayor a cero.');
      return false;
    }
    if (this.nuevoIngreso.fechaVencimiento <= this.nuevoIngreso.fechaFabricacion) {
      this.mostrarError('La fecha de vencimiento debe ser posterior a la de fabricación.');
      return false;
    }
    return true;
  }

  private mostrarError(mensaje: string) {
    this.messageService.add({ severity: 'error', summary: 'Error de Validación', detail: mensaje });
  }

  limpiarFormulario() {
    this.productoSeleccionado = null;
    this.nuevoIngreso = { cantidad: 1, lote: '', fechaFabricacion: null, fechaVencimiento: null };
  }
}