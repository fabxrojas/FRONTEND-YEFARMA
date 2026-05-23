import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextarea } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip'; 

import { InventarioService } from '../../services/inventario.service';
// IMPORTANTE: Ajusta esta ruta a donde tengas tu servicio de autenticación
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    TagModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    MultiSelectModule,
    DropdownModule,      // AGREGADO
    InputTextarea, // AGREGADO
    TooltipModule        // AGREGADO
  ],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  productos: any[] = [];
  loading: boolean = true;
  displayFiltros: boolean = false;

  // Listas para los filtros
  marcasDisponibles: any[] = [];
  selectedMarcas: any[] = [];

  presentacionesDisponibles: any[] = [];
  selectedPresentaciones: any[] = [];

  // --- VARIABLES PARA EL MODAL DE BAJA ---
  mostrarModalBaja: boolean = false;
  loteSeleccionado: any = null;
  motivoBaja: string = '';
  motivoEspecifico: string = '';

  opcionesBaja = [
    { label: 'Vencimiento', value: 'Vencimiento' },
    { label: 'Empaque Dañado o Roto', value: 'Empaque Dañado' },
    { label: 'Devolución a Proveedor', value: 'Devolución' },
    { label: 'Otro (Especificar)', value: 'Otro' }
  ];

  // Inyectamos el AuthService como 'public' para poder usarlo en el HTML (*ngIf)
  constructor(
    private inventarioService: InventarioService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.cargarInventario();
  }

  cargarInventario() {
    this.loading = true;
    this.inventarioService.obtenerStock().subscribe(data => {
      this.productos = data;
      // Extraer datos únicos
      this.marcasDisponibles = [...new Set(data.map(p => p.marca))].map(m => ({ label: m, value: m }));
      this.presentacionesDisponibles = [...new Set(data.map(p => p.presentacion))].map(p => ({ label: p, value: p }));
      this.loading = false;
    });
  }

  aplicarFiltros() {
    if (this.selectedMarcas.length > 0) {
      this.dt.filter(this.selectedMarcas, 'marca', 'in');
    }
    if (this.selectedPresentaciones.length > 0) {
      this.dt.filter(this.selectedPresentaciones, 'presentacion', 'in');
    }
    this.displayFiltros = false;
  }

  limpiarFiltros() {
    this.selectedMarcas = [];
    this.selectedPresentaciones = [];
    this.dt.clear();
    this.displayFiltros = false;
  }

  getSeverity(stock: number): 'success' | 'warning' | 'danger' {
    if (stock > 20) return 'success';
    if (stock > 0) return 'warning';
    return 'danger';
  }

  // --- MÉTODOS PARA LA BAJA DE INVENTARIO ---

  abrirModalBaja(lote: any) {
    this.loteSeleccionado = lote;
    this.motivoBaja = '';
    this.motivoEspecifico = '';
    this.mostrarModalBaja = true;
  }

  confirmarBaja() {
    // Validar que no se envíe vacío
    if (!this.motivoBaja || (this.motivoBaja === 'Otro' && !this.motivoEspecifico)) {
      alert("Por favor, especifique un motivo válido para la baja.");
      return;
    }

    const motivoFinal = this.motivoBaja === 'Otro' ? this.motivoEspecifico : this.motivoBaja;
    const idUsuario = this.authService.getCurrentUserId();

    const payload = {
      idIngreso: this.loteSeleccionado.id_ingreso,
      idUsuario: idUsuario,
      motivo: motivoFinal
    };

    this.inventarioService.registrarBajaLote(payload).subscribe({
      next: (res: any) => {
        console.log(res.mensaje);
        this.mostrarModalBaja = false;
        this.cargarInventario(); 
      },
      error: (err: any) => {
        console.error("Error al procesar la baja", err);
        alert("Ocurrió un error al intentar dar de baja el lote.");
      }
    });
  }
}