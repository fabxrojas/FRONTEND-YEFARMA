import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngresoProductoService {
  private apiUrl = 'http://localhost:8081/api/ingresos';

  constructor(private http: HttpClient) { }

  // Recibe el arreglo completo de detalles y lo envía al endpoint /batch
  registrarIngresoBatch(detalles: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/batch`, detalles);
  }
}