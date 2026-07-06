import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngresoProductoService {
  private apiUrl = 'http://localhost:8081/api/ingresos';
  private unidadesUrl = 'http://localhost:8081/api/unidades-detalle'; // NUEVA RUTA

  constructor(private http: HttpClient) { }

  registrarIngresoBatch(detalles: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/batch`, detalles);
  }

  getHistorialRecepciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }

  crearUnidadDetalle(payload: any): Observable<any> {
    return this.http.post<any>(this.unidadesUrl, payload);
  }

  obtenerUnidadesMedidaBase(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8081/api/unidades-medida'); 
  }

  obtenerUnidadesDetalle(): Observable<any[]> {
    return this.http.get<any[]>(this.unidadesUrl);
  }
}