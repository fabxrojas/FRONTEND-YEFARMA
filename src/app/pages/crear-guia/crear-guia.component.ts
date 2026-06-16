import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { ProveedorService } from '../../services/proveedor.service';

@Component({
  selector: 'app-crear-guia',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AutoCompleteModule, SelectModule,
    ButtonModule, InputTextModule, InputNumberModule, TableModule,
    CardModule, DatePickerModule, ToastModule, TooltipModule, DialogModule
  ],
  providers: [MessageService],
  templateUrl: './crear-guia.component.html',
  styleUrls: ['./crear-guia.component.css']
})
export class CrearGuiaComponent implements OnInit, OnDestroy {
  // Catálogos
  proveedores: any[] = [];
  establecimientos: any[] = [];
  estados: any[] = [];

  // Autocompletado de productos
  productoSeleccionado: any = null;
  marcas: any[] = [];
  resultadosMarcas: any[] = [];
  marcaSeleccionada: any = '';
  resultadosBusqueda: any[] = [];
  cantidadAgregar: number = 1;

  unidadesMedida: any[] = [];
  listaPresentaciones: any[] = [];

  // Catálogo de motivos de traslado
  motivos: any[] = [];

  listaStockProveedor: any[] = [];

  // Variables para el resumen
  mostrarResum: boolean = false;
  guiaGenerada: any = null;

  unidadSeleccionada: any = null;
  presentacionSeleccionada: any = null;

  // Objeto principal de la guía
  nuevaGuia: any = {
    proveedor: null,
    establecimiento: null,
    estado: null,
    motivo: null,
    puntoPartida: '',
    puntoLlegada: '',
    placaVehiculo: '',
    licenciaConductor: '',
    fechaEmision: new Date(),
    fechaTraslado: new Date(),
    detalles: []
  };

  pesoBrutoTotal: number = 0;

  constructor(
    private guiaService: GuiaRemisionService,
    private productoService: ProductoService,
    private proveedorService: ProveedorService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
    //this.recuperarDatosGuardados();
    this.cargarMarcas();
    this.cargarProveedores();
    this.recuperarBorrador();
  }

  ngOnDestroy(): void {
    this.guardarBorrador();
  }

  cargarMarcas() {
    this.productoService.getMarcas().subscribe({
      next: (data) => {
        this.marcas = data;
        // Forzamos que la lista de sugerencias inicial sea toda la lista
        this.resultadosMarcas = [...this.marcas];
        console.log("Marcas cargadas en Angular:", this.marcas);
      },
      error: (err) => console.error("Error en Angular:", err)
    });
  }

  cargarMotivos() {
    this.productoService.getMotivosTraslado().subscribe(data => {
      this.motivos = data;
    });
  }

  cargarProveedores() {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => this.proveedores = data,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se cargaron los proveedores' })
    });
  }

  filtrarMarcas(event: any) {
    if (!event.query) {
      this.resultadosMarcas = [...this.marcas];
    } else {
      const query = event.query.toLowerCase();
      // Cambiado a m.nombre con minúscula
      this.resultadosMarcas = this.marcas.filter(m =>
        m.nombre && m.nombre.toLowerCase().includes(query)
      );
    }
  }

  /*recuperarDatosGuardados() {
    const proveedorGuardado = localStorage.getItem('proveedor_fijado');
    if (proveedorGuardado) {
      const proveedor = JSON.parse(proveedorGuardado);
      this.nuevaGuia.proveedor = proveedor;
      this.nuevaGuia.puntoPartida = proveedor.direccion;
    }
  }*/

  cargarCatalogos() {
    this.proveedorService.getProveedores().subscribe(data => {
      this.proveedores = data;
    });

    this.productoService.getUnidadesMedida().subscribe({
      next: (data) => {
        this.unidadesMedida = data;
        console.log('Unidades para Guía:', data);
      },
      error: (err) => console.error('Error al cargar unidades', err)
    });

    this.productoService.getPresentaciones().subscribe(data => {
      this.listaPresentaciones = data;
    });

    this.productoService.getMotivosTraslado().subscribe(data => {
      this.motivos = data;
    });

    this.guiaService.getEstablecimientos().subscribe((data: any[]) => {
      this.establecimientos = data;
      if (data && data.length > 0) {
        const sedeBotica = data[0];

        this.nuevaGuia = {
          ...this.nuevaGuia,
          establecimiento: sedeBotica,
          puntoLlegada: sedeBotica.direccion
        };

        console.log("Establecimiento fijado:", sedeBotica.direccion);
      }
    });

    // 3. Cargar estados y preseleccionar 'PENDIENTE'
    this.guiaService.getEstados().subscribe(data => {
      this.estados = data;
      this.nuevaGuia.estado = this.estados.find((e: any) => e.descripcion === 'PENDIENTE');
    });
  }


  onProveedorSelect(event: any) {
    const proveedorObj = event.value;
    if (!proveedorObj || !proveedorObj.idProveedor) return;

    this.proveedorService.obtenerStockPorProveedor(proveedorObj.idProveedor).subscribe({
      next: (data) => {
        this.listaStockProveedor = data;
        console.log("Inventario cargado del proveedor en memoria:", this.listaStockProveedor);

        // Auto-llenar punto de partida si el proveedor tiene dirección registrada
        if (proveedorObj.direccion) {
          this.nuevaGuia.puntoPartida = proveedorObj.direccion;
        }
      },
      error: (err) => {
        console.error("Error en petición de stock:", err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el stock del proveedor.'
        });
      }
    });
  }

  buscarProducto(event: any) {
    this.productoService.buscarPorNombre(event.query).subscribe(data => {
      this.resultadosBusqueda = data;
    });
  }

  agregarProductoALaGuia() {
    // A. VALIDACIÓN DE CAMPOS OBLIGATORIOS
    if (!this.productoSeleccionado ||
      !this.marcaSeleccionada ||
      !this.presentacionSeleccionada ||
      !this.unidadSeleccionada ||
      !this.cantidadAgregar ||
      this.cantidadAgregar <= 0) {

      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Todos los campos de la mercadería son obligatorios y la cantidad debe ser mayor a 0.'
      });
      return;
    }

    // B. VALIDACIÓN DE PROVEEDOR SELECCIONADO
    if (!this.nuevaGuia.proveedor || !this.nuevaGuia.proveedor.idProveedor) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar un proveedor en la sección de Traslado antes de añadir mercadería.'
      });
      return;
    }

    const marcaTexto = (this.marcaSeleccionada.nombre || this.marcaSeleccionada || '').toString().trim().toUpperCase();
    const presentacionTexto = (this.presentacionSeleccionada.nombre || this.presentacionSeleccionada || '').toString().trim().toUpperCase();

    // 1. BUSQUEDA DEL STOCK (Separamos la búsqueda del cálculo de peso)
    const stockEncontrado = this.listaStockProveedor.find(s => {
      const idProdStock = s.producto ? s.producto.id_producto : null;
      const marcaStock = (s.marca || '').toString().trim().toUpperCase();
      const presStock = (s.presentacion || '').toString().trim().toUpperCase();

      return idProdStock === this.productoSeleccionado.id_producto &&
        marcaStock === marcaTexto &&
        presStock === presentacionTexto;
    });

    if (!stockEncontrado) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sin Distribución',
        detail: `El proveedor no distribuye este producto en la marca (${marcaTexto}) o presentación (${presentacionTexto}) seleccionada.`
      });
      return;
    }

    // F. VALIDACIÓN DE CANTIDAD DISPONIBLE
    if (this.cantidadAgregar > stockEncontrado.cantidadDisponible) {
      this.messageService.add({
        severity: 'error',
        summary: 'Cantidad Excedida',
        detail: `Stock insuficiente. El proveedor solo cuenta con ${stockEncontrado.cantidadDisponible} unidades disponibles.`
      });
      return;
    }

    // 2. CÁLCULO DEL PESO EN KG (Fuera del find, con acceso al peso del producto)
    const pesoUnitario = this.productoSeleccionado.peso_unitario || this.productoSeleccionado.pesoUnitario || 0;
    const pesoEnMg = this.cantidadAgregar * pesoUnitario;
    const pesoEnKg = pesoEnMg / 1000000;

    // G. CREACIÓN DEL ITEM
    const nuevoItem = {
      producto: {
        ...this.productoSeleccionado,
        producto: this.productoSeleccionado.nombre || this.productoSeleccionado.producto
      },
      marcaSolicitada: marcaTexto,
      presentacion: {
        ...this.presentacionSeleccionada,
        nombre: this.presentacionSeleccionada.nombre || presentacionTexto
      },
      unidadMedida: {
        ...this.unidadSeleccionada,
        abreviatura: this.unidadSeleccionada.Abreviatura || this.unidadSeleccionada.abreviatura || this.unidadSeleccionada.nombre
      },
      cantidad: this.cantidadAgregar,
      pesoSubtotal: pesoEnKg // Ahora sí reconoce la variable calculada
    };

    this.nuevaGuia.detalles.push(nuevoItem);

    // Recalcular y limpiar campos
    this.calcularPesoTotalGuia();
    this.limpiarCamposMercaderia();

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Medicamento agregado al detalle de la guía con éxito.'
    });
  }

  eliminarItem(index: number) {
    this.nuevaGuia.detalles.splice(index, 1);
    this.nuevaGuia.detalles = [...this.nuevaGuia.detalles];
    this.calcularPesoTotalGuia();
  }

  calcularPesoTotalGuia() {
    // Definimos explícitamente los tipos para 'sum' y 'item'
    this.pesoBrutoTotal = this.nuevaGuia.detalles.reduce((sum: number, item: any) => {
      return sum + (item.pesoSubtotal || 0);
    }, 0);
  }

  guardarGuiaCompleta() {
    // 1. Validación de campos obligatorios para la Guía de Remitente (EG)
    if (!this.nuevaGuia.proveedor ||
      !this.nuevaGuia.establecimiento ||
      !this.nuevaGuia.motivo ||
      !this.nuevaGuia.fechaTraslado) {

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Complete Proveedor, Establecimiento, Motivo y Fecha de Traslado'
      });
      return;
    }

    // 2. Validación de que existan productos en la tabla de mercadería
    if (this.nuevaGuia.detalles.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La guía debe tener al menos un producto'
      });
      return;
    }

    // 3. Estructuración del objeto final con formatos correctos para Spring Boot
    const guiaParaEnviar = {
      ...this.nuevaGuia,
      fechaEmision: this.formatearFecha(this.nuevaGuia.fechaEmision),
      fechaTraslado: this.formatearFecha(this.nuevaGuia.fechaTraslado),
      puntoLlegada: this.nuevaGuia.establecimiento.direccion,
      estado: this.nuevaGuia.estado,
      pesoBrutoTotal: this.pesoBrutoTotal
    };

    // 4. Envío de datos al servicio backend (Puerto 8081)
    this.guiaService.guardarGuia(guiaParaEnviar).subscribe({
      next: (res) => {
        this.guiaGenerada = res;
        this.mostrarResum = true;

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Guía ${res.codigoGuia} generada correctamente`
        });

        // 5. LIMPIEZA COMPLETA DE LA INTERFAZ
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error('Detalle del Error 500 al persistir la guía:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar la guía'
        });
      }
    });
  }
  limpiarFormulario() {

    sessionStorage.removeItem('borrador_guia');
    
    this.nuevaGuia = {
      proveedor: null,
      puntoPartida: '',
      establecimiento: this.nuevaGuia.establecimiento,
      puntoLlegada: this.nuevaGuia.establecimiento?.direccion || '',
      motivo: null,
      fechaEmision: new Date(),
      fechaTraslado: new Date(),
      placaVehiculo: '',
      licenciaConductor: '',
      detalles: []
    };

    this.productoSeleccionado = null;
    this.marcaSeleccionada = '';
    this.unidadSeleccionada = null;
    this.presentacionSeleccionada = null;
    this.limpiarCamposMercaderia();
    this.pesoBrutoTotal = 0;
    this.listaStockProveedor = [];
    this.cantidadAgregar = 1;
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
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }
    return fecha;
  }

  guardarBorrador() {
    const borrador = {
      nuevaGuia: this.nuevaGuia,
      pesoBrutoTotal: this.pesoBrutoTotal,
      listaStockProveedor: this.listaStockProveedor
    };
    sessionStorage.setItem('borrador_guia', JSON.stringify(borrador));
  }

  recuperarBorrador() {
    const borradorStr = sessionStorage.getItem('borrador_guia');
    if (borradorStr) {
      const borrador = JSON.parse(borradorStr);
      this.nuevaGuia = borrador.nuevaGuia;
      
      // Re-instanciar las fechas
      if (this.nuevaGuia.fechaEmision) {
        this.nuevaGuia.fechaEmision = new Date(this.nuevaGuia.fechaEmision);
      }
      if (this.nuevaGuia.fechaTraslado) {
        this.nuevaGuia.fechaTraslado = new Date(this.nuevaGuia.fechaTraslado);
      }
      
      this.pesoBrutoTotal = borrador.pesoBrutoTotal;
      this.listaStockProveedor = borrador.listaStockProveedor || [];
    }
  }
}
