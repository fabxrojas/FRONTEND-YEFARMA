import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoPagoService {

  private apiUrl = 'https://backend-yefarma.onrender.com/api/tipos-pago';

  constructor(private http: HttpClient) { }

  getTiposPago(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}