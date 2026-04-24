import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  // La URL debe coincidir con el @RequestMapping de tu ProductoController.java
  private apiUrl = 'http://localhost:9090/api/productos'; 

  constructor(private http: HttpClient) { }

  // Obtener los Tipos desde el Backend
  getTipos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos`);
  }

  // Obtener las Formas desde el Backend
  getFormas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formas`);
  }

  // Enviar el nuevo producto a la DB
  registrar(producto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registrar`, producto);
  }
}