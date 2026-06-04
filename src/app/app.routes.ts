import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RestablecerContrasenaComponent } from './pages/restablecer-contrasena/restablecer-contrasena.component';

import { DashboardQuimicoComponent } from './pages/dashboard-quimico/dashboard-quimico.component';
import { DashboardTecnicoComponent } from './pages/dashboard-tecnico/dashboard-tecnico.component';

import { RegistrarProductoComponent } from './pages/registrar-producto/registrar-producto.component';
import { IngresarProductoComponent } from './pages/ingresar-producto/ingresar-producto.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { RegistrarProveedorComponent } from './pages/registrar-proveedor/registrar-proveedor.component';
import { CrearGuiaComponent } from './pages/crear-guia/crear-guia.component';
import { ValidarGuiaComponent } from './pages/validar-guia/validar-guia.component';
import { DispensacionComponent } from './pages/dispensacion/dispensacion.component';
import { CrearUsuarioComponent } from './pages/crear-usuario/crear-usuario.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'restablecer-contrasena', component: RestablecerContrasenaComponent },


  {
    path: 'dashboard-quimico',
    component: DashboardQuimicoComponent, 
    children: [
      { path: 'inventario/nuevo', component: RegistrarProductoComponent },
      { path: 'inventario/ingreso', component: IngresarProductoComponent },
      { path: 'inventario/stock', component: InventarioComponent },
      { path: 'reabastecimiento/proveedor', component: RegistrarProveedorComponent },
      { path: 'reabastecimiento/crear-guia', component: CrearGuiaComponent },
      { path: 'reabastecimiento/validar-guia', component: ValidarGuiaComponent },
      { path: 'venta/dispensacion', component: DispensacionComponent },
      { path: 'admin/usuarios', component: CrearUsuarioComponent }
    ]
  },

  {
    path: 'dashboard-tecnico',
    component: DashboardTecnicoComponent, 
    children: [
      { path: 'inventario/ingreso', component: IngresarProductoComponent },
      { path: 'inventario/stock', component: InventarioComponent },
      { path: 'venta/dispensacion', component: DispensacionComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];