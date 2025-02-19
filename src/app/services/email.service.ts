// src/app/services/email.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'https://formsqualitechboston.vercel.app/api/send-email';

  constructor(private http: HttpClient) {}

  sendPdfByEmail(pdfBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('pdf', pdfBlob, 'formulario.pdf');

    return this.http.post(this.apiUrl, formData);
  }
}