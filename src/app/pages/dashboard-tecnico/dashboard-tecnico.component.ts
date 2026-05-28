import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Modules
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { MenuItem } from 'primeng/api';

// Servicios
import { MENU_ITEMS } from '../../core/constants/menu-config';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardDTO } from '../../dto/dashboard.dto';

@Component({
  selector: 'app-dashboard-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PanelMenuModule,
    MenuModule,
    ButtonModule,
    CardModule,
    TableModule
  ],
  templateUrl: './dashboard-tecnico.component.html',
  styleUrls: ['./dashboard-tecnico.component.css']
})
export class DashboardTecnicoComponent implements OnInit {
  // Variables de menú y usuario
  items: MenuItem[] = [];
  userOptions: MenuItem[] = [];
  userName: string = '';

  // Datos del Dashboard
  dashboardData: DashboardDTO | null = null;

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
          { label: 'Cerrar Sesión', icon: 'pi pi-power-off', command: () => this.logout() }
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
      next: (data) => this.dashboardData = data,
      error: (err) => console.error('Error al cargar datos técnicos', err)
    });
  }

  getSeverity(alerta: string): string {
    if (!alerta) return 'info';
    const text = alerta.toLowerCase();
    // Si contiene la palabra vencido, hoy o crítico, será rojo (danger)
    if (text.includes('vencid') || text.includes('hoy') || text.includes('crítico')) {
      return 'danger';
    }
    // Si no, será amarillo (warning)
    return 'warning';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}