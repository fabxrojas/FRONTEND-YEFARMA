import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardQuimicoComponent } from './pages/dashboard-quimico/dashboard-quimico.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard-quimico', component: DashboardQuimicoComponent }, 
  { path: '**', redirectTo: 'login' }
];