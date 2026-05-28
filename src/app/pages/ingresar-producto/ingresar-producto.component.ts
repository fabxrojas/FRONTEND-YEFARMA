import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ProductoService } from '../../services/producto.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';

import { IngresoProductoService } from '../../services/ingreso-producto.service';
import { AuthService } from '../../services/auth.service';
import { DialogModule } from 'primeng/dialog';

import { ProveedorService } from '../../services/proveedor.service';

@Component({
  selector: 'app-ingresar-producto',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AutoCompleteModule, InputNumberModule, DropdownModule,
    DatePickerModule, SelectModule, ButtonModule, CardModule, ToastModule,
    TableModule, DialogModule, RadioButtonModule
  ],
  providers: [MessageService],
  templateUrl: './ingresar-producto.component.html',
  styleUrls: ['./ingresar-producto.component.css']
})
export class IngresarProductoComponent implements OnInit {
  // Arreglos para los selectores
  marcas: any[] = [];
  presentaciones: any[] = [];
  listaUnidadesDetalle: any[] = [];
  proveedores: any[] = [];
  unidadesMedida: any[] = [];

  listaunidadesdetalle: any[] = [];

  productoSeleccionado: any = null;
  productoFijado: any = null;
  resultadosBusqueda: any[] = [];

  // Arreglo para guardar los detalles pendientes antes de confirmar
  detallesIngreso: any[] = [];

  get listaDetallesTemporales(): any[] {
    if (!this.productoSeleccionado) return [];
    return this.detallesPorProducto.get(this.productoSeleccionado.id_producto) || [];
  }
  detallesPorProducto: Map<number, any[]> = new Map(); // Mapa para almacenar detalles por producto
  nuevoIngreso: any = {
    proveedor: null,
    marca: null,
    presentacion: null,
    unidad: null,
    cantidad_ingresada: null,
    cant_por_presen: null,
    fechaFabricacion: null,
    fechaVencimiento: null
  };

  mostrarModalDetalles: boolean = false;
  mostrarModalMarca: boolean = false;
  mostrarModalUnidad: boolean = false;
  tipoOperacionMarca: string = 'existente';
  nombreNuevaMarca: string = '';
  marcaParaAsociar: any = null;
  todasLasMarcasBD: any[] = [];
  marcasDelProducto: any[] = [];


  nuevaUnidadPresentacion: any = {
    unidadMedida: null,
    cantidad: null
  };

  constructor(
    private productoService: ProductoService,
    private messageService: MessageService,
    private ingresoProductoService: IngresoProductoService,
    private authService: AuthService,
    private proveedorService: ProveedorService
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarProveedores();
    this.cargarMarcas();
  }

  limpiarBuscador() {
    this.productoSeleccionado = null;
  }


  abrirModalMarca() {
    this.productoService.getMarcas().subscribe({
      next: (data) => {
        this.todasLasMarcasBD = data;
        this.mostrarModalMarca = true;
      },
      error: (err) => {
        console.error("Error al abrir modal:", err);
        this.mostrarModalMarca = true;
      }
    });
  }

  cargarMarcas() {
    this.productoService.getMarcas().subscribe({
      next: (data) => {
        this.marcas = data;
        console.log('Marcas desde la BD:', data);
      },
      error: (err) => {
        console.error('Error al cargar marcas:', err);
      }
    });
  }

  cargarProveedores() {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        console.log('Proveedores listos para ingreso:', this.proveedores);
      },
      error: (err) => {
        console.error('Error al obtener proveedores:', err);
      }
    });
  }

  fijarProducto(event: any) {
    const productoData = event.value || event;

    if (!productoData || !productoData.id_producto) return;

    this.productoFijado = { ...productoData };

    this.productoSeleccionado = this.productoFijado;

    this.productoService.getMarcasPorProducto(this.productoFijado.id_producto).subscribe({
      next: (data) => {
        this.marcasDelProducto = data;
      },
      error: (err) => {
        console.error("Error al cargar marcas:", err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las marcas del producto.'
        });
      }
    });
  }

  cargarCatalogos() {
    this.productoService.getMarcas().subscribe(data => this.marcas = data);

    this.productoService.getPresentaciones().subscribe(data => {
      this.presentaciones = data;
    });

    this.productoService.getUnidadesMedida().subscribe({
      next: (data) => {
        this.unidadesMedida = data;
        console.log("Unidades cargadas para el combo:", data);
      },
      error: (err) => console.error("Error al traer unidades", err)
    });

    this.productoService.getUnidadesDetalle().subscribe({
      next: (data) => {
        this.listaUnidadesDetalle = data.map(ud => ({
          ...ud,
          label: `${ud.unidadMedida.nombre} x ${ud.cantidad} unidades`
        }));
      },
      error: (err) => console.error("Error al cargar unidades", err)
    });

    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        console.log('Proveedores cargados en catálogo:', this.proveedores);
      },
      error: (err) => {
        console.error('Error al cargar proveedores en el catálogo:', err);
      }
    });
  }

  buscarProducto(event: any) {
    const query = event.query;
    this.productoService.buscarPorNombre(query).subscribe(data => {
      this.resultadosBusqueda = data;
    });
  }

  abrirModalDetalles() {
    if (!this.productoSeleccionado) {
      this.mostrarError('Debe buscar y seleccionar un producto primero.');
      return;
    }
    if (!this.nuevoIngreso.proveedor || !this.nuevoIngreso.presentacion) {
      this.mostrarError('Debe seleccionar el Proveedor y la Presentación antes de ingresar los detalles.');
      return;
    }

    this.mostrarModalDetalles = true;
  }


  agregarDetalle() {
    // Validamos solo los campos que están dentro del modal
    if (!this.nuevoIngreso.marca || !this.nuevoIngreso.unidad || !this.nuevoIngreso.cantidad_ingresada || !this.nuevoIngreso.fechaFabricacion || !this.nuevoIngreso.fechaVencimiento) {
      this.mostrarError('Por favor, complete todos los campos del detalle.');
      return;
    }

    const idUsuarioActual = this.authService.getCurrentUserId();

    const detalle = {
      producto: this.productoSeleccionado,
      proveedor: this.nuevoIngreso.proveedor,
      marca: this.nuevoIngreso.marca,
      presentacion: this.nuevoIngreso.presentacion,
      unidad: this.nuevoIngreso.unidad,
      usuario: { idUsuario: idUsuarioActual },
      cantidad_ingresada: this.nuevoIngreso.cantidad_ingresada,
      cant_por_presen: this.nuevoIngreso.cant_por_presen,
      fechaFabricacion: this.nuevoIngreso.fechaFabricacion,
      fechaVencimiento: this.nuevoIngreso.fechaVencimiento
    };

    this.detallesIngreso.push(detalle);
    this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Detalle guardado temporalmente.' });

    // Limpiamos SOLO los campos del modal para el siguiente lote
    this.nuevoIngreso.marca = null;
    this.nuevoIngreso.unidad = null;
    this.nuevoIngreso.cantidad_ingresada = null;
    this.nuevoIngreso.cant_por_presen = null;
    this.nuevoIngreso.fechaFabricacion = null;
    this.nuevoIngreso.fechaVencimiento = null;

    // Cerramos el modal
    this.mostrarModalDetalles = false;
  }

  // 2. Elimina un detalle si el usuario se equivocó
  eliminarDetalle(index: number) {
    this.detallesIngreso.splice(index, 1);
  }

  guardarTemporalmente() {
    if (!this.validarDatos()) {
      return;
    }

    const idProd = this.productoSeleccionado.id_producto;
    const detallesActuales = this.detallesPorProducto.get(idProd) || [];

    console.log("El AuthService estaba devolviendo:", this.authService.getCurrentUserId());

    const idUsuarioActual = this.authService.getCurrentUserId();

    const nuevoDetalle = {
      producto: this.productoSeleccionado,
      proveedor: this.nuevoIngreso.proveedor,
      presentacion: this.nuevoIngreso.presentacion,
      marca: this.nuevoIngreso.marca,
      unidad: this.nuevoIngreso.unidad.unidadMedida,
      cant_por_presen: this.nuevoIngreso.unidad.cantidad,
      cantidad_ingresada: this.nuevoIngreso.cantidadRecibida,
      lote: null,
      fechaFabricacion: this.nuevoIngreso.fechaFabricacion,
      fechaVencimiento: this.nuevoIngreso.fechaVencimiento,
      usuario: { idUsuario: idUsuarioActual }
    };

    this.detallesPorProducto.set(idProd, [...detallesActuales, nuevoDetalle]);
    this.mostrarModalDetalles = false;
    this.limpiarFormularioDetalle();
  }

  eliminarDetalleTemporal(index: number) {
    const idProd = this.productoSeleccionado.id_producto;
    const detalles = this.detallesPorProducto.get(idProd);

    if (detalles) {
      detalles.splice(index, 1);
      if (detalles.length === 0) {
        this.detallesPorProducto.delete(idProd);
      } else {
        this.detallesPorProducto.set(idProd, [...detalles]);
      }
    }
  }

  limpiarFormularioDetalle() {
    this.nuevoIngreso = {
      presentacion: null,
      marca: null,
      unidad: null,
      cantidadRecibida: null,
      fechaFabricacion: null,
      fechaVencimiento: null
    };
  }

  // 3. Envía TODO el arreglo a la base de datos
  confirmarIngresosBatch() {
    const detallesAEnviar = this.listaDetallesTemporales;

    if (detallesAEnviar.length === 0) {
      this.mostrarError('No hay detalles para el producto seleccionado.');
      return;
    }

    this.ingresoProductoService.registrarIngresoBatch(detallesAEnviar).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Ingreso registrado para ${this.productoSeleccionado.producto}`
        });

        // Limpiamos solo los detalles de este producto ya procesado
        this.detallesPorProducto.delete(this.productoSeleccionado.id_producto);

        // Opcional: limpiar selección para obligar a buscar otro
        this.cancelarIngreso();
      }
    });
  }

  cargarMarcasDelProducto(idProducto: number) {
    this.productoService.getMarcasPorProducto(idProducto).subscribe({
      next: (data) => {
        this.marcasDelProducto = data;
      },
      error: (err) => {
        console.error('Error al cargar marcas del producto:', err);
      }
    });
  }

  ejecutarAccionMarca() {
    if (this.tipoOperacionMarca === 'nueva') {
      if (!this.nombreNuevaMarca) {
        this.mostrarError('Ingrese el nombre de la nueva marca.');
        return;
      }
      const payload = {
        nombreMarca: this.nombreNuevaMarca,
        idProducto: this.productoFijado.id_producto
      };
      this.productoService.guardarYAsociarMarca(payload).subscribe(() => {
        this.finalizarAccionMarca('Marca creada y asociada con éxito.');
      });
    } else {
      if (!this.marcaParaAsociar) {
        this.mostrarError('Seleccione una marca existente.');
        return;
      }
      const payloadAsoc = {
        idMarca: this.marcaParaAsociar.id_marca,
        idProducto: this.productoFijado.id_producto
      };
      this.productoService.asociarMarcaExistente(payloadAsoc).subscribe(() => {
        this.finalizarAccionMarca('Marca asociada al producto con éxito.');
      });
    }
  }


  // Método auxiliar para limpiar y refrescar tras el guardado
  private finalizarAccionMarca(mensaje: string) {
    this.mostrarModalMarca = false;
    this.nombreNuevaMarca = '';
    this.marcaParaAsociar = null;
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: mensaje });

    // Recargamos el combo principal con las nuevas marcas del producto
    if (this.productoFijado && this.productoFijado.id_producto) {
      this.cargarMarcasDelProducto(this.productoFijado.id_producto);
    }

    // Actualizamos la lista global de marcas por si acaso
    this.productoService.getMarcas().subscribe(data => this.todasLasMarcasBD = data);
  }

  abrirModalNuevaPresentacion() {
    this.nuevaUnidadPresentacion = { unidadMedida: null, cantidad: null };
    this.mostrarModalUnidad = true;
  }

  guardarNuevaPresentacion() {
    const data = {
      unidadMedida: this.nuevaUnidadPresentacion.unidadMedida,
      cantidad: this.nuevaUnidadPresentacion.cantidad
    };

    this.productoService.guardarUnidadDetalle(data).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Presentación creada correctamente' });

        // 1. Formateamos el objeto que viene del servidor para que tenga el 'label' que espera el combo
        const itemNuevo = {
          ...res,
          label: `${res.unidadMedida.nombre} x ${res.cantidad} unidades`
        };

        // 2. Actualizamos la lista local (usando spread operator para refrescar la referencia)
        this.listaUnidadesDetalle = [...this.listaUnidadesDetalle, itemNuevo];

        // 3. SELECCIÓN AUTOMÁTICA: Asignamos el nuevo objeto al combo del modal principal
        this.nuevoIngreso.unidad = itemNuevo;

        // 4. Limpieza y cierre de modales
        this.mostrarModalUnidad = false;
        this.nuevaUnidadPresentacion = { unidadMedida: null, cantidad: null };
      },
      error: (err) => console.error('Error al guardar:', err)
    });
  }

  // Método auxiliar para refrescar el combo de presentaciones
  cargarPresentaciones() {
    this.productoService.getPresentaciones().subscribe(data => {
      this.presentaciones = data.map(p => ({
        ...p,
        label: `${p.unidadMedida.nombre} x ${p.cantidad}`
      }));
    });
  }

  // 4. Limpia absolutamente todo
  cancelarIngreso() {
    this.productoSeleccionado = null;
    this.detallesIngreso = [];
    this.productoFijado = null;
    this.nuevoIngreso = {
      proveedor: null,
      marca: null,
      presentacion: null,
      unidad: null,
      cantidad_ingresada: null,
      cant_por_presen: null,
      fechaFabricacion: null,
      fechaVencimiento: null
    };
  }

  cargarDatosDesdeGuia(guia: any) {
    // 1. Cargamos datos generales
    this.nuevoIngreso.proveedor = guia.proveedor;

    // 2. Iteramos los detalles y los agregamos a la lista temporal
    guia.detalles.forEach((detalle: any) => {
      this.detallesIngreso.push({
        producto: detalle.producto,
        marca: detalle.marcaSolicitada,
        presentacion: detalle.presentacion,
        cantidad_ingresada: detalle.cantidad,
        unidad: detalle.unidadMedida
      });
    });
  }

  // 5. Validaciones estrictas
  validarDatos(): boolean {
    if (!this.productoSeleccionado) {
      this.mostrarError('Debe buscar y seleccionar un medicamento.');
      return false;
    }

    if (!this.nuevoIngreso.proveedor || !this.nuevoIngreso.marca ||
      !this.nuevoIngreso.presentacion || !this.nuevoIngreso.unidad) {
      this.mostrarError('Complete Proveedor, Marca, Presentación y Unidad.');
      return false;
    }

    if (!this.nuevoIngreso.cantidadRecibida || this.nuevoIngreso.cantidadRecibida <= 0 ||
      !this.nuevoIngreso.unidad.cantidad || this.nuevoIngreso.unidad.cantidad <= 0) {
      this.mostrarError('Las cantidades y las unidades por presentación deben ser mayores a cero.');
      return false;
    }

    const fab = new Date(this.nuevoIngreso.fechaFabricacion).getTime();
    const ven = new Date(this.nuevoIngreso.fechaVencimiento).getTime();

    if (ven <= fab) {
      this.mostrarError('La fecha de vencimiento debe ser posterior a la de fabricación.');
      return false;
    }

    return true;
  }

  private mostrarError(mensaje: string) {
    this.messageService.add({ severity: 'error', summary: 'Error  ', detail: mensaje });
  }


}
