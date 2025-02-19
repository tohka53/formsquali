// src/app/services/email.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(private http: HttpClient) {}

  sendPdfByEmail(pdfBlob: Blob) {
    const formData = new FormData();
    formData.append('pdf', pdfBlob, 'formulario.pdf');

    return this.http.post('/api/send-email', formData);
  }
}