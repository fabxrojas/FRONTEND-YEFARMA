import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardQuimicoComponent } from './pages/dashboard-quimico/dashboard-quimico.component';
import { RegistrarProductoComponent } from './pages/registrar-producto/registrar-producto.component'; // Importante

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard-quimico', 
    component: DashboardQuimicoComponent,
    children: [
      // CAMBIA ESTO PARA QUE COINCIDA CON EL MENÚ
      { path: 'inventario/nuevo', component: RegistrarProductoComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];