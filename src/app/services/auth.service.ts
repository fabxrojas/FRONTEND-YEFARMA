import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // URL de tu API de Java (asegúrate de que el puerto sea el 9090)
  private apiUrl = 'http://localhost:9090/api/auth/login';

  constructor(private http: HttpClient) { }

  /**
   * Envía las credenciales al backend de Yefarma
   * @param loginData Contiene username (NombreUser) y password (Contrasena)
   */
  login(loginData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, loginData);
  }

  // Método para cerrar sesión (limpiar el localStorage)
  logout() {
    localStorage.clear();
  }
}