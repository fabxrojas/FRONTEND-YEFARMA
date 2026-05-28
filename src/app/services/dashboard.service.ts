import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8081/api/dashboard'; // Ajusta tu puerto si es necesario

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getStockBajoDetalle(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/stock-bajo-detalle`);
}
}