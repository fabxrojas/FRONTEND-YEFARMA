import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private url = 'http://localhost:8081/api/inventario';

  constructor(private http: HttpClient) {}

  obtenerStock(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  registrarBajaLote(payload: any): Observable<any> {
    return this.http.post<any>(`${this.url}/baja`, payload);
  }

  obtenerMotivosBaja(): Observable<any[]> {
  return this.http.get<any[]>(`${this.url}/motivos-baja`);
}
}