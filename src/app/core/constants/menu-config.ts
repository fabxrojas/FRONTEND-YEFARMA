import { MenuItem } from 'primeng/api';

export const MENU_ITEMS: { [key: string]: MenuItem[] } = {
  'QUIMICO FARMACEUTICO': [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      routerLink: '/dashboard-quimico'
    },
    {
      label: 'Distribución y Salida',
      icon: 'pi pi-arrow-circle-right',
      items: [
        { label: 'Registrar Cliente', icon: 'pi pi-user-plus', routerLink: '/dashboard-quimico/distribucion/cliente' },
        { label: 'Emitir Guía de Remisión', icon: 'pi pi-file-export', routerLink: '/dashboard-quimico/distribucion/emitir-guia' },
        { label: 'Historial de Guías', icon: 'pi pi-history', routerLink: '/dashboard-quimico/distribucion/historial-guia' } 
      ]
    },
    {
      label: 'Compras',
      icon: 'pi pi-shopping-cart',
      items: [
        { label: 'Registrar Proveedor', icon: 'pi pi-truck', routerLink: '/dashboard-quimico/compras/proveedor' },
        { label: 'Orden de Compra', icon: 'pi pi-file-edit', routerLink: '/dashboard-quimico/compras/orden-compra' },
        { label: 'Historial de Órdenes', icon: 'pi pi-history', routerLink: '/dashboard-quimico/compras/historial-ordenes' } 
      ]
    },
    {
      label: 'Almacén y Recepción',
      icon: 'pi pi-box', 
      items: [
        { label: 'Recepción de Mercadería', icon: 'pi pi-download', routerLink: '/dashboard-quimico/almacen/recepcion' },
        { label: 'Historial de Recepciones', icon: 'pi pi-history', routerLink: '/dashboard-quimico/almacen/historial-recepcion' }
      ]
    },
    {
      label: 'Inventario',
      icon: 'pi pi-objects-column', 
      items: [
        { label: 'Productos Registrados', icon: 'pi pi-list', routerLink: '/dashboard-quimico/inventario/producto' },
        { label: 'Visualizar Stock', icon: 'pi pi-eye', routerLink: '/dashboard-quimico/inventario/stock' }
      ]
    },
    {
      label: 'Administración',
      icon: 'pi pi-user-edit',
      items: [
        { label: 'Crear Nuevo Usuario', icon: 'pi pi-user-plus', routerLink: '/dashboard-quimico/admin/usuarios' }
      ]
    }
  ],
  'TECNICO FARMACEUTICO': [
    { label: 'Inicio', icon: 'pi pi-home', routerLink: '/dashboard-tecnico' },
    { label: 'Productos', icon: 'pi pi-list', routerLink: '/dashboard-tecnico/inventario/producto' },
    { label: 'Visualizar Stock', icon: 'pi pi-eye', routerLink: '/dashboard-tecnico/inventario/stock' },
    { label: 'Dispensación', icon: 'pi pi-external-link', routerLink: '/dashboard-tecnico/venta/dispensacion' }
  ]
};