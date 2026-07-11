import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Table, TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog'; // NUEVO IMPORT PARA EL MODAL
import { MessageService } from 'primeng/api';

import { IngresoProductoService } from '../../services/ingreso-producto.service';

@Component({
  selector: 'app-historial-recepcion',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, CardModule, 
    TagModule, InputTextModule, ButtonModule, ToastModule, TooltipModule,
    DialogModule // AGREGAR AQUÍ
  ],
  providers: [MessageService],
  templateUrl: './historial-recepcion.component.html'
})
export class HistorialRecepcionComponent implements OnInit {
  
  @ViewChild('dt') dt!: Table;
  
  recepciones: any[] = [];
  loading: boolean = true;

  // NUEVAS VARIABLES PARA EL RESUMEN
  mostrarResumen: boolean = false;
  recepcionesAgrupadas: any[] = [];

  constructor(
    private ingresoService: IngresoProductoService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.loading = true;
    this.ingresoService.getHistorialRecepciones().subscribe({
      next: (data) => {
        this.recepciones = data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error al cargar historial:", err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar con el servidor.' });
        this.loading = false;
      }
    });
  }

  // --- NUEVA LÓGICA DE AGRUPACIÓN MATEMÁTICA ---
  generarResumen() {
    const grupos = this.recepciones.reduce((acc, ingreso) => {
      const oc = ingreso.ordenCompra?.codigoOrden || 'S/N';
      
      // Si la OC no existe en nuestro acumulador, la creamos
      if (!acc[oc]) {
        acc[oc] = {
          ocOrigen: oc,
          fechaIngreso: ingreso.fechaIngreso, // Tomamos la fecha del primer registro
          proveedor: ingreso.proveedor?.nombre,
          totalProductosDistintos: 0, 
          totalUnidadesFisicas: 0, 
          estado: ingreso.ingresoActivo 
        };
      }
      
      // Sumamos los valores por cada fila que pertenezca a la misma OC
      acc[oc].totalProductosDistintos += 1;
      acc[oc].totalUnidadesFisicas += ingreso.cantidad_ingresada;
      
      return acc;
    }, {});

    // Convertimos el objeto en un Array y lo ordenamos por fecha descendente
    this.recepcionesAgrupadas = Object.values(grupos).sort((a: any, b: any) => {
      return new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime();
    });

    this.mostrarResumen = true;
  }

  getSeverityEstado(activo: number): 'success' | 'danger' {
    return activo === 1 ? 'success' : 'danger';
  }

  getLabelEstado(activo: number): string {
    return activo === 1 ? 'DISPONIBLE' : 'RETIRADO / BAJA';
  }
}