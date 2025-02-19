import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { EmailService } from '../services/email.service'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-formbink',
  standalone: false,
  templateUrl: './formbink.component.html',
  styleUrl: './formbink.component.css'
})
export class FormbinkComponent implements OnInit {
  constructor(private emailService: EmailService) {}
  
  ngOnInit() {}

  async exportToPDF() {
    try {
      alert('Generando PDF, por favor espere...');
      
      const element = document.getElementById('form-container');
      if (!element) {
        throw new Error('No se encontró el elemento del formulario');
      }

      // Forzar ancho de escritorio
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      element.style.width = '1024px';
      element.style.maxWidth = '1024px';

      // Crear el footer temporalmente
      const footer = document.createElement('div');
      footer.style.width = '100%';
      footer.style.padding = '20px';
      footer.style.borderTop = '1px solid black';
      footer.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; font-size: 12px;">
          <div style="text-align: left;">Formulario de Business Intake</div>
          <div style="text-align: center;">${new Date().toLocaleDateString()}</div>
        </div>
      `;
      element.appendChild(footer);

      // Configuración de html2canvas
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('form-container');
          if (clonedElement) {
            clonedElement.style.width = '1024px';
            clonedElement.style.maxWidth = '1024px';
            clonedElement.querySelectorAll('input').forEach(input => {
              input.style.width = input.offsetWidth + 'px';
            });
          }
        }
      });

      // Restaurar el ancho original
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.removeChild(footer); // Remover el footer temporal

      // Configuración del PDF
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Configurar dimensiones
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (2 * margin);
      const aspectRatio = canvas.height / canvas.width;
      const contentHeight = contentWidth * aspectRatio;

      let heightLeft = contentHeight;
      let position = margin;
      let page = 1;

      // Primera página
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= (pageHeight - 2 * margin);

      // Páginas adicionales
      while (heightLeft >= 0) {
        pdf.addPage();
        position = -pageHeight * page + margin;
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= (pageHeight - 2 * margin);
        page++;
      }

      // Convertir a Blob para enviar por email
      const pdfBlob = pdf.output('blob');

      // Enviar por email
      await this.emailService.sendPdfByEmail(pdfBlob).toPromise();
      
      // Guardar localmente
      pdf.save('formulario-business-intake.pdf');
      
      alert('PDF generado y enviado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al generar o enviar el PDF. Por favor, intente nuevamente.');
    }
  }

  saveForm() {
    alert('Guardando formulario...');
  }
}