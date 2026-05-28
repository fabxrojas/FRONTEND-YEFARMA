import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuiaRemisionService {
  private urlGuias = 'http://localhost:8081/api/guias-remision';
  private urlEstablecimientos = 'http://localhost:8081/api/establecimientos';
  private urlEstados = 'http://localhost:8081/api/estados-remision';

  constructor(private http: HttpClient) { }

  getEstablecimientos(): Observable<any[]> {
    return this.http.get<any[]>(this.urlEstablecimientos);
  }

  getEstados(): Observable<any[]> {
    return this.http.get<any[]>(this.urlEstados);
  }

  guardarGuia(guia: any): Observable<any> {
    return this.http.post<any>(this.urlGuias, guia);
  }

  buscarPorCodigo(codigo: string): Observable<any> {
    return this.http.get(`${this.urlGuias}/buscar/${codigo}`);
  }

  imprimirReportePDF(idGuia: number): Observable<Blob> {
    return this.http.get(`${this.urlGuias}/${idGuia}/pdf`, { responseType: 'blob' });
  }

  validarGuia(idGuia: number): Observable<any> {
    return this.http.put(`${this.urlGuias}/${idGuia}/validar`, {});
  }
}