import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'https://formsqualitechboston.vercel.app/send-email'; // Reemplaza con la URL de tu backend

  constructor(private http: HttpClient) { }

  sendEmail(to: string, subject: string, text: string): Observable<any> {
    const emailData = {
      to: to,
      subject: subject,
      text: text
    };

    return this.http.post(this.apiUrl, emailData);
  }
}