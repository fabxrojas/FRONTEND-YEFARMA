import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

import { IngresoProductoService } from '../../services/ingreso-producto.service';
import { OrdenCompraService } from '../../services/orden-compra.service';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recepcion-mercaderia',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputNumberModule, InputTextModule, SelectModule,
    DatePickerModule, ButtonModule, CardModule, ToastModule,
    TableModule, DialogModule, TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './recepcion-mercaderia.component.html'
})
export class RecepcionMercaderiaComponent implements OnInit {

  codigoOCBusqueda: string = '';
  ordenEncontrada: any = null;
  listaUnidadesDetalle: any[] = [];
  mostrarModalNuevaUnidad: boolean = false;
  listaUnidadesBase: any[] = [];
  nuevaUnidadBase: any = null;
  nuevaUnidadCantidad: number | null = null;

  // Variables para el modal de completado de datos físicos
  mostrarModalCompletar: boolean = false;
  detalleSeleccionado: any = null;
  datosFisicos: any = {
    cantidad_recibida: 0,
    unidad: null,
    fechaFabricacion: null,
    fechaVencimiento: null
  };

  listaIngresosPreparados: any[] = [];

  // Lista definitiva de unidades que NO se pueden subdividir en la farmacia
  unidadesIndivisibles: string[] = [
    'UNIDAD', 
    'TABLETA', 
    'PASTILLA', 
    'CÁPSULA', 
    'AMPOLLA', 
    'FRASCO',
    'SOBRE',       // Ej: Un sobre de Sal de Andrews no se abre para vender la mitad
    'SUPOSITORIO',
    'TUBO'         // Ej: Un tubo de crema no se vende por gramos
  ];


  constructor(
    private messageService: MessageService,
    private ingresoProductoService: IngresoProductoService,
    private ordenCompraService: OrdenCompraService,
    private productoService: ProductoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarUnidades();
    this.cargarUnidadesBase();
  }

  cargarUnidades() {
    this.ingresoProductoService.obtenerUnidadesDetalle().subscribe({
      next: (data) => {
        // Mapeamos los datos para crear la etiqueta visual que leerá el HTML
        this.listaUnidadesDetalle = data.map((ud: any) => ({
          ...ud,
          label: `${ud.unidadMedida?.nombre || 'UNIDAD'} x ${ud.cantidad} unidades`
        }));
      },
      error: (err) => console.error("Error al cargar catálogo de unidades:", err)
    });
  }

  cargarUnidadesBase() {
    this.ingresoProductoService.obtenerUnidadesMedidaBase().subscribe({
      next: (data) => this.listaUnidadesBase = data,
      error: () => console.error("Error al cargar unidades base")
    });
  }
  

  abrirModalNuevaUnidad() {
    this.nuevaUnidadBase = null;
    this.nuevaUnidadCantidad = null;
    this.mostrarModalNuevaUnidad = true;
  }


  buscarOrdenCompra() {
    if (!this.codigoOCBusqueda.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingrese un código de OC.' });
      return;
    }

    this.ordenCompraService.buscarPorCodigo(this.codigoOCBusqueda.trim().toUpperCase()).subscribe({
      next: (data) => {
        if (data) {
          if (data.estado?.descripcion === 'RECEPCIONADA') {
            this.messageService.add({ severity: 'info', summary: 'Aviso', detail: 'Esta orden ya fue recepcionada anteriormente.' });
            return;
          }
          this.ordenEncontrada = data;
          this.listaIngresosPreparados = []; // Reiniciamos si busca otra
          this.messageService.add({ severity: 'success', summary: 'Encontrada', detail: 'Orden de compra cargada.' });
        } else {
          this.ordenEncontrada = null;
          this.messageService.add({ severity: 'error', summary: 'No existe', detail: 'No se encontró la Orden de Compra.' });
        }
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al conectar con el servidor.' })
    });
  }

  abrirModalCompletar(detalle: any) {
    this.detalleSeleccionado = detalle;
    
    // Capturamos el ID de forma segura
    const idReferencia = detalle.id_detalle || detalle.idDetalle;
    
    // Buscamos si este producto ya fue preparado/verificado previamente
    const ingresoExistente = this.listaIngresosPreparados.find(i => i.idDetalleOC === idReferencia);

    if (ingresoExistente) {
      // MODO EDICIÓN: Recuperamos los datos guardados en la memoria temporal
      this.datosFisicos = {
        cantidad_recibida: ingresoExistente.cantidad_ingresada,
        fechaFabricacion: ingresoExistente.fechaFabricacion,
        fechaVencimiento: ingresoExistente.fechaVencimiento,
        
        // Buscamos la unidad exacta en la lista del Dropdown para que se autoseleccione
        unidad: this.listaUnidadesDetalle.find((u: any) => 
           u.unidadMedida?.id_unidad === ingresoExistente.unidad?.id_unidad && 
           u.cantidad === ingresoExistente.cant_por_presen
        ) || null
      };
    } else {
      // MODO NUEVO: Formulario limpio (sugiriendo la cantidad original de la OC)
      this.datosFisicos = {
        cantidad_recibida: detalle.cantidad || 0, 
        fechaFabricacion: null,
        fechaVencimiento: null,
        unidad: null
      };
    }

    this.mostrarModalCompletar = true;
  }

  guardarDatosFisicos() {
    // 1. Validación de campos obligatorios
    if (!this.datosFisicos.unidad || !this.datosFisicos.fechaFabricacion || !this.datosFisicos.fechaVencimiento || this.datosFisicos.cantidad_recibida <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete todos los campos del lote correctamente.' });
      return;
    }

    // 2. VALIDACIÓN DE LÓGICA DE FECHAS
    const fechaFab = new Date(this.datosFisicos.fechaFabricacion);
    const fechaVen = new Date(this.datosFisicos.fechaVencimiento);
    const fechaHoy = new Date();

    // Regla A: Vencimiento debe ser estrictamente mayor a Fabricación
    if (fechaVen <= fechaFab) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Fechas Incoherentes', 
        detail: 'La fecha de vencimiento debe ser posterior a la fecha de fabricación.' 
      });
      return; // Detenemos el guardado
    }

    // Regla B: Fabricación no puede ser en el futuro
    if (fechaFab > fechaHoy) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Fecha Inválida', 
        detail: 'La fecha de fabricación no puede estar en el futuro.' 
      });
      return; // Detenemos el guardado
    }

    // 3. Si pasa las validaciones, preparamos el guardado
    const idReferencia = this.detalleSeleccionado.id_detalle || this.detalleSeleccionado.idDetalle;
    const index = this.listaIngresosPreparados.findIndex(i => i.idDetalleOC === idReferencia);
    const idUsuarioActual = this.authService.getCurrentUserId();

    const ingresoParaBD = {
      idDetalleOC: idReferencia,
      ordenCompra: { idOrden: this.ordenEncontrada.idOrden },
      producto: this.detalleSeleccionado.producto,
      proveedor: this.ordenEncontrada.proveedor,
      marca: { id_marca: 1 }, 
      presentacion: { id_presentacion: 1 }, 
      unidad: this.datosFisicos.unidad.unidadMedida,
      cant_por_presen: this.datosFisicos.unidad.cantidad,
      cantidad_ingresada: this.datosFisicos.cantidad_recibida,
      fechaFabricacion: this.datosFisicos.fechaFabricacion, 
      fechaVencimiento: this.datosFisicos.fechaVencimiento, 
      usuario: { idUsuario: idUsuarioActual }
    };

    if (index !== -1) {
      this.listaIngresosPreparados[index] = ingresoParaBD;
    } else {
      this.listaIngresosPreparados.push(ingresoParaBD);
    }

    this.mostrarModalCompletar = false;
    this.messageService.add({ severity: 'success', summary: 'Lote Validado', detail: 'Datos físicos y fechas correctas.' });
  }

  guardarNuevaUnidad() {
    if (!this.nuevaUnidadBase || !this.nuevaUnidadCantidad || this.nuevaUnidadCantidad <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione la unidad base y una cantidad válida.' });
      return;
    }

    // CORRECCIÓN CLAVE: Usamos 'id_unidad' tal como está en tu base de datos
    const payload = {
      unidadMedida: { idUnidad: this.nuevaUnidadBase.idUnidad },
      cantidad: this.nuevaUnidadCantidad
    };

    this.ingresoProductoService.crearUnidadDetalle(payload).subscribe({
      next: (nuevaUnidadGuardada) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Presentación registrada.' });

        this.cargarUnidades();

        this.datosFisicos.unidad = {
          ...nuevaUnidadGuardada,
          label: `${this.nuevaUnidadBase.nombre} x ${this.nuevaUnidadCantidad} unidades`
        };

        this.mostrarModalNuevaUnidad = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La presentación ya existe o hubo un fallo en el servidor.' });
      }
    });
  }

  verificarSiEstaPreparado(idDetalle: number): boolean {
    return this.listaIngresosPreparados.some(i => i.idDetalleOC === idDetalle);
  }

  confirmarRecepcion() {
    if (this.listaIngresosPreparados.length !== this.ordenEncontrada.detalles.length) {
      this.messageService.add({ severity: 'warn', summary: 'Cuidado', detail: 'Falta validar algunos productos de la orden.' });
      return;
    }

    this.ingresoProductoService.registrarIngresoBatch(this.listaIngresosPreparados).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Recepción Exitosa', detail: `El inventario de Yefarma ha sido actualizado.` });

        // Aquí podrías llamar a tu OrdenCompraService para cambiar el estado de la OC a "RECEPCIONADA"

        this.ordenEncontrada = null;
        this.codigoOCBusqueda = '';
        this.listaIngresosPreparados = [];
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Fallo al actualizar el inventario.' })
    });
  }

  verificarUnidadUnica() {
    if (this.nuevaUnidadBase) {
      const nombreUnidad = this.nuevaUnidadBase.nombre.toUpperCase();
      
      // Si el nombre de la unidad está dentro de nuestra lista de indivisibles...
      if (this.unidadesIndivisibles.includes(nombreUnidad)) {
        this.nuevaUnidadCantidad = 1; // Lo forzamos a 1
      } else {
        this.nuevaUnidadCantidad = null; // Lo liberamos para CAJAS o BLISTERS
      }
    }
  }

  esUnidadIndivisible(): boolean {
    if (!this.nuevaUnidadBase) return false;
    return this.unidadesIndivisibles.includes(this.nuevaUnidadBase.nombre.toUpperCase());
  }
  

  limpiarFormulario() {
    this.ordenEncontrada = null;
    this.codigoOCBusqueda = '';
    this.listaIngresosPreparados = [];
  }
}