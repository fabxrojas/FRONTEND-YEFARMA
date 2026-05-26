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
import { TextareaModule } from 'primeng/textarea'; // Asegurado el nombre correcto
import { TooltipModule } from 'primeng/tooltip';

import { InventarioService } from '../../services/inventario.service';
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
    DropdownModule,
    TextareaModule,
    TooltipModule
  ],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  productos: any[] = [];
  loading: boolean = true;
  displayFiltros: boolean = false;

  marcasDisponibles: any[] = [];
  selectedMarcas: any[] = [];
  presentacionesDisponibles: any[] = [];
  selectedPresentaciones: any[] = [];

  // --- VARIABLES ACTUALIZADAS PARA EL MODAL DE BAJA ---
  mostrarModalBaja: boolean = false;
  loteSeleccionado: any = null;

  // Ahora guardamos el ID numérico del motivo, no el texto
  motivoBajaId: number | null = null;
  motivoEspecifico: string = '';

  // Inicia vacío, se llenará desde la base de datos
  opcionesBaja: any[] = [];

  constructor(
    private inventarioService: InventarioService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.cargarInventario();
    this.cargarMotivosBaja(); // Llamamos a la base de datos al abrir la pantalla
  }

  cargarInventario() {
    this.loading = true;
    this.inventarioService.obtenerStock().subscribe(data => {
      this.productos = data;
      this.marcasDisponibles = [...new Set(data.map(p => p.marca))].map(m => ({ label: m, value: m }));
      this.presentacionesDisponibles = [...new Set(data.map(p => p.presentacion))].map(p => ({ label: p, value: p }));
      this.loading = false;
    });
  }

  // --- NUEVO: OBTENER LOS MOTIVOS DINÁMICOS ---
  cargarMotivosBaja() {
    this.inventarioService.obtenerMotivosBaja().subscribe({
      next: (data: any[]) => {
        // Mapeamos los datos de Spring Boot al formato de PrimeNG
        this.opcionesBaja = data.map(m => ({
          label: m.descripcion,
          value: m.id_motivo    // Este ID será lo que se guarde en motivoBajaId
        }));
      },
      error: (err) => console.error("Error al cargar el catálogo de motivos", err)
    });
  }

  aplicarFiltros() {
    if (this.selectedMarcas.length > 0) this.dt.filter(this.selectedMarcas, 'marca', 'in');
    if (this.selectedPresentaciones.length > 0) this.dt.filter(this.selectedPresentaciones, 'presentacion', 'in');
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

  // --- MÉTODOS DE LA BAJA DE INVENTARIO ---

  abrirModalBaja(lote: any) {
    this.loteSeleccionado = lote;
    this.motivoBajaId = null; // Reseteamos el ID
    this.motivoEspecifico = '';
    this.mostrarModalBaja = true;
  }

  // Función de ayuda para saber si seleccionó la opción "Otro"
  esMotivoOtro(): boolean {
    const seleccionado = this.opcionesBaja.find(o => o.value === this.motivoBajaId);
    return seleccionado ? seleccionado.label === 'Otro' : false;
  }

  confirmarBaja() {
    // Validamos usando el nuevo ID y la función de ayuda
    if (!this.motivoBajaId || (this.esMotivoOtro() && !this.motivoEspecifico)) {
      alert("Por favor, seleccione un motivo y/o especifique los detalles.");
      return;
    }

    const payload = {
      idIngreso: this.loteSeleccionado.id_ingreso,
      idUsuario: this.authService.getCurrentUserId(),
      idMotivo: this.motivoBajaId, // Enviamos la llave foránea a MySQL
      detalle: this.esMotivoOtro() ? this.motivoEspecifico : null // Si no es "Otro", enviamos null
    };

    this.inventarioService.registrarBajaLote(payload).subscribe({
      next: (res: any) => {
        console.log(res.mensaje);
        this.mostrarModalBaja = false;
        this.cargarInventario();
      },
      error: (err: any) => {
        console.error("Error", err);
        alert("Ocurrió un error al intentar dar de baja el lote.");
      }
    });
  }
}