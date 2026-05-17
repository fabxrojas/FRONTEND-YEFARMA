import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardQuimicoComponent } from './pages/dashboard-quimico/dashboard-quimico.component';
import { RegistrarProductoComponent } from './pages/registrar-producto/registrar-producto.component';
import { IngresarProductoComponent } from './pages/ingresar-producto/ingresar-producto.component';
import { RegistrarProveedorComponent } from './pages/registrar-proveedor/registrar-proveedor.component';
import { CrearUsuarioComponent } from './pages/crear-usuario/crear-usuario.component';
import { RestablecerContrasenaComponent } from './pages/restablecer-contrasena/restablecer-contrasena.component';
import { CrearGuiaComponent } from './pages/crear-guia/crear-guia.component';
import { ValidarGuiaComponent } from './pages/validar-guia/validar-guia.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'restablecer-contrasena', component: RestablecerContrasenaComponent },
  {
    path: 'dashboard-quimico',
    component: DashboardQuimicoComponent,
    children: [
      // CAMBIA ESTO PARA QUE COINCIDA CON EL MENÚ
      { path: 'inventario/nuevo', component: RegistrarProductoComponent },
      { path: 'inventario/ingreso', component: IngresarProductoComponent },
      { path: 'inventario/stock', component: RegistrarProductoComponent },
      { path: 'reabastecimiento/proveedor', component: RegistrarProveedorComponent},
      { path: 'reabastecimiento/crear-guia', component: CrearGuiaComponent},
      { path: 'reabastecimiento/validar-guia', component: ValidarGuiaComponent},
      { path: 'admin/usuarios', component: CrearUsuarioComponent}
    
    ]
  },
  {
    path: 'dashboard-tecnico',
    component: DashboardQuimicoComponent, 
    children: [
      { path: 'inventario/ingreso', component: IngresarProductoComponent },
      { path: 'inventario/stock', component: RegistrarProductoComponent },
      { path: 'dispensacion', component: RegistrarProductoComponent},
      { path: 'stock', component: RegistrarProductoComponent }

    ]
  },
  { path: '**', redirectTo: 'login' }
];