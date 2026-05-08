import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  // Asegúrate de que el puerto 8081 coincida con tu Backend de Spring Boot
  private apiUrl = 'http://localhost:8081/api/proveedores';

  constructor(private http: HttpClient) { }

  getProveedores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.log('Proveedores obtenidos:', data.length)),
      catchError(this.handleError)
    );
  }
  registrarProveedor(proveedor: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, proveedor).pipe(
      tap(res => console.log('Proveedor registrado con éxito:', res)),
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse) {
    let mensajeError = 'Ocurrió un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente (red, etc.)
      mensajeError = `Error: ${error.error.message}`;
    } else {
      // El backend retornó un código de error (400, 500, etc.)
      mensajeError = `Código: ${error.status}, Mensaje: ${error.message}`;
    }
    
    console.error(mensajeError);
    return throwError(() => new Error(mensajeError));
  }
}