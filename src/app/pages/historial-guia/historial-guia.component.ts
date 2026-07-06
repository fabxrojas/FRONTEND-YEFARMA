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
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import { GuiaRemisionService } from '../../services/guia-remision.service';

@Component({
  selector: 'app-historial-guia',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, CardModule, TagModule, 
    InputTextModule, ButtonModule, ToastModule, TooltipModule, DialogModule
  ],
  providers: [MessageService],
  templateUrl: './historial-guia.component.html'
})
export class HistorialGuiaComponent implements OnInit {

  @ViewChild('dt') dt!: Table;

  guias: any[] = [];
  loading: boolean = true;

  // Variables para el Modal
  mostrarModalDetalles: boolean = false;
  guiaSeleccionada: any = null;

  constructor(
    private guiaService: GuiaRemisionService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.loading = true;
    this.guiaService.listarGuias().subscribe({
      next: (data) => {
        this.guias = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial.' });
        this.loading = false;
      }
    });
  }

  getSeverityEstado(estado: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (estado?.toUpperCase()) {
      case 'VALIDADO': return 'success';
      case 'EMITIDO': return 'warn';
      case 'ANULADO': return 'danger';
      default: return 'info';
    }
  }

  verDetalles(guia: any) {
    this.guiaSeleccionada = guia;
    this.mostrarModalDetalles = true;
  }

  descargarPDF(id: number) {
    window.open(`http://localhost:8081/api/guias-remision/pdf/${id}`, '_blank');
  }

  validarGuia(guia: any) {
    if (confirm(`¿Confirma que la mercadería de la guía ${guia.codigoGuia} llegó a su destino correctamente?`)) {
      this.guiaService.validarGuia(guia.id_guia || guia.idGuia).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Guía Validada correctamente.' });
          this.cargarHistorial();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo validar.' })
      });
    }
  }

  anularGuia(guia: any) {
    if (confirm(`¿Está seguro de ANULAR la guía ${guia.codigoGuia}? El traslado quedará sin efecto.`)) {
      this.guiaService.anularGuia(guia.id_guia || guia.idGuia).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Anulada', detail: 'La guía fue anulada.' });
          this.cargarHistorial();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo anular.' })
      });
    }
  }
}