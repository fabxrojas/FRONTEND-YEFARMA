import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GuiaRemisionService } from '../../services/guia-remision.service';

@Component({
  selector: 'app-validar-guia',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, ButtonModule, TableModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './validar-guia.component.html'
})
export class ValidarGuiaComponent implements OnInit {

  codigoBusqueda: string = '';
  guiaEncontrada: any = null;

  constructor(
    private guiaService: GuiaRemisionService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void { }

  buscarGuia() {
    if (!this.codigoBusqueda.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debe ingresar un código de guía.' });
      return;
    }

    this.guiaService.buscarPorCodigo(this.codigoBusqueda.trim().toUpperCase()).subscribe({
      next: (data) => {
        if (data) {
          this.guiaEncontrada = data;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Guía localizada correctamente.' });
        } else {
          this.guiaEncontrada = null;
          this.messageService.add({ severity: 'error', summary: 'No Encontrado', detail: 'No existe una guía con ese identificador.' });
        }
      },
      error: (err) => {
        console.error(err);
        this.guiaEncontrada = null;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al buscar el comprobante en el servidor.' });
      }
    });
  }

  getSeverityEstado(estado: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (estado?.toUpperCase()) {
      case 'VALIDADO': return 'success';
      case 'PENDIENTE': return 'warn';
      case 'RECHAZADO': return 'danger';
      default: return 'info';
    }
  }

  descargarPDF() {
    // CORRECCIÓN: Capturamos el ID de forma segura
    const id = this.guiaEncontrada?.id_guia || this.guiaEncontrada?.idGuia;

    if (!id) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se identificó el ID del comprobante.' });
      return;
    }

    this.guiaService.imprimirReportePDF(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Guia_${this.guiaEncontrada.codigoGuia || this.guiaEncontrada.Codigo_guia}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.messageService.add({ severity: 'success', summary: 'Descargado', detail: 'El PDF se descargó de manera exitosa.' });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo estructurar el PDF.' });
      }
    });
  }

  validarComprobante() {
    // CORRECCIÓN: Capturamos el ID de forma segura
    const id = this.guiaEncontrada?.id_guia || this.guiaEncontrada?.idGuia;

    if (!id) {
      console.error("Fallo crítico: No se encontró el ID de la guía.", this.guiaEncontrada);
      this.messageService.add({ severity: 'error', summary: 'Error interno', detail: 'No se identificó el ID del comprobante.' });
      return;
    }

    this.guiaService.validarGuia(id).subscribe({
      next: (guiaActualizada) => {
        // Forzamos a Angular a repintar el cambio
        this.guiaEncontrada = {
          ...this.guiaEncontrada,
          estado: guiaActualizada.estado
        };

        this.messageService.add({
          severity: 'success',
          summary: 'Validación Exitosa',
          detail: 'El estado de la guía cambió a VALIDADO.'
        });
      },
      error: (err) => {
        console.error("Error al validar:", err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error del Servidor',
          detail: 'No se pudo actualizar el estado del comprobante.'
        });
      }
    });
  }

  limpiarValidacion() {
    this.codigoBusqueda = '';
    this.guiaEncontrada = null;
  }
}