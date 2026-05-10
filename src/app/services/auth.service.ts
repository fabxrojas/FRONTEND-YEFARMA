import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8081/api/auth/login';

  constructor(private http: HttpClient) { }

  login(loginData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, loginData).pipe(
      tap(user => {
        if (user && user.status === 'success') {
          localStorage.setItem('usuario', JSON.stringify(user));
        }
      })
    );
  }

  logout() {
    localStorage.clear();
  }

  // Ajustado para convertir el número (1 o 2) al nombre del menú
  getUserRole(): string {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const userObj = JSON.parse(userJson);

      // Mapeo directo según lo que vimos en tu consola (rol: 1 o 2)
      if (userObj.rol === 1) return 'QUIMICO FARMACEUTICO';
      if (userObj.rol === 2) return 'TECNICO FARMACEUTICO';

      return userObj.rol?.nombre || userObj.nombreRol || '';
    }
    return '';
  }

  getCurrentUserId(): number {
    const usuarioLogueado = localStorage.getItem('usuario');
    if (usuarioLogueado) {
      const userObj = JSON.parse(usuarioLogueado);

      return userObj.id_usuario || userObj.idUsuario || 1;
    }
    return 1;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('usuario');
  }
}