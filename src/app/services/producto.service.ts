import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8081/api/productos';
  private marcaUrl = 'http://localhost:8081/api/marcas';

  constructor(private http: HttpClient) { }

  // 1. OBTENER TODO EL INVENTARIO 
  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`);
  }

  getTipos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos`);
  }

  getFormas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formas`);
  }

  getMarcas(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8081/api/marcas');
  }

  // NUEVO: Obtiene solo las marcas asociadas a un producto específico
  getMarcasPorProducto(idProducto: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idProducto}/marcas`);
  }

  getPresentaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/presentaciones`);
  }

  getUnidadesMedida(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/unidades-medida`);
  }
  getUnidadesDetalle(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/unidades-detalle`);
  }

  getProveedores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/proveedores`);
  }

  buscarPorNombre(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar?query=${query}`);
  }

  // MÉTODOS PARA EL MODAL DE MARCAS 

  // Crea una marca nueva y la asocia al producto en la tabla producto_marca
  guardarYAsociarMarca(payload: { nombreMarca: string, idProducto: number }): Observable<any> {
    return this.http.post<any>(`${this.marcaUrl}/guardar-y-asociar`, payload);
  }

  guardarUnidadDetalle(payload: { id_unid_medi: number, cantidad: number }): Observable<any> {
    return this.http.post<any>(`http://localhost:8081/api/unidades-detalle`, payload);
  }

  // Asocia una marca que ya existe en la BD a un producto que no la tenía mapeada
  asociarMarcaExistente(payload: { idMarca: number, idProducto: number }): Observable<any> {
    return this.http.post<any>(`${this.marcaUrl}/asociar-existente`, payload);
  }

  // ---------------------------------------

  registrar(producto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registrar`, producto);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}