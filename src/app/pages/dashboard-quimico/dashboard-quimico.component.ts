import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenuItem } from 'primeng/api';
import { MENU_ITEMS } from '../../core/constants/menu-config';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardDTO } from '../../dto/dashboard.dto';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

import { SidebarModule } from 'primeng/sidebar';

import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard-quimico',
  standalone: true,
  imports: [CommonModule, PanelMenuModule, MenuModule, ButtonModule, RouterOutlet,
    CardModule, TableModule, DialogModule, ChartModule, SidebarModule],
  templateUrl: './dashboard-quimico.component.html',
  styleUrls: ['./dashboard-quimico.component.css']
})
export class DashboardQuimicoComponent implements OnInit {
  items: MenuItem[] = [];
  userOptions: MenuItem[] = [];
  userName: string = '';

  // Variables para los datos del dashboard
  dashboardData: DashboardDTO | null = null;
  loading: boolean = true;

  displayModalStock: boolean = false;
  listaStockBajo: any[] = [];
  loadingModal: boolean = false;

  chartData: any;
  chartOptions: any;

  chartDataMensual: any;
  chartOptionsMensual: any;
  chartDataDiaria: any;
  chartOptionsDiaria: any;

  chartDataProveedor: any;
  chartOptionsProveedor: any;

  displayModalCaducidad: boolean = false;

  displaySidebarStaff: boolean = false;
  chartDataStaff: any;
  chartOptionsStaff: any;

  constructor(
    public router: Router,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.cargarUsuario();
    this.cargarDatosDashboard();

    this.userOptions = [
      {
        label: 'Perfil',
        items: [
          { label: 'Ver Perfil', icon: 'pi pi-user' },
          {
            label: 'Cerrar Sesión',
            icon: 'pi pi-power-off',
            command: () => this.logout()
          }
        ]
      }
    ];
  }

  private cargarUsuario() {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.userName = user.username || user.NombreUser || 'Usuario';
      const rolNombre = this.authService.getUserRole();
      this.items = MENU_ITEMS[rolNombre] || [];
    }
  }

  private cargarDatosDashboard() {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
        
        // Configuramos todos los gráficos
        this.configurarGraficoBarras(); 
        this.configurarGraficosAvanzados();
        this.configurarRendimientoPersonal();
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.loading = false;
      }
    });
  }

  mostrarDetalleCaducidad() {
    this.displayModalCaducidad = true;
  }

  configurarGraficoBarras() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // 1. Extraemos los nombres y cantidades de tu DTO
    const topNombres = this.dashboardData?.topProductos?.map(p => p.producto) || [];
    const topCantidades = this.dashboardData?.topProductos?.map(p => p.cantidadVendida) || [];

    // 2. Llenamos la data del gráfico
    this.chartData = {
      labels: topNombres, // Eje X: Nombres de los medicamentos
      datasets: [
        {
          label: 'Unidades Dispensadas',
          backgroundColor: documentStyle.getPropertyValue('--blue-500'), // Color de la barra
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          data: topCantidades, 
          borderRadius: 4 // Bordes redondeados para que se vea moderno
        }
      ]
    };

    // 3. Opciones visuales (colores de texto y grilla)
    this.chartOptions = {
      plugins: {
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
  }

  configurarGraficosAvanzados() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // 1. GRÁFICO MENSUAL (LÍNEAS CON ÁREA SOMBREADA)
    const etiquetasMensual = this.dashboardData?.dispensacionesMensuales?.map((g: any) => g.etiqueta) || [];
    const valoresMensual = this.dashboardData?.dispensacionesMensuales?.map((g: any) => g.valor) || [];

    const etiquetasProveedor = this.dashboardData?.dispensacionesPorProveedor?.map((g: any) => g.etiqueta) || [];
    const valoresProveedor = this.dashboardData?.dispensacionesPorProveedor?.map((g: any) => g.valor) || [];

    this.chartDataMensual = {
        labels: etiquetasMensual,
        datasets: [
            {
                label: 'Dispensaciones Mensuales',
                data: valoresMensual,
                fill: true, // Esto hace el efecto de área sombreada bajo la línea
                borderColor: documentStyle.getPropertyValue('--indigo-500'),
                backgroundColor: 'rgba(99, 102, 241, 0.2)', // Indigo transparente
                tension: 0.4 // Esto hace que la línea sea curva y elegante
            }
        ]
    };

    this.chartOptionsMensual = {
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
            x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
            y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
        }
    };

    this.chartDataProveedor = {
        labels: etiquetasProveedor,
        datasets: [
            {
                label: 'Unidades Vendidas',
                data: valoresProveedor,
                backgroundColor: documentStyle.getPropertyValue('--orange-500'), // Color naranja corporativo
                borderRadius: 4
            }
        ]
    };

    this.chartOptionsProveedor = {
        indexAxis: 'y', 
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
            x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
            y: { ticks: { color: textColorSecondary }, grid: { display: false } }
        }
    };

    // 2. GRÁFICO ÚLTIMOS 7 DÍAS (BARRAS)
    const etiquetasDiarias = this.dashboardData?.dispensacionesDiarias?.map((g: any) => g.etiqueta) || [];
    const valoresDiarias = this.dashboardData?.dispensacionesDiarias?.map((g: any) => g.valor) || [];

    this.chartDataDiaria = {
        labels: etiquetasDiarias,
        datasets: [
            {
                label: 'Últimos 7 Días',
                data: valoresDiarias,
                backgroundColor: documentStyle.getPropertyValue('--teal-500'), // Color verde azulado
                borderRadius: 4
            }
        ]
    };

    this.chartOptionsDiaria = {
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
            x: { ticks: { color: textColorSecondary }, grid: { display: false } },
            y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
        }
    };
  }

  configurarRendimientoPersonal() {
    const documentStyle = getComputedStyle(document.documentElement);
    
    const etiquetas = this.dashboardData?.rendimientoPersonal?.map(g => g.etiqueta) || [];
    const valores = this.dashboardData?.rendimientoPersonal?.map(g => g.valor) || [];

    this.chartDataStaff = {
      labels: etiquetas,
      datasets: [
        {
          data: valores,
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--pink-500')
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--yellow-400'),
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--pink-400')
          ]
        }
      ]
    };

    this.chartOptionsStaff = {
      cutout: '60%', // Hace que sea una dona y no un pastel completo
      plugins: {
        legend: { position: 'bottom' }
      }
    };
  }

  getSeverity(alerta: string): string {
    if (!alerta) return 'info';
    const text = alerta.toLowerCase();
    // Si la BD manda 'crítico', 'vencido' o 'hoy', se marca en rojo
    if (text.includes('vencid') || text.includes('hoy') || text.includes('crítico')) {
      return 'danger';
    }
    return 'warning';
  }

  mostrarDetalleStockBajo() {
    this.displayModalStock = true;
    this.loadingModal = true;

    this.dashboardService.getStockBajoDetalle().subscribe({
      next: (data) => {
        this.listaStockBajo = data;
        this.loadingModal = false;
      },
      error: (err) => {
        console.error('Error al cargar el detalle de stock bajo:', err);
        this.loadingModal = false;
      }
    });
  }

  exportarDashboardExcel() {
    // 1. Preparamos los datos básicos
    const data = [
        { Concepto: 'Productos con Stock Bajo', Valor: this.dashboardData?.productosConStockBajo },
        { Concepto: 'Productos por Vencer', Valor: this.dashboardData?.productosPorVencer?.length },
    ];

    // 2. Convertimos a formato CSV
    const csvContent = this.convertToCSV(data);
    
    // 3. Descargamos el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Yefarma_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
}

// Función auxiliar para convertir JSON a CSV
convertToCSV(objArray: any[]) {
    const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = Object.keys(array[0]).join(",") + "\r\n";
    
    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            line += array[i][index] + ',';
        }
        str += line.slice(0, -1) + '\r\n';
    }
    return str;
}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}