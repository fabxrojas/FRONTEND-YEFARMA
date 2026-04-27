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
      label: 'Inicio',
      icon: 'pi pi-home',
      routerLink: '/dashboard-tecnico' // Ambos ven el mismo resumen inicial
    },
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