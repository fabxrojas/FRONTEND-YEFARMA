import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  // Puerto 8081 según tu configuración de Spring Boot
  private apiUrl = 'http://localhost:8081/api/proveedores';
  // Nueva ruta para el stock del proveedor
  private stockUrl = 'http://localhost:8081/api/stock-proveedor';

  constructor(private http: HttpClient) { }


  obtenerStockPorProveedor(idProveedor: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.stockUrl}/proveedor/${idProveedor}`).pipe(
      tap(data => console.log(`Stock cargado para proveedor ${idProveedor}:`, data.length)),
      catchError(this.handleError)
    );
  }



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

  eliminarProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log(`Proveedor con ID ${id} eliminado`)),
      catchError(this.handleError)
    );
  }

  actualizarProveedor(id: number, proveedor: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, proveedor).pipe(
      tap(() => console.log(`Proveedor con ID ${id} actualizado`)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let mensajeError = 'Ocurrió un error inesperado';
    if (error.error instanceof ErrorEvent) {
      mensajeError = `Error: ${error.error.message}`;
    } else {
      mensajeError = `Código: ${error.status}, Mensaje: ${error.message}`;
    }
    console.error(mensajeError);
    return throwError(() => new Error(mensajeError));
  }
}