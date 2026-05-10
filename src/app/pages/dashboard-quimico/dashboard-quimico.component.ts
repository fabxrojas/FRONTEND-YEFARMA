import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { MENU_ITEMS } from '../../core/constants/menu-config';
import { AuthService } from '../../services/auth.service'; 
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard-quimico',
  standalone: true,
  imports: [CommonModule, PanelMenuModule, MenuModule, ButtonModule, RouterOutlet],
  templateUrl: './dashboard-quimico.component.html',
  styleUrls: ['./dashboard-quimico.component.css']
})
export class DashboardQuimicoComponent implements OnInit {
  items: MenuItem[] = [];
  userOptions: MenuItem[] = [];
  userName: string = '';

  constructor(
    public router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const userJson = localStorage.getItem('usuario');

    if (userJson) {
      const user = JSON.parse(userJson);

      this.userName = user.username || user.NombreUser || 'Usuario';

      const rolNombre = this.authService.getUserRole();
      this.items = MENU_ITEMS[rolNombre] || [];
    }

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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}