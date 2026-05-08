import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // URL de tu API de Java (asegúrate de que el puerto sea el 9090)
  private apiUrl = 'http://localhost:8081/api/auth/login';

  constructor(private http: HttpClient) { }

  login(loginData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, loginData);
  }

  // Método para cerrar sesión (limpiar el localStorage)
  logout() {
    localStorage.clear();
  }

  getCurrentUserId(): number {
    const usuarioLogueado = localStorage.getItem('usuario'); 
    
    if (usuarioLogueado) {
      // Convertimos el texto guardado de vuelta a un objeto JavaScript
      const userObj = JSON.parse(usuarioLogueado);
      
      return userObj.id_usuario || userObj.idUsuario || 1; 
    }
    
    // Si por alguna razón no hay nadie en memoria, devolvemos 1 por defecto (para evitar errores)
    return 1; 
  }
}