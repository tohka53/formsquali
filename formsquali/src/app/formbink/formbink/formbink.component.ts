import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-formbink',
  standalone: false,
  templateUrl: './formbink.component.html',
  styleUrl: './formbink.component.css'
})
export class FormbinkComponent implements OnInit {

  ngOnInit() {
    // Inicialización si es necesaria
  }


  async exportToPDF() {
    try {
      // Mostrar indicador de carga
      alert('Generando PDF, por favor espere...');
      
      const element = document.getElementById('form-container');
      if (!element) {
        throw new Error('No se encontró el elemento del formulario');
      }

      // Configuración optimizada para html2canvas
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        logging: false
      });

      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Configurar dimensiones
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      // Primera página
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        pdf.addPage();
        position = -pageHeight * page;
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        page++;
      }

      // Guardar PDF
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