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

import { IngresoProductoService } from '../../services/ingreso-producto.service';
import { AuthService } from '../../services/auth.service';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-ingresar-producto',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AutoCompleteModule, InputNumberModule,
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
  presentaciones: any[] = []; // Para cargar las presentaciones en el selector del modal
  listaUnidadesDetalle: any[] = [];
  proveedores: any[] = [];
  unidades: any[] = []; //  Para cargar las unidades de medida en el selector del modal

  listaunidadesdetalle: any[] = []; // para la tabla unidades_detalle

  productoSeleccionado: any = null;
  resultadosBusqueda: any[] = [];

  // Arreglo para guardar los detalles pendientes antes de confirmar
  detallesIngreso: any[] = [];

  // Objeto mapeado al formulario HTML
  nuevoIngreso: any = {
    proveedor: null,
    marca: null,
    presentacion: null,
    unidad: null, // Captura la unidad de medida
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
  productoFijado: any = null;

  nuevaUnidadPresentacion: any = {
    unidadMedida: null,
    cantidad: null
  };

  constructor(
    private productoService: ProductoService,
    private messageService: MessageService,
    private ingresoProductoService: IngresoProductoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  abrirModalMarca() {
    // Esta llamada debe ir a /api/marcas mediante el servicio corregido
    this.productoService.getMarcas().subscribe({
      next: (data) => {
        this.todasLasMarcasBD = data;
        this.mostrarModalMarca = true; // Solo se abre si la petición tiene éxito
      },
      error: (err) => {
        console.error("Error al abrir modal:", err);
        this.mostrarModalMarca = true;
      }
    });
  }

  fijarProducto(event: any) {
    this.productoFijado = event.value || event;
    // Cargar las marcas asociadas a este producto específico desde la BD
    this.productoService.getMarcasPorProducto(this.productoFijado.id_producto).subscribe(data => {
      this.marcasDelProducto = data;
    });
  }

  cargarCatalogos() {
    // 1. Marcas
    this.productoService.getMarcas().subscribe(data => this.marcas = data);

    // 2. Presentaciones Generales (Tabla 'presentacion')
    this.productoService.getPresentaciones().subscribe(data => {
      this.presentaciones = data; //[cite: 1]
    });

    // 3. Unidades de Medida Maestras (Tabla 'unidad_medida')
    this.productoService.getUnidadesMedida().subscribe(data => {
      this.unidades = data; //[cite: 2]
    });

    // 4. Unidades Detalle (Tabla 'unidades_detalle')
    this.productoService.getUnidadesDetalle().subscribe(data => {
      this.listaUnidadesDetalle = data.map(ud => ({
        ...ud,
        label: `${ud.unidadMedida.abreviatura} x ${ud.cantidad}` //[cite: 1, 2]
      }));
    });

    // 5. Proveedores Reales
    this.productoService.getProveedores().subscribe(data => {
      this.proveedores = data; //[cite: 3]
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
    // VALIDACIÓN ESTRICTA: Exige Proveedor y Presentación
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
      usuario: { id_usuario: idUsuarioActual },
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


  // 3. Envía TODO el arreglo a la base de datos
  confirmarIngresosBatch() {
    if (this.detallesIngreso.length === 0) {
      this.mostrarError('No hay detalles pendientes para registrar en el inventario.');
      return;
    }

    this.ingresoProductoService.registrarIngresoBatch(this.detallesIngreso).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Se han registrado ${this.detallesIngreso.length} lote(s) en el almacén.`
        });

        // Limpiamos todo tras un guardado exitoso
        this.cancelarIngreso();
      },
      error: (err: any) => {
        console.error('Error del servidor:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar el lote de ingresos en la base de datos.'
        });
      }
    });
  }

  cargarMarcasDelProducto(idProducto: number) {
    this.productoService.getMarcasPorProducto(idProducto).subscribe({
      next: (data) => {
        this.marcasDelProducto = data; // Actualiza el combo principal
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
    this.mostrarModalUnidad = true;
  }

  guardarNuevaPresentacion() {
    if (!this.nuevaUnidadPresentacion.unidadMedida || !this.nuevaUnidadPresentacion.cantidad) {
      this.mostrarError('Debe seleccionar una unidad y especificar la cantidad.');
      return;
    }

    const payload = {
      id_unid_medi: this.nuevaUnidadPresentacion.unidadMedida.idUnidad,
      cantidad: this.nuevaUnidadPresentacion.cantidad
    };

    this.productoService.guardarUnidadDetalle(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Nueva presentación creada correctamente.'
        });
        this.mostrarModalUnidad = false;

        // Limpiar datos del modal secundario
        this.nuevaUnidadPresentacion = { unidadMedida: null, cantidad: null };

        // Refrescar el catálogo de presentaciones en el modal principal
        this.cargarPresentaciones();
      },
      error: (err) => {
        this.mostrarError('Error al guardar la presentación: Es posible que ya exista.');
      }
    });
  }

  // Método auxiliar para refrescar el combo de presentaciones
  cargarPresentaciones() {
    this.productoService.getPresentaciones().subscribe(data => {
      // Mapeamos para crear el 'label' que se ve en el HTML (ej: "CAJA x 10.00")
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

  // 5. Validaciones estrictas
  validarDatos(): boolean {
    if (!this.productoSeleccionado) {
      this.mostrarError('Debe buscar y seleccionar un medicamento.');
      return false;
    }
    // Validamos que la unidad también esté seleccionada
    if (!this.nuevoIngreso.proveedor || !this.nuevoIngreso.marca || !this.nuevoIngreso.presentacion || !this.nuevoIngreso.unidad) {
      this.mostrarError('Por favor, complete el Proveedor, Marca, Presentación y Unidad de Medida.');
      return false;
    }
    if (!this.nuevoIngreso.cantidad_ingresada || this.nuevoIngreso.cantidad_ingresada <= 0 ||
      !this.nuevoIngreso.cant_por_presen || this.nuevoIngreso.cant_por_presen <= 0) {
      this.mostrarError('Las cantidades deben ser mayores a cero.');
      return false;
    }
    if (!this.nuevoIngreso.fechaFabricacion || !this.nuevoIngreso.fechaVencimiento) {
      this.mostrarError('Debe ingresar las fechas de fabricación y vencimiento.');
      return false;
    }
    if (this.nuevoIngreso.fechaVencimiento <= this.nuevoIngreso.fechaFabricacion) {
      this.mostrarError('La fecha de vencimiento debe ser posterior a la de fabricación.');
      return false;
    }
    return true;
  }

  private mostrarError(mensaje: string) {
    this.messageService.add({ severity: 'error', summary: 'Atención', detail: mensaje });
  }
}