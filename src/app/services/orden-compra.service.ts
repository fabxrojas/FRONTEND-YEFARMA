import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompraService {
  private apiUrl = 'http://localhost:8081/api/ordenes-compra';

  constructor(private http: HttpClient) { }

  listarOrdenes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearOrden(orden: any): Observable<any> {
    return this.http.post(this.apiUrl, orden);
  }

  buscarPorCodigo(codigo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/codigo/${codigo}`);
  }

  getHistorialOrdenes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }

  anularOrdenCompra(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/anular`, {});
  }
}