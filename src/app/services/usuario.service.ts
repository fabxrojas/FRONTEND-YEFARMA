import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // Base URL para el controlador de usuarios
  private apiUrl = 'http://localhost:8081/api/usuarios';

  constructor(private http: HttpClient) { }

  // 1. Obtener la lista completa de técnicos
  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`);
  }

  // 2. Registrar un nuevo técnico farmacéutico
  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, usuario);
  }

  // 3. Actualizar datos de un técnico existente
  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, usuario);
  }

  // 4. Eliminar un técnico de la base de datos
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }
}