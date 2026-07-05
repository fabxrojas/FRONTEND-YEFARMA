import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngresoProductoService {
  private apiUrl = 'https://backend-yefarma.onrender.com/api/ingresos';
  private unidadesUrl = 'https://backend-yefarma.onrender.com/api/unidades-detalle'; // NUEVA RUTA

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
    return this.http.get<any[]>('https://backend-yefarma.onrender.com/api/unidades-medida'); 
  }

  obtenerUnidadesDetalle(): Observable<any[]> {
    return this.http.get<any[]>(this.unidadesUrl);
  }
}