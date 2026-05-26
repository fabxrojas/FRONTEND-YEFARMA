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
    if (producto.nuevo) {
      this.productos = this.productos.filter((p, i) => i !== index); // Si es una fila nueva sin guardar, la eliminamos completamente 
    } else {
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
    const nuevoProducto = {
      producto: '',
      precio: 0,
      pesoUnitario: 0,
      idUnidad: null,
      unidadMedida: null,
      tipo: null,
      formaFarmaceutica: null,
      nuevo: true
    };

    // Lo agregamos
    this.productos = [...this.productos, nuevoProducto];

    setTimeout(() => {
      this.table.initRowEdit(nuevoProducto);
    }, 1);
  }

  validarYGuardar(producto: any) {
    // 1. Validaciones (Ahora sin exigir unidad de medida)
    if (!producto.producto?.trim() || !producto.tipo || !producto.formaFarmaceutica) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Complete Nombre, Tipo y Forma Farmacéutica.'
      });
      return;
    }

    // 2. Construcción limpia del objeto
    // Nota: Como ya no usamos idUnidad, lo quitamos del objeto de envío
    const productoParaEnviar = {
      id_producto: producto.id_producto,
      producto: producto.producto,
      precio: producto.precio,
      pesoUnitario: producto.pesoUnitario, // Este es el dato de dosificación en mg
      registroSanitario: producto.registroSanitario,
      tipo: { id_tipo: producto.tipo.id_tipo },
      formaFarmaceutica: { id_forma_farma: producto.formaFarmaceutica.id_forma_farma }
    };

    // 3. Envío al servicio
    this.productoService.registrar(productoParaEnviar).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Producto guardado correctamente'
        });
        this.table.cancelRowEdit(producto);
        this.obtenerDatosIniciales();
      },
      error: (err) => {
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