import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PRIMENG MODULES
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { Table } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

// SERVICIOS Y API
import { ProductoService } from '../../services/producto.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-registrar-producto',
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule,
    TableModule, ToastModule, ConfirmDialogModule, TooltipModule,
    ButtonModule, InputTextModule, InputNumberModule, SelectModule, CardModule
  ],
  providers: [ProductoService, ConfirmationService, MessageService],
  templateUrl: './registrar-producto.component.html',
  styleUrls: ['./registrar-producto.component.css']
})
export class RegistrarProductoComponent implements OnInit {
  @ViewChild('dt') table!: Table; //Referencia a la tabla del HTML
  productos: any[] = [];
  tipos: any[] = [];
  formas: any[] = [];
  unidades: any[] = [];

  isEditingRow: boolean = false;

  // Para revertir cambios si el usuario cancela la edición de una fila
  clonProductos: { [s: string]: any } = {};

  constructor(
    private productoService: ProductoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.obtenerDatosIniciales();
    this.productoService.getUnidadesMedida().subscribe({
      next: (data) => this.unidades = data,
      error: (err) => console.error("Error al cargar unidades", err)
    });
  }


  obtenerDatosIniciales(): void {
    // Cargamos la lista completa de productos para la tabla
    this.productoService.listarTodos().subscribe(data => this.productos = data);

    // Cargamos los selectores
    this.productoService.getTipos().subscribe(data => this.tipos = data);
    this.productoService.getFormas().subscribe(data => this.formas = data);
  }

  onRowEditInit(prod: any) {
    this.isEditingRow = true;
    this.clonProductos[prod.id_producto] = { ...prod };
  }

  onRowEditSave(producto: any) {
    if (producto.producto && producto.producto.trim().length > 0 && producto.precio > 0) {

      this.productoService.registrar(producto).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: producto.id_producto ? 'Producto actualizado' : 'Producto registrado'
          });

          if (producto.id_producto) {
            delete this.clonProductos[producto.id_producto];
          }

          this.obtenerDatosIniciales();
        },
        error: (err) => {
          console.error('Error en el servidor:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar en la base de datos'
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'El nombre y el precio son obligatorios'
      });

    }
    const esValido =
      producto.producto?.trim().length > 0 &&
      producto.precio > 0 &&
      producto.tipo != null &&
      producto.formaFarmaceutica != null;

    if (esValido) {
      this.productoService.registrar(producto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto guardado' });
          if (producto.nuevo) delete producto.nuevo;
          delete this.clonProductos[producto.id_producto];
          this.obtenerDatosIniciales(); // Recarga para ver el Código N000XX
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error en el servidor' });
        }
      });
    } else {
      // Si falta algo, NO SE GUARDA y avisamos al Químico
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos Incompletos',
        detail: 'Por favor, complete el nombre, precio, tipo y forma antes de guardar.'
      });
    }
  }

  onRowEditCancel(producto: any, index: number) {
    this.isEditingRow = false;

    if (producto.nuevo) {
      // Destruimos la fila buscando su ID temporal en lugar del index
      this.productos = this.productos.filter(p => p.id_producto !== 'TEMP');
    } else {
      // Restauramos la fila si era una edición de producto existente
      this.productos[index] = this.clonProductos[producto.id_producto];
      delete this.clonProductos[producto.id_producto];
    }
  }

  confirmarEliminacion(producto: any) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${producto.producto}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-info',
      accept: () => {
        this.productoService.eliminar(producto.id_producto).subscribe({
          next: () => {
            this.productos = this.productos.filter(p => p.id_producto !== producto.id_producto);
            this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Registro borrado de la base de datos' });
          }
        });
      }
    });
  }

  agregarNuevaFila() {
    // 1. Evitar que se presione varias veces usando la bandera isEditingRow
    if (this.isEditingRow || this.productos.some(p => p.nuevo)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Ya estás agregando/editando un producto. Termina o cancela esa fila primero.'
      });
      return;
    }

    this.isEditingRow = true; // <--- ¡AÑADIR ESTO! Bloquea los botones

    const nuevoProducto = {
      id_producto: 'TEMP',
      producto: '',
      precio: 0,
      pesoUnitario: 0,
      idUnidad: null,
      unidadMedida: null,
      tipo: null,
      formaFarmaceutica: null,
      nuevo: true
    };

    // 2. Lo agregamos AL INICIO de la lista para que se vea arriba
    this.productos = [nuevoProducto, ...this.productos];

    setTimeout(() => {
      this.table.initRowEdit(nuevoProducto);
    }, 10);
  }

  validarYGuardar(producto: any) {
    // 1. Validación de campos obligatorios en blanco
    if (!producto.producto?.trim() || !producto.tipo || !producto.formaFarmaceutica) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Complete Nombre, Tipo y Forma Farmacéutica.'
      });
      return;
    }

    // 2. NUEVA VALIDACIÓN: Evitar el "Clon Exacto" (Duplicidad extrema)
    const nombreAInsertar = producto.producto.trim().toLowerCase();
    const idFormaAInsertar = producto.formaFarmaceutica.id_forma_farma;
    const precioAInsertar = producto.precio;

    // Buscamos en la tabla si algún producto cumple con las 3 condiciones a la vez
    const existeDuplicado = this.productos.some(p =>
      p.id_producto !== producto.id_producto && // Evita que se compare consigo mismo si solo estamos editando un producto antiguo
      p.producto?.trim().toLowerCase() === nombreAInsertar &&
      p.formaFarmaceutica?.id_forma_farma === idFormaAInsertar &&
      p.precio === precioAInsertar
    );

    if (existeDuplicado) {
      this.messageService.add({
        severity: 'error', // Mensaje rojo bloqueante
        summary: 'Error',
        detail: 'Ya existe en el catálogo un producto con ese mismo Nombre, Forma Farmacéutica y Precio exacto.'
      });
      return; 
    }

    // 3. Si pasó las validaciones, construimos el objeto limpio para Spring Boot
    const productoParaEnviar = {
      id_producto: producto.nuevo ? null : producto.id_producto,
      producto: producto.producto,
      precio: producto.precio,
      pesoUnitario: producto.pesoUnitario,
      registroSanitario: producto.registroSanitario,
      tipo: { id_tipo: producto.tipo.id_tipo },
      formaFarmaceutica: { id_forma_farma: producto.formaFarmaceutica.id_forma_farma }
    };

    // 4. Envío al servicio
    this.productoService.registrar(productoParaEnviar).subscribe({
      next: () => {
        this.isEditingRow = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Producto guardado correctamente'
        });
        this.table.cancelRowEdit(producto);
        this.obtenerDatosIniciales();
      },
      error: (err) => {
        this.isEditingRow = false;
        console.error("Error servidor:", err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar el producto.'
        });
      }
    });
  }
}