import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardQuimicoComponent } from './pages/dashboard-quimico/dashboard-quimico.component';
import { RegistrarProductoComponent } from './pages/registrar-producto/registrar-producto.component';
import { IngresarProductoComponent } from './pages/ingresar-producto/ingresar-producto.component';
import { RegistrarProveedorComponent } from './pages/registrar-proveedor/registrar-proveedor.component';
import { CrearUsuarioComponent } from './pages/crear-usuario/crear-usuario.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard-quimico',
    component: DashboardQuimicoComponent,
    children: [
      // CAMBIA ESTO PARA QUE COINCIDA CON EL MENÚ
      { path: 'inventario/nuevo', component: RegistrarProductoComponent },
      { path: 'inventario/ingreso', component: IngresarProductoComponent },
      { path: 'inventario/stock', component: RegistrarProductoComponent },
      { path: 'reabastecimiento/proveedor', component: RegistrarProveedorComponent},
      { path: 'reabastecimiento/crear-guia', component: RegistrarProveedorComponent},
      { path: 'reabastecimiento/validar-guia', component: RegistrarProveedorComponent},
      { path: 'admin/usuarios', component: CrearUsuarioComponent}
    
    ]
  },
  { path: '**', redirectTo: 'login' }
];