import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';

// Servicios
import { MENU_ITEMS } from '../../core/constants/menu-config';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { UsuarioService } from '../../services/usuario.service';
import { ProductoService } from '../../services/producto.service'; // NUEVO
import { DashboardDTO } from '../../dto/dashboard.dto';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-dashboard-tecnico',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, PanelMenuModule, MenuModule, 
    ButtonModule, CardModule, TableModule, DialogModule, TooltipModule, 
    InputTextModule, ChartModule, TagModule
  ],
  templateUrl: './dashboard-tecnico.component.html',
  styleUrls: ['./dashboard-tecnico.component.css']
})
export class DashboardTecnicoComponent implements OnInit {
  
  items: MenuItem[] = [];
  userOptions: MenuItem[] = [];
  userName: string = '';

  // Datos del Dashboard Personal
  dashboardData: DashboardDTO | null = null;
  loading: boolean = true;

  // Gráfico Personal (Últimos 7 días)
  chartDataDiaria: any;
  chartOptionsDiaria: any;

  // Consultor Rápido de Precios
  textoBusquedaPrecio: string = '';
  resultadosPrecio: any[] = [];
  buscandoPrecios: boolean = false;

  // Modal de Perfil
  displayModalPerfil: boolean = false;
  usuarioPerfil: any = {};

  constructor(
    public router: Router,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private usuarioService: UsuarioService,
    private productoService: ProductoService, 
    private refreshService: RefreshService
  ) { }

  ngOnInit() {
    this.cargarUsuario();
    this.cargarDatosDashboard();

    this.refreshService.refresh$.subscribe(() => {
      this.cargarDatosDashboard();
    });
    // -------------------------------------------

    this.userOptions = [
      {
        label: 'Perfil',
        items: [
          { label: 'Ver Mi Perfil', icon: 'pi pi-user', command: () => this.cargarPerfil() },
          { label: 'Cerrar Sesión', icon: 'pi pi-power-off', command: () => this.logout() }
        ]
      }
    ];
  }

  private cargarUsuario() {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.userName = user.nombre || user.username || user.NombreUser || 'Técnico';
      const rolNombre = this.authService.getUserRole();
      this.items = MENU_ITEMS[rolNombre] || [];
    }
  }

  private cargarDatosDashboard() {
    this.loading = true;
    const idUsuarioActual = this.authService.getCurrentUserId();

    // Enviamos el ID para que el backend calcule solo SUS ventas
    this.dashboardService.getDashboardData(idUsuarioActual).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
        this.configurarGraficoPersonal();
      },
      error: (err) => {
        console.error('Error al cargar datos técnicos', err);
        this.loading = false;
      }
    });
  }

  // --- CONSULTOR DE PRECIOS RÁPIDO ---
  buscarPrecio() {
    if (!this.textoBusquedaPrecio || this.textoBusquedaPrecio.trim() === '') {
      this.resultadosPrecio = [];
      return;
    }
    this.buscandoPrecios = true;
    this.productoService.buscarConStock(this.textoBusquedaPrecio).subscribe({
      next: (res) => {
        this.resultadosPrecio = res;
        this.buscandoPrecios = false;
      },
      error: () => {
        this.buscandoPrecios = false;
      }
    });
  }

  // --- GRÁFICO DE RENDIMIENTO PERSONAL ---
  configurarGraficoPersonal() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const etiquetas = this.dashboardData?.dispensacionesDiarias?.map((g: any) => g.etiqueta) || [];
    const valores = this.dashboardData?.dispensacionesDiarias?.map((g: any) => g.valor) || [];

    this.chartDataDiaria = {
      labels: etiquetas,
      datasets: [
        {
          label: 'Mis Ingresos (S/.)',
          data: valores,
          backgroundColor: documentStyle.getPropertyValue('--cyan-500'),
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

  cargarPerfil() {
    this.usuarioService.obtenerPerfil(this.userName).subscribe({
      next: (data) => {
        this.usuarioPerfil = data;
        this.displayModalPerfil = true;
      },
      error: (err) => console.error('Error al cargar perfil', err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}