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
      CardModule, DatePickerModule, ToastModule, TooltipModule
    ],
  providers: [MessageService],
  templateUrl: './crear-guia.component.html',
  styleUrls: ['./crear-guia.component.css']
})
export class CrearGuiaComponent implements OnInit {
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

  unidadSeleccionada: any = null;
  presentacionSeleccionada: any = null;

  // Objeto principal de la guía
  nuevaGuia: any = {
    proveedor: null,
    establecimiento: null,
    estado: null,
    puntoPartida: '',
    puntoLlegada: '',
    placaVehiculo: '',
    licenciaConductor: '',
    fechaEmision: new Date(),
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
    this.recuperarDatosGuardados();
    this.cargarMarcas();
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

  recuperarDatosGuardados() {
    const proveedorGuardado = localStorage.getItem('proveedor_fijado');
    if (proveedorGuardado) {
      const proveedor = JSON.parse(proveedorGuardado);
      this.nuevaGuia.proveedor = proveedor;
      this.nuevaGuia.puntoPartida = proveedor.direccion;
    }
  }

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

    // Cargar Presentaciones (Tabla presentacion)
    this.productoService.getPresentaciones().subscribe(data => {
      this.listaPresentaciones = data;
    });

    // 2. Cargar establecimientos 
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
    const proveedor = event.value;
    if (proveedor) {
      this.nuevaGuia.puntoPartida = proveedor.direccion;
      // Guardamos en el navegador
      localStorage.setItem('proveedor_fijado', JSON.stringify(proveedor));
    }
  }

  buscarProducto(event: any) {
    this.productoService.buscarPorNombre(event.query).subscribe(data => {
      this.resultadosBusqueda = data;
    });
  }

  agregarProductoALaGuia() {
    // 1. Validaciones: Ahora incluimos unidad y presentación como obligatorios
    if (!this.productoSeleccionado || this.cantidadAgregar <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Seleccione producto y cantidad válida'
      });
      return;
    }

    if (!this.unidadSeleccionada || !this.presentacionSeleccionada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe seleccionar Unidad de Medida y Presentación'
      });
      return;
    }

    // 2. Obtener el nombre de la marca (texto o del objeto)
    const nombreMarca = typeof this.marcaSeleccionada === 'string'
      ? this.marcaSeleccionada
      : this.marcaSeleccionada?.nombre;

    // 3. Construcción del objeto Detalle (debe coincidir con la entidad Java)
    const detalle = {
      producto: this.productoSeleccionado,
      unidadMedida: this.unidadSeleccionada,
      presentacion: this.presentacionSeleccionada,
      marcaSolicitada: nombreMarca || 'SIN MARCA',
      cantidad: this.cantidadAgregar,
      pesoSubtotal: (this.productoSeleccionado.pesoUnitario || 0) * this.cantidadAgregar
    };

    this.nuevaGuia.detalles = [...this.nuevaGuia.detalles, detalle];
    this.calcularPesoTotalGuia();

    this.productoSeleccionado = null;
    this.marcaSeleccionada = '';
    this.unidadSeleccionada = null;
    this.presentacionSeleccionada = null;
    this.cantidadAgregar = 1;
  }

  eliminarItem(index: number) {
    this.nuevaGuia.detalles.splice(index, 1);
    this.nuevaGuia.detalles = [...this.nuevaGuia.detalles];
    this.calcularPesoTotalGuia();
  }

  calcularPesoTotalGuia() {
    this.pesoBrutoTotal = this.nuevaGuia.detalles.reduce((sum: number, item: any) => sum + item.pesoSubtotal, 0);
  }

  guardarGuiaCompleta() {
    if (!this.nuevaGuia.proveedor || !this.nuevaGuia.establecimiento || !this.nuevaGuia.placaVehiculo) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete los datos de transporte' });
      return;
    }

    if (this.nuevaGuia.detalles.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La guía debe tener al menos un producto' });
      return;
    }

    this.guiaService.guardarGuia(this.nuevaGuia).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Guía ${res.codigoGuia} generada correctamente`
        });
        this.limpiarFormulario();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la guía' });
      }
    });
  }

  limpiarFormulario() {
    // Resetear el objeto principal de la guía
    this.nuevaGuia = {
      proveedor: null,
      puntoPartida: '',
      establecimiento: this.nuevaGuia.establecimiento,
      fechaEmision: new Date(),
      placaVehiculo: '',
      licenciaConductor: '',
      detalles: []
    };

    this.productoSeleccionado = null;
    this.marcaSeleccionada = '';
    this.cantidadAgregar = 1;

  }
}