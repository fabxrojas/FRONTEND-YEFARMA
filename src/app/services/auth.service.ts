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
      tap(res => {
        console.log("Respuesta completa del servidor:", res);

        if (res && res.status === 'success') {
          localStorage.setItem('usuario', JSON.stringify(res));
        }
      })
    );
  }

  logout() {
    localStorage.clear();
  }

  getUserRole(): string {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const userObj = JSON.parse(userJson);
      if (userObj.rol === 1) return 'QUIMICO FARMACEUTICO';
      if (userObj.rol === 2) return 'TECNICO FARMACEUTICO';
      return userObj.rol?.nombre || userObj.nombreRol || '';
    }
    return '';
  }

  getRolUsuario(): number {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const userObj = JSON.parse(userJson);
      return userObj.rol || 0;
    }
    return 0;
  }

  getCurrentUserId(): number {
    const usuarioLogueado = localStorage.getItem('usuario');
    if (usuarioLogueado) {
      const userObj = JSON.parse(usuarioLogueado);
      console.log("Estructura completa del usuario en localStorage:", userObj);

      return userObj.id_usuario || userObj.idUsuario || userObj.id || 0;
    }
    return 0;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('usuario');
  }

  loginPaso1(credenciales: { username: string, password: string }): Observable<any> {
    return this.http.post('http://localhost:8081/api/auth/login-paso1', credenciales);
  }

  loginPaso2(datos: { username: string, codigo: string }): Observable<any> {
    return this.http.post<any>('http://localhost:8081/api/auth/login-paso2', datos).pipe(
      tap(res => {
        if (res && res.status === 'success') {
          const usuarioGuardar = {
            token: res.token,
            rol: res.rol,
            idUsuario: res.idUsuario,

            // CAMBIA ESTA LÍNEA: Usamos datos.username que viene directo de tu pantalla de login
            nombre: res.nombre || datos.username
          };

          localStorage.removeItem('usuario');
          localStorage.setItem('usuario', JSON.stringify(usuarioGuardar));
        }
      })
    );
  }
}