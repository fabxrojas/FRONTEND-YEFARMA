import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router'; // 1. Añadimos RouterOutlet
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { MENU_ITEMS } from '../../core/constants/menu-config';

@Component({
  selector: 'app-dashboard-quimico',
  standalone: true,
  // 2. IMPORTANTE: Agregamos RouterOutlet a los imports
  imports: [CommonModule, PanelMenuModule, MenuModule, ButtonModule, RouterOutlet], 
  templateUrl: './dashboard-quimico.component.html',
  styleUrls: ['./dashboard-quimico.component.css']
})
export class DashboardQuimicoComponent implements OnInit {
  items: MenuItem[] = [];
  userOptions: MenuItem[] = [];
  userName: string = 'FabrizioRO';

  // 3. CAMBIO CLAVE: 'public router' para que el HTML pueda leer router.url
  constructor(public router: Router) {} 

  ngOnInit() {
    this.items = MENU_ITEMS['QUIMICO FARMACEUTICO'];

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
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}