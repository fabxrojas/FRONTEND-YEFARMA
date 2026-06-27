import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';

import { OrdenCompraService } from '../../services/orden-compra.service';
import { ProveedorService } from '../../services/proveedor.service';
import { ProductoService } from '../../services/producto.service';
import { TipoPagoService } from '../../services/tipo-pago.service';
import { GuiaRemisionService } from '../../services/guia-remision.service';


@Component({
  selector: 'app-orden-compra',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AutoCompleteModule, SelectModule,
    ButtonModule, InputTextModule, InputNumberModule, TableModule, TooltipModule, 
    CardModule, DatePickerModule, ToastModule, DialogModule
  ],
  providers: [MessageService],
  templateUrl: './orden-compra.component.html'
})
export class OrdenCompraComponent implements OnInit {

  // Catálogos
  proveedores: any[] = [];
  tiposPago: any[] = [];
  marcas: any[] = [];
  presentaciones: any[] = [];
  unidades: any[] = [];

  establecimientoActivo: any = null;

  productoSeleccionado: any = null;
  resultadosBusqueda: any[] = [];

  // Combos seleccionados
  marcaSeleccionada: any = null;
  presentacionSeleccionada: any = null;
  unidadSeleccionada: any = null;

  cantidadInput: number = 1;
  precioUnitarioInput: number = 0;
  subtotalCalculado: number = 0;

  nuevaOrden: any = {
    proveedor: null,
    tipoPago: null,
    fechaEsperada: null,
    observaciones: '',
    detalles: []
  };
  totalOrden: number = 0;
  mostrarResum: boolean = false;
  ordenGenerada: any = null;

  constructor(
    private ordenCompraService: OrdenCompraService,
    private proveedorService: ProveedorService,
    private productoService: ProductoService,
    private tipoPagoService: TipoPagoService,
    private guiaService: GuiaRemisionService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.proveedorService.getProveedores().subscribe(data => this.proveedores = data);
    this.tipoPagoService.getTiposPago().subscribe(data => this.tiposPago = data);
    // Cargamos los catálogos que ya tienes en tu base de datos
    this.productoService.getMarcas().subscribe(data => this.marcas = data);
    this.productoService.getPresentaciones().subscribe(data => this.presentaciones = data);
    this.productoService.getUnidadesMedida().subscribe(data => this.unidades = data);

    this.guiaService.getEstablecimientos().subscribe((data: any[]) => {
      if (data && data.length > 0) {
        this.establecimientoActivo = data[0]; // Selecciona la sede principal
      }
    });
  }

  buscarProducto(event: any) {
    this.productoService.buscarPorNombre(event.query).subscribe(data => {
      this.resultadosBusqueda = data;
    });
  }

  onProductoSelect(event: any) {
    const producto = event.value;
    this.precioUnitarioInput = producto.precio || 0;
    this.calcularSubtotalFila();
  }

  calcularSubtotalFila() {
    this.subtotalCalculado = this.cantidadInput * this.precioUnitarioInput;
  }

  agregarDetalle() {
    // 1. Validaciones Estrictas Individuales
    if (!this.productoSeleccionado) {
      this.messageService.add({ severity: 'warn', summary: 'Falta Producto', detail: 'Debe buscar y seleccionar un medicamento.' });
      return;
    }
    if (!this.marcaSeleccionada) {
      this.messageService.add({ severity: 'warn', summary: 'Falta Marca', detail: 'Debe seleccionar la marca del catálogo.' });
      return;
    }
    if (!this.presentacionSeleccionada) {
      this.messageService.add({ severity: 'warn', summary: 'Falta Presentación', detail: 'Debe seleccionar la presentación del catálogo.' });
      return;
    }
    if (!this.unidadSeleccionada) {
      this.messageService.add({ severity: 'warn', summary: 'Falta Unidad', detail: 'Debe seleccionar la unidad de medida.' });
      return;
    }
    if (this.cantidadInput === null || this.cantidadInput === undefined || this.cantidadInput <= 0 || this.cantidadInput > 9999) {
      this.messageService.add({ severity: 'warn', summary: 'Cantidad Inválida', detail: 'La cantidad debe ser un número mayor a cero y menor.' });
      return;
    }
    if (this.precioUnitarioInput === null || this.precioUnitarioInput === undefined || this.precioUnitarioInput < 0) {
      this.messageService.add({ severity: 'warn', summary: 'Precio Inválido', detail: 'El precio unitario no es válido.' });
      return;
    }

    // 2. Extracción segura de los nombres de los objetos seleccionados
    const nombreMarca = this.marcaSeleccionada.nombre;
    const nombrePresentacion = this.presentacionSeleccionada.nombre;
    const nombreUnidad = this.unidadSeleccionada.abreviatura;

    // 3. Creación del objeto detalle para la tabla
    const nuevoDetalle = {
      producto: this.productoSeleccionado,
      marcaSolicitada: nombreMarca.toUpperCase(),
      presentacionSolicitada: nombrePresentacion.toUpperCase(),
      unidadSolicitada: nombreUnidad.toUpperCase(),
      cantidad: this.cantidadInput,
      precioUnitario: this.precioUnitarioInput,
      subtotal: this.subtotalCalculado
    };

    // 4. Agregar a la lista y recalcular totales
    this.nuevaOrden.detalles.push(nuevoDetalle);
    this.calcularTotal();

    // 5. Limpiar solo la fila de ingreso (mantiene el proveedor y fechas intactos)
    this.limpiarInputsDetalle();
  }

  eliminarDetalle(index: number) {
    this.nuevaOrden.detalles.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalOrden = this.nuevaOrden.detalles.reduce((acc: number, item: any) => acc + item.subtotal, 0);
  }

  limpiarInputsDetalle() {
    this.productoSeleccionado = null;
    this.marcaSeleccionada = null;
    this.presentacionSeleccionada = null;
    this.unidadSeleccionada = null;
    this.cantidadInput = 1;
    this.precioUnitarioInput = 0;
    this.subtotalCalculado = 0;
  }

  guardarOrden() {
    if (!this.nuevaOrden.proveedor || !this.nuevaOrden.tipoPago || !this.nuevaOrden.fechaEsperada) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete los datos del proveedor, pago y entrega.' });
      return;
    }
    if (this.nuevaOrden.detalles.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Agregue al menos un producto a la orden.' });
      return;
    }

    const payload = {
      proveedor: this.nuevaOrden.proveedor,
      establecimiento: this.establecimientoActivo,
      tipoPago: this.nuevaOrden.tipoPago,
      fechaEsperada: this.formatearFecha(this.nuevaOrden.fechaEsperada),
      observaciones: this.nuevaOrden.observaciones,
      detalles: this.nuevaOrden.detalles
    };

    this.ordenCompraService.crearOrden(payload).subscribe({
      next: (res) => {
        this.ordenGenerada = res;
        this.mostrarResum = true;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Orden generada correctamente' });
        //this.limpiarFormulario();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la orden' })
    });
  }

  limpiarFormulario() {
    this.nuevaOrden = { proveedor: null, tipoPago: null, fechaEsperada: null, observaciones: '', detalles: [] };
    this.totalOrden = 0;
    this.limpiarInputsDetalle();
  }

  cerrarModalResumen() {
    this.mostrarResum = false;
    this.limpiarFormulario();
  }

  private formatearFecha(fecha: any): string {
    if (fecha instanceof Date) return fecha.toISOString().split('T')[0];
    return fecha;
  }
}