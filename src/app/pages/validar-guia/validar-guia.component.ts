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

  ngOnInit(): void {}

  buscarGuia() {
    if (!this.codigoBusqueda.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debe ingresar un código de guía.' });
      return;
    }

    // El servicio consulta al endpoint del puerto 8081 usando el código ingresado
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
    if (!this.guiaEncontrada || !this.guiaEncontrada.idGuia) return;

    this.guiaService.imprimirReportePDF(this.guiaEncontrada.idGuia).subscribe({
      next: (blob: Blob) => {
        // Creamos un enlace invisible para disparar la descarga local en el navegador
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Guia_${this.guiaEncontrada.codigoGuia}.pdf`;
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

  limpiarValidacion() {
    this.codigoBusqueda = '';
    this.guiaEncontrada = null;
  }
}