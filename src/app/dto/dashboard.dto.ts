export interface DashboardDTO {
  totalVentasHoy: number;
  totalDispensacionesHoy: number;
  productosConStockBajo: number;
  topProductos: { producto: string; cantidadVendida: number }[];
  productosPorVencer: { producto: string; stockActual: number; tipoAlerta: string }[];
}

// 1. Creamos la estructura para los datos de los gráficos
export interface GraficoDTO {
  etiqueta: string;
  valor: number;
}

// 2. Actualizamos tu DashboardDTO
export interface DashboardDTO {
  totalVentasHoy: number;
  totalDispensacionesHoy: number;
  productosConStockBajo: number;
  topProductos: { producto: string; cantidadVendida: number }[];
  productosPorVencer: { producto: string; stockActual: number; tipoAlerta: string }[];
  
  // 3. Agregamos las nuevas variables con el signo "?" para hacerlas opcionales
  dispensacionesDiarias?: GraficoDTO[];
  dispensacionesMensuales?: GraficoDTO[];
  dispensacionesPorProveedor?: GraficoDTO[];
  rendimientoPersonal?: GraficoDTO[];
}