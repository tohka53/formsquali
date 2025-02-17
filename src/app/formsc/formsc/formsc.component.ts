import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-formsc',
  standalone: false,
  templateUrl: './formsc.component.html',
  styleUrl: './formsc.component.css'
})
export class FormscComponent {

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
      element.style.width = '1024px'; // Ancho fijo de escritorio
      element.style.maxWidth = '1024px';

        // Crear el footer temporalmente
        const footer = document.createElement('div');
        footer.style.width = '100%';
        footer.style.padding = '20px';
        footer.style.borderTop = '1px solid black';
        footer.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; font-size: 12px;">
            <div style="text-align: left;">REAL ESTATE PROPERTY DETAIL FORM</div>
           String()}</div>
          </div>
        `;
        element.appendChild(footer);



      // Configuración de html2canvas
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: 1024, // Forzar ancho de ventana
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('form-container');
          if (clonedElement) {
            clonedElement.style.width = '1024px';
            clonedElement.style.maxWidth = '1024px';
            // Asegurar que todos los inputs mantengan su formato
            clonedElement.querySelectorAll('input').forEach(input => {
              input.style.width = input.offsetWidth + 'px';
            });
          }
        }
      });

      // Restaurar el ancho original
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;

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

      pdf.save('formulario-business-intake.pdf');
      alert('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intente nuevamente.');
    }
  }

  saveForm() {
    alert('Guardando formulario...');
  }
  
}
