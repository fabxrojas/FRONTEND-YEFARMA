import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importaciones de PrimeNG
import { Table, TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Servicios
import { IngresoProductoService } from '../../services/ingreso-producto.service';

@Component({
  selector: 'app-historial-recepcion',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, CardModule, 
    TagModule, InputTextModule, ButtonModule, ToastModule, TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './historial-recepcion.component.html'
})
export class HistorialRecepcionComponent implements OnInit {
  
  @ViewChild('dt') dt!: Table;
  
  recepciones: any[] = [];
  loading: boolean = true;

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

  getSeverityEstado(activo: number): 'success' | 'danger' {
    // 1 = Activo (En estante), 0 = Inactivo (Dado de baja / Anulado)
    return activo === 1 ? 'success' : 'danger';
  }

  getLabelEstado(activo: number): string {
    return activo === 1 ? 'DISPONIBLE' : 'RETIRADO / BAJA';
  }
}