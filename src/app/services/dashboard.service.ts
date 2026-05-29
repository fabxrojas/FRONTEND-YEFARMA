import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8081/api/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardData(idUsuario?: number): Observable<any> {
    let params = new HttpParams();
    if (idUsuario) {
      params = params.set('idUsuario', idUsuario.toString());
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  getStockBajoDetalle(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock-bajo-detalle`);
  }
}