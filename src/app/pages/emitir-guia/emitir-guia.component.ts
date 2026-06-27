import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importaciones de PrimeNG
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

// Servicios del proyecto
import { GuiaRemisionService } from '../../services/guia-remision.service';
import { ProductoService } from '../../services/producto.service';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-emitir-guia',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AutoCompleteModule, SelectModule,
    ButtonModule, InputTextModule, InputNumberModule, TableModule,
    CardModule, DatePickerModule, ToastModule, TooltipModule, DialogModule
  ],
  providers: [MessageService],
  templateUrl: './emitir-guia.component.html',
  styleUrls: ['./emitir-guia.component.css']
})
export class EmitirGuiaComponent implements OnInit {

  // Catálogos
  clientes: any[] = [];
  establecimientos: any[] = [];
  estados: any[] = [];
  motivos: any[] = [];

  // Autocompletado de productos
  productoSeleccionado: any = null;
  marcas: any[] = [];
  resultadosMarcas: any[] = [];
  marcaSeleccionada: any = '';
  resultadosBusqueda: any[] = [];
  cantidadAgregar: number = 1;
  unidadesMedida: any[] = [];
  listaPresentaciones: any[] = [];

  // Variables para el resumen
  mostrarResum: boolean = false;
  guiaGenerada: any = null;
  unidadSeleccionada: any = null;
  presentacionSeleccionada: any = null;

  // Objeto principal de la guía
  nuevaGuia: any = {
    cliente: null,
    establecimiento: null,
    estado: null,
    motivo: null,
    puntoPartida: '',
    puntoLlegada: '',
    placaVehiculo: '',
    licenciaConductor: '',
    fechaTraslado: new Date(),
    detalles: []
  };
  pesoBrutoTotal: number = 0;

  constructor(
    private guiaService: GuiaRemisionService,
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarMarcas();
  }

  cargarMarcas() {
    this.productoService.getMarcas().subscribe({
      next: (data) => {
        this.marcas = data;
        this.resultadosMarcas = [...this.marcas];
      },
      error: (err) => console.error("Error cargando marcas:", err)
    });
  }

  filtrarMarcas(event: any) {
    if (!event.query) {
      this.resultadosMarcas = [...this.marcas];
    } else {
      const query = event.query.toLowerCase();
      this.resultadosMarcas = this.marcas.filter(m => m.nombre && m.nombre.toLowerCase().includes(query));
    }
  }

  cargarCatalogos() {
    this.clienteService.getClientes().subscribe(data => this.clientes = data);
    this.productoService.getUnidadesMedida().subscribe(data => this.unidadesMedida = data);
    this.productoService.getPresentaciones().subscribe(data => this.listaPresentaciones = data);
    this.productoService.getMotivosTraslado().subscribe(data => this.motivos = data);

    // Yefarma - Origen
    this.guiaService.getEstablecimientos().subscribe((data: any[]) => {
      this.establecimientos = data;
      if (data && data.length > 0) {
        const sedeBotica = data[0];
        this.nuevaGuia.establecimiento = sedeBotica;
        this.nuevaGuia.puntoPartida = sedeBotica.direccion;
      }
    });

    this.guiaService.getEstados().subscribe(data => {
      this.estados = data;
      this.nuevaGuia.estado = this.estados.find((e: any) => e.descripcion === 'EMITIDO');
    });
  }

  onClienteSelect(event: any) {
    const clienteObj = event.value;
    if (clienteObj && clienteObj.direccion) {
      this.nuevaGuia.puntoLlegada = clienteObj.direccion;
    }
  }

  buscarProducto(event: any) {
    this.productoService.buscarPorNombre(event.query).subscribe(data => this.resultadosBusqueda = data);
  }

  agregarProductoALaGuia() {
    if (!this.productoSeleccionado || !this.marcaSeleccionada || !this.presentacionSeleccionada || !this.unidadSeleccionada || this.cantidadAgregar === null || this.cantidadAgregar === undefined) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Complete todos los campos del producto.' });
      return;
    }

    // 2. Validar que la cantidad sea estrictamente mayor a cero
    if (this.cantidadAgregar <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'La cantidad debe ser mayor a cero.' });
      return;
    }

    // 3. Validar el cliente
    if (!this.nuevaGuia.cliente) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar un cliente (Destino).' });
      return;
    }

    const marcaTexto = (this.marcaSeleccionada.nombre || this.marcaSeleccionada || '').toString().trim().toUpperCase();
    const presentacionTexto = (this.presentacionSeleccionada.nombre || this.presentacionSeleccionada || '').toString().trim().toUpperCase();

    const pesoUnitario = this.productoSeleccionado.peso_unitario || this.productoSeleccionado.pesoUnitario || 0;
    const pesoEnMg = this.cantidadAgregar * pesoUnitario;
    const pesoEnKg = pesoEnMg / 1000000;

    const nuevoItem = {
      producto: { ...this.productoSeleccionado, producto: this.productoSeleccionado.nombre || this.productoSeleccionado.producto },
      marcaSolicitada: marcaTexto,
      presentacion: { ...this.presentacionSeleccionada, nombre: presentacionTexto },
      unidadMedida: { ...this.unidadSeleccionada, abreviatura: this.unidadSeleccionada.Abreviatura || this.unidadSeleccionada.abreviatura || this.unidadSeleccionada.nombre },
      cantidad: this.cantidadAgregar,
      pesoSubtotal: pesoEnKg
    };

    this.nuevaGuia.detalles.push(nuevoItem);
    this.calcularPesoTotalGuia();
    this.limpiarCamposMercaderia();
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto agregado a la guía.' });
  }

  eliminarItem(index: number) {
    this.nuevaGuia.detalles.splice(index, 1);
    this.calcularPesoTotalGuia();
  }

  calcularPesoTotalGuia() {
    this.pesoBrutoTotal = this.nuevaGuia.detalles.reduce((sum: number, item: any) => sum + (item.pesoSubtotal || 0), 0);
  }

  guardarGuiaCompleta() {
    if (!this.nuevaGuia.cliente || !this.nuevaGuia.establecimiento || !this.nuevaGuia.motivo || !this.nuevaGuia.fechaTraslado) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete Cliente, Motivo y Fecha de Traslado.' });
      return;
    }

    if (this.nuevaGuia.detalles.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La guía debe tener al menos un producto.' });
      return;
    }

    const guiaParaEnviar = {
      ...this.nuevaGuia,
      fechaTraslado: this.formatearFecha(this.nuevaGuia.fechaTraslado),
      pesoBrutoTotal: this.pesoBrutoTotal
    };

    this.guiaService.guardarGuia(guiaParaEnviar).subscribe({
      next: (res) => {
        this.guiaGenerada = res;
        this.mostrarResum = true;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Guía generada correctamente` });
      },
      error: (err) => {
        console.error('Error al persistir la guía:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la guía' });
      }
    });
  }

  descargarPDF() {
    if (this.guiaGenerada && this.guiaGenerada.id_guia) {
      // Abre el PDF generado en una nueva pestaña
      window.open(`http://localhost:8081/api/guias-remision/pdf/${this.guiaGenerada.id_guia}`, '_blank');
    }
  }

  cerrarModalResumen() {
    this.mostrarResum = false;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevaGuia = {
      cliente: null,
      establecimiento: this.nuevaGuia.establecimiento,
      puntoPartida: this.nuevaGuia.establecimiento?.direccion || '',
      puntoLlegada: '',
      motivo: null,
      fechaTraslado: new Date(),
      placaVehiculo: '',
      licenciaConductor: '',
      detalles: []
    };
    this.limpiarCamposMercaderia();
    this.pesoBrutoTotal = 0;
  }

  limpiarCamposMercaderia() {
    this.productoSeleccionado = null;
    this.marcaSeleccionada = '';
    this.presentacionSeleccionada = null;
    this.unidadSeleccionada = null;
    this.cantidadAgregar = 1;
  }

  private formatearFecha(fecha: any): string {
    if (fecha instanceof Date) return fecha.toISOString().split('T')[0];
    return fecha;
  }
}