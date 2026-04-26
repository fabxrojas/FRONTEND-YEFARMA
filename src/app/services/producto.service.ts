import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:9090/api/productos'; 

  constructor(private http: HttpClient) { }

  // 1. OBTENER TODO EL INVENTARIO (Nuevo: Necesario para llenar la tabla)
  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`);
  }

  // Obtener los Tipos desde el Backend
  getTipos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos`);
  }

  // Obtener las Formas desde el Backend
  getFormas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formas`);
  }

  // 2. REGISTRAR O ACTUALIZAR (Modificado: Spring Boot usará el ID para decidir si hace INSERT o UPDATE)
  registrar(producto: any): Observable<any> {
    // Si el producto ya tiene id_producto, Hibernate hará un Update automáticamente
    return this.http.post<any>(`${this.apiUrl}/registrar`, producto);
  }

  // 3. ELIMINAR PRODUCTO (Nuevo: Para el botón de la papelera)
  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}