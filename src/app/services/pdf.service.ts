// pdf.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly EMAIL_ENDPOINT = 'tu-api-endpoint/send-pdf';
  private readonly TARGET_EMAIL = 'correo-destino@ejemplo.com'; // Email fijo donde se enviarán los PDFs

  constructor(private http: HttpClient) {}

  async generateAndSendPDF(formId: string) {
    try {
      // Mostrar loader
      this.showLoader();

      // Generar PDF
      const pdfBlob = await this.generatePDF(formId);
      
      // Crear FormData
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `${formId}.pdf`);
      formData.append('to', this.TARGET_EMAIL);
      formData.append('subject', `Nuevo formulario - ${formId}`);

      // Enviar al servidor
      await this.http.post(this.EMAIL_ENDPOINT, formData).toPromise();

      // Mostrar mensaje de éxito
      this.showSuccess();
    } catch (error) {
      console.error('Error:', error);
      this.showError();
    } finally {
      this.hideLoader();
    }
  }

  private async generatePDF(formId: string): Promise<Blob> {
    const element = document.getElementById(formId);
    if (!element) throw new Error('Elemento no encontrado');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    return pdf.output('blob');
  }

  private showLoader() {
    // Implementar loader
  }

  private hideLoader() {
    // Ocultar loader
  }

  private showSuccess() {
    alert('Formulario enviado exitosamente');
  }

  private showError() {
    alert('Error al enviar el formulario. Por favor, intente nuevamente.');
  }
}