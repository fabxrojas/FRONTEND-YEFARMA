import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RestablecerContrasenaComponent } from './pages/restablecer-contrasena/restablecer-contrasena.component';

import { DashboardQuimicoComponent } from './pages/dashboard-quimico/dashboard-quimico.component';
import { DashboardTecnicoComponent } from './pages/dashboard-tecnico/dashboard-tecnico.component';

import { RegistrarProductoComponent } from './pages/registrar-producto/registrar-producto.component';
import { RecepcionMercaderiaComponent } from './pages/recepcion-mercaderia/recepcion-mercaderia.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { RegistrarProveedorComponent } from './pages/registrar-proveedor/registrar-proveedor.component';
import { EmitirGuiaComponent } from './pages/emitir-guia/emitir-guia.component';
import { HistorialGuiaComponent } from './pages/historial-guia/historial-guia.component';
import { HistorialRecepcionComponent } from './pages/historial-recepcion/historial-recepcion.component';
import { DispensacionComponent } from './pages/dispensacion/dispensacion.component';
import { CrearUsuarioComponent } from './pages/crear-usuario/crear-usuario.component';
import { RegistrarClienteComponent } from './pages/registrar-cliente/registrar-cliente.component';
import { OrdenCompraComponent } from './pages/orden-compra/orden-compra.component';
import { HistorialOrdenesComponent } from './pages/historial-ordenes/historial-ordenes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'restablecer-contrasena', component: RestablecerContrasenaComponent },


  {
    path: 'dashboard-quimico',
    component: DashboardQuimicoComponent, 
    children: [
      { path: 'inventario/producto', component: RegistrarProductoComponent },
      { path: 'inventario/stock', component: InventarioComponent },

      { path: 'compras/proveedor', component: RegistrarProveedorComponent },
      { path: 'compras/orden-compra', component: OrdenCompraComponent },
      { path: 'compras/historial-ordenes', component: HistorialOrdenesComponent },

      { path: 'distribucion/emitir-guia', component: EmitirGuiaComponent },
      { path: 'distribucion/cliente', component: RegistrarClienteComponent },
      { path: 'distribucion/historial-guia', component: HistorialGuiaComponent },

      { path: 'almacen/recepcion', component: RecepcionMercaderiaComponent },
      { path: 'almacen/historial-recepcion', component: HistorialRecepcionComponent },

      { path: 'admin/usuarios', component: CrearUsuarioComponent }   
    ]
  },

  {
    path: 'dashboard-tecnico',
    component: DashboardTecnicoComponent, 
    children: [
      { path: 'almacen/recepcion', component: RecepcionMercaderiaComponent },
      { path: 'inventario/producto', component: RegistrarProductoComponent },
      { path: 'inventario/stock', component: InventarioComponent },
      { path: 'venta/dispensacion', component: DispensacionComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];