// src/app/services/email.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'https://formsqualitechboston.vercel.app/api/send-email';

  constructor(private http: HttpClient) { }

  sendEmailWithPdf(pdfBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('pdf', pdfBlob, 'formulario.pdf');
    formData.append('to', 'correo-destino@ejemplo.com');
    formData.append('subject', 'Nuevo Formulario Business Intake');

    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.post(this.apiUrl, formData, { headers }).pipe(
      tap(response => console.log('Respuesta del servidor:', response)),
      catchError(error => {
        console.error('Error detallado:', error);
        return throwError(() => error);
      })
    );
  }
}