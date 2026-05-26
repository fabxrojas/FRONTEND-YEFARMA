import { MenuItem } from 'primeng/api';

export const MENU_ITEMS: { [key: string]: MenuItem[] } = {
  'QUIMICO FARMACEUTICO': [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      routerLink: '/dashboard-quimico' // Ruta para ver el resumen/estado
    },
    {
      label: 'Inventario',
      icon: 'pi pi-box',
      items: [
        { label: 'Productos', icon: 'pi pi-list', routerLink: '/dashboard-quimico/inventario/nuevo' },
        { label: 'Ingreso de Productos', icon: 'pi pi-download', routerLink: '/dashboard-quimico/inventario/ingreso' },
        { label: 'Visualizar Inventario', icon: 'pi pi-eye', routerLink: '/dashboard-quimico/inventario/stock' }
      ]
    },
    {
      label: 'Reabastecimiento',
      icon: 'pi pi-sync',
      items: [
        { label: 'Registrar Proveedor', icon: 'pi pi-truck', routerLink: '/dashboard-quimico/reabastecimiento/proveedor' },
        { label: 'Crear Guía de Remisión', icon: 'pi pi-file-plus', routerLink: '/dashboard-quimico/reabastecimiento/crear-guia' },
        { label: 'Validar Guía de Remisión', icon: 'pi pi-check-square', routerLink: '/dashboard-quimico/reabastecimiento/validar-guia' }
      ]
    },
    {
      label: 'Procesos de Venta',
      icon: 'pi pi-shopping-cart',
      items: [
        { label: 'Dispensación', icon: 'pi pi-external-link', routerLink: '/dashboard-quimico/venta/dispensacion' }
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
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      routerLink: '/dashboard-tecnico' 
    },
    {
      label: 'Inventario',
      icon: 'pi pi-box',
      items: [
        { label: 'Ingreso de Productos', icon: 'pi pi-download', routerLink: '/dashboard-tecnico/inventario/ingreso' },
        { label: 'Visualizar Inventario', icon: 'pi pi-eye', routerLink: '/dashboard-tecnico/inventario/stock' }
      ]
    },
    {
      label: 'Ventas',
      icon: 'pi pi-shopping-cart',
      items: [
        { label: 'Dispensación', icon: 'pi pi-external-link', routerLink: '/dashboard-tecnico/venta/dispensacion' }
      ]
    }
  ]
};