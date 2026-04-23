import { MenuItem } from 'primeng/api';

export const MENU_ITEMS: { [key: string]: MenuItem[] } = {
  'QUIMICO FARMACEUTICO': [ 
    {
      label: 'Inventario',
      icon: 'pi pi-box',
      items: [
        { label: 'Registrar Producto', icon: 'pi pi-plus', routerLink: '/inventario/nuevo' }, 
        { label: 'Ingreso de Productos', icon: 'pi pi-download', routerLink: '/inventario/ingreso' }, 
        { label: 'Modificar Datos del Producto', icon: 'pi pi-pencil', routerLink: '/inventario/editar' }, 
        { label: 'Visualizar Inventario', icon: 'pi pi-eye', routerLink: '/inventario/stock' } 
      ]
    },
    {
      label: 'Reabastecimiento',
      icon: 'pi pi-sync',
      items: [
        { label: 'Registrar Proveedor', icon: 'pi pi-truck', routerLink: '/logistica/proveedor' }, 
        { label: 'Crear Guía de Remisión', icon: 'pi pi-file-plus', routerLink: '/logistica/crear-guia' }, 
        { label: 'Validar Guía de Remisión', icon: 'pi pi-check-square', routerLink: '/logistica/validar-guia' } 
      ]
    },
    {
      label: 'Procesos de Venta',
      icon: 'pi pi-shopping-cart',
      items: [
        { label: 'Dispensación', icon: 'pi pi-external-link', routerLink: '/inventario/dispensacion' } 
      ]
    },
    {
      label: 'Administración',
      icon: 'pi pi-user-edit',
      items: [
        { label: 'Crear Nuevo Usuario', icon: 'pi pi-user-plus', routerLink: '/admin/usuarios' } 
      ]
    }
  ],
  'TECNICO FARMACEUTICO': [ 
    {
      label: 'Inventario',
      icon: 'pi pi-box',
      items: [
        { label: 'Ingreso de Productos', icon: 'pi pi-download', routerLink: '/inventario/ingreso' }, 
        { label: 'Visualizar Inventario', icon: 'pi pi-eye', routerLink: '/inventario/stock' } 
      ]
    },
    {
      label: 'Ventas',
      icon: 'pi pi-shopping-cart',
      items: [
        { label: 'Dispensación', icon: 'pi pi-external-link', routerLink: '/inventario/dispensacion' } 
      ]
    }
  ]
};