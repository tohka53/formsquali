// src/app/services/email.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
    private apiUrl = 'https://formsqualitechboston.vercel.app/api/send-email';
  
  constructor(private http: HttpClient) { }

  sendEmailWithPdf(pdfBlob: Blob) {
    const formData = new FormData();
    formData.append('pdf', pdfBlob, 'formulario.pdf');
    formData.append('to', 'correo-destino@ejemplo.com'); // El correo al que quieres enviar
    formData.append('subject', 'Nuevo Formulario');
 
     // Agrega headers para debugging
     const headers = new HttpHeaders({
        'Accept': 'application/json'
      });

    return this.http.post(this.apiUrl, formData);
  }
}