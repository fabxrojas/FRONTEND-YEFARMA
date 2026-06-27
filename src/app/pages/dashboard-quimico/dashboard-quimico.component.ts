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
import { UsuarioService } from '../../services/usuario.service';
import { RefreshService } from '../../services/refresh.service';
import { TooltipModule } from 'primeng/tooltip';

import { SidebarModule } from 'primeng/sidebar';

import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard-quimico',
  standalone: true,
  imports: [CommonModule, PanelMenuModule, MenuModule, ButtonModule, RouterOutlet,
    CardModule, TableModule, DialogModule, ChartModule, SidebarModule, TooltipModule],
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

  displayModalPerfil: boolean = false;
  usuarioPerfil: any = {};

  constructor(
    public router: Router,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private usuarioService: UsuarioService,
    private refreshService: RefreshService
  ) { }

  ngOnInit() {
    this.cargarUsuario();
    this.cargarDatosDashboard();

    this.refreshService.refresh$.subscribe(() => {
      this.cargarDatosDashboard();
    });

    this.userOptions = [
      {
        label: 'Perfil',
        items: [
          { label: 'Ver Perfil', icon: 'pi pi-user', command: () => this.cargarPerfil() }, // Conexión aquí
          { label: 'Cerrar Sesión', icon: 'pi pi-power-off', command: () => this.logout() }
        ]
      }
    ];
  }

  cargarPerfil() {
    this.usuarioService.obtenerPerfil(this.userName).subscribe({
      next: (data) => {
        this.usuarioPerfil = data;
        this.displayModalPerfil = true;
      },
      error: (err) => console.error('Error al cargar perfil', err)
    });
  }


  private cargarUsuario() {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const user = JSON.parse(userJson);

      // LA CORRECCIÓN ESTÁ EN ESTA LÍNEA: Agregamos user.nombre al inicio
      this.userName = user.nombre || user.username || user.NombreUser || 'Usuario';

      const rolNombre = this.authService.getUserRole();
      this.items = MENU_ITEMS[rolNombre] || [];
    }
  }

 private cargarDatosDashboard() {
    this.loading = true;

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;

        console.log("Data completa global recibida:", data);

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

    // 1. Extraemos los nombres y cantidades
    const topNombres = this.dashboardData?.topProductos?.map(p => p.producto) || [];
    const topCantidades = this.dashboardData?.topProductos?.map(p => p.cantidadVendida) || [];

    // 2. Llenamos la data del gráfico
    this.chartData = {
      labels: topNombres,
      datasets: [
        {
          label: 'Unidades Dispensadas',
          backgroundColor: documentStyle.getPropertyValue('--cyan-500'), // Color de la barra
          borderColor: documentStyle.getPropertyValue('--cyan-500'),
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

    // 1. GRÁFICO MENSUAL (Dinero por mes)
    const etiquetasMensual = this.dashboardData?.dispensacionesMensuales?.map((g: any) => g.etiqueta) || [];
    const valoresMensual = this.dashboardData?.dispensacionesMensuales?.map((g: any) => g.valor) || [];

    this.chartDataMensual = {
      labels: etiquetasMensual,
      datasets: [
        {
          label: 'Ingresos Mensuales (S/.)', // Etiqueta corregida
          data: valoresMensual,
          fill: true,
          borderColor: documentStyle.getPropertyValue('--indigo-500'),
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          tension: 0.4
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

    // 2. GRÁFICO ÚLTIMOS 7 DÍAS (Dinero por día)
    const etiquetasDiarias = this.dashboardData?.dispensacionesDiarias?.map((g: any) => g.etiqueta) || [];
    const valoresDiarias = this.dashboardData?.dispensacionesDiarias?.map((g: any) => g.valor) || [];

    this.chartDataDiaria = {
      labels: etiquetasDiarias,
      datasets: [
        {
          label: 'Ingresos Diarios (S/.)', // Etiqueta corregida
          data: valoresDiarias,
          backgroundColor: documentStyle.getPropertyValue('--teal-500'),
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

    // 3. GRÁFICO PROVEEDORES
    const etiquetasProveedor = this.dashboardData?.dispensacionesPorProveedor?.map((g: any) => g.etiqueta) || [];
    const valoresProveedor = this.dashboardData?.dispensacionesPorProveedor?.map((g: any) => g.valor) || [];

    this.chartDataProveedor = {
      labels: etiquetasProveedor,
      datasets: [{
        label: 'Unidades Vendidas',
        data: valoresProveedor,
        backgroundColor: documentStyle.getPropertyValue('--orange-500'),
        borderRadius: 4
      }]
    };
    this.chartOptionsProveedor = {
      indexAxis: 'y',
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
        y: { ticks: { color: textColorSecondary }, grid: { display: false } }
      }
    };
  }

  configurarRendimientoPersonal() {
    if (!this.dashboardData?.rendimientoPersonal || this.dashboardData.rendimientoPersonal.length === 0) {
      console.warn("Rendimiento del personal vacío");
      return;
    }

    const etiquetas = this.dashboardData.rendimientoPersonal.map(g => g.etiqueta);
    const valores = this.dashboardData.rendimientoPersonal.map(g => g.valor);

    const dynamicColors = [
      '#42A5F5', '#FFCA28', '#66BB6A', '#EC407A',
      '#AB47BC', '#26A69A', '#78909C', '#FF7043'
    ];

    const backgroundColors = etiquetas.map((_, i) => dynamicColors[i % dynamicColors.length]);
    const hoverColors = backgroundColors.map(color => color + 'AA');

    this.chartDataStaff = {
      labels: etiquetas,
      datasets: [{
        data: valores,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverColors
      }]
    };

    this.chartOptionsStaff = {
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true }
        }
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
    // Reporte detallado para Excel
    let csvContent = "REPORTE GERENCIAL - BOTICA YEFARMA\r\n\r\n";

    // KPIs Principales
    csvContent += "RESUMEN DEL DIA\r\n";
    csvContent += `Ingresos de Hoy (S/.):,${this.dashboardData?.totalVentasHoy || 0}\r\n`;
    csvContent += `Tickets Emitidos:,${this.dashboardData?.totalDispensacionesHoy || 0}\r\n`;
    csvContent += `Productos con Stock Critico:,${this.dashboardData?.productosConStockBajo || 0}\r\n`;
    csvContent += `Productos por Vencer:,${this.dashboardData?.productosPorVencer?.length || 0}\r\n\r\n`;

    // Top Productos
    csvContent += "TOP 5 MEDICAMENTOS MAS VENDIDOS\r\n";
    csvContent += "Medicamento,Cantidad Vendida\r\n";
    this.dashboardData?.topProductos?.forEach(p => {
      csvContent += `${p.producto},${p.cantidadVendida}\r\n`;
    });
    csvContent += "\r\n";

    // Ingresos Mensuales
    csvContent += "INGRESOS MENSUALES (S/.)\r\n";
    csvContent += "Mes,Monto\r\n";
    this.dashboardData?.dispensacionesMensuales?.forEach(g => {
      csvContent += `${g.etiqueta},${g.valor}\r\n`;
    });

    // Descarga del archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Yefarma_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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