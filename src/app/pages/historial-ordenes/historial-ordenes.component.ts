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
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

// Servicios
import { OrdenCompraService } from '../../services/orden-compra.service';

@Component({
  selector: 'app-historial-ordenes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, CardModule, TagModule, 
    InputTextModule, ButtonModule, ToastModule, TooltipModule, DialogModule
  ],
  providers: [MessageService],
  templateUrl: './historial-ordenes.component.html'
})
export class HistorialOrdenesComponent implements OnInit {

  @ViewChild('dt') dt!: Table;

  ordenes: any[] = [];
  loading: boolean = true;
  
  // Variables para el modal de detalles rápidos
  mostrarModalDetalles: boolean = false;
  ordenSeleccionada: any = null;

  constructor(
    private ordenService: OrdenCompraService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.loading = true;
    this.ordenService.getHistorialOrdenes().subscribe({
      next: (data) => {
        this.ordenes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo estructurar el historial.' });
        this.loading = false;
      }
    });
  }

  getSeverityEstado(desc: string): 'warn' | 'success' | 'danger' | 'info' {
    switch (desc?.toUpperCase()) {
      case 'EMITIDA': return 'warn';
      case 'RECEPCIONADA': return 'success';
      case 'ANULADA': return 'danger';
      default: return 'info';
    }
  }

  verDetallesOrden(orden: any) {
    this.ordenSeleccionada = orden;
    this.mostrarModalDetalles = true;
  }

  descargarPDF(id: number) {
    window.open(`http://localhost:8081/api/ordenes-compra/pdf/${id}`, '_blank');
  }

  anularOrden(orden: any) {
    if (confirm(`¿Está completamente seguro de ANULAR la orden ${orden.codigoOrden}? Esto inhabilitará cualquier lote de medicamentos ingresado con este documento.`)) {
      this.ordenService.anularOrdenCompra(orden.idOrden).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Orden Anulada', detail: 'El documento y su stock fueron cancelados.' });
          this.cargarHistorial();
          this.mostrarModalDetalles = false;
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar la anulación.' });
        }
      });
    }
  }
}