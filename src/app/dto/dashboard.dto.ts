export interface DashboardDTO {
  totalVentasHoy: number;
  totalDispensacionesHoy: number;
  productosConStockBajo: number;
  topProductos: { producto: string; cantidadVendida: number }[];
  productosPorVencer: { producto: string; stockActual: number; tipoAlerta: string }[];
}