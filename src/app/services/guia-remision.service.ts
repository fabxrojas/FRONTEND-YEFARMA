import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuiaRemisionService {
  private urlGuias = 'https://backend-yefarma.onrender.com/api/guias-remision';
  private urlEstablecimientos = 'https://backend-yefarma.onrender.com/api/establecimientos';
  private urlEstados = 'https://backend-yefarma.onrender.com/api/estados-remision';

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
    return this.http.get(`${this.urlGuias}/codigo/${codigo}`);
  }

  imprimirReportePDF(idGuia: number): Observable<Blob> {
    return this.http.get(`${this.urlGuias}/${idGuia}/pdf`, { responseType: 'blob' });
  }

  validarGuia(idGuia: number): Observable<any> {
    return this.http.put(`${this.urlGuias}/${idGuia}/validar`, {});
  }

  anularGuia(id: number): Observable<any> {
    return this.http.put(`${this.urlGuias}/${id}/anular`, {});
  }

  listarGuias(): Observable<any[]> {
    return this.http.get<any[]>(this.urlGuias);
  }
}