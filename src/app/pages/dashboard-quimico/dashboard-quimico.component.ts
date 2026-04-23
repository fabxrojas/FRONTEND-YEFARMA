import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importar Router para el logout [cite: 56]
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuModule } from 'primeng/menu'; // Necesario para el popup de perfil
import { ButtonModule } from 'primeng/button'; // Necesario para el botón de perfil
import { MenuItem } from 'primeng/api';
import { MENU_ITEMS } from '../../core/constants/menu-config';

@Component({
  selector: 'app-dashboard-quimico',
  standalone: true,
  imports: [CommonModule, PanelMenuModule, MenuModule, ButtonModule],
  templateUrl: './dashboard-quimico.component.html',
  styleUrls: ['./dashboard-quimico.component.css'] // Asegúrate de tener el CSS
})
export class DashboardQuimicoComponent implements OnInit {
  items: MenuItem[] = []; // Menú lateral
  userOptions: MenuItem[] = []; // Menú superior derecho [cite: 40]
  userName: string = 'FabrizioRO'; // Dato simulado

  constructor(private router: Router) {}

  ngOnInit() {
    // Menú lateral configurado anteriormente
    this.items = MENU_ITEMS['QUIMICO FARMACEUTICO'];

    // Configuración de opciones de perfil (Esquina superior derecha) [cite: 50, 54]
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
    localStorage.clear(); // Limpia datos de sesión [cite: 61]
    this.router.navigate(['/login']); // Redirige al login [cite: 56]
  }
}