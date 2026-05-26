import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardDTO } from '../dto/dashboard.dto'; // Asegúrate de tener esta interfaz

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8081/api/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<DashboardDTO> {
    return this.http.get<DashboardDTO>(this.apiUrl);
  }
}