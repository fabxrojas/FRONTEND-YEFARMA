import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DispensacionService {

  private apiUrl = 'http://localhost:8081/api/dispensacion';

  constructor(private http: HttpClient) { }

  procesarDispensacion(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/procesar`, request);
  }

  listarConStock(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar-con-stock`);
  }
  obtenerTicketPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ticket/${id}`, { responseType: 'blob' });
  }
}