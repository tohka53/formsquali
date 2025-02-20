import { Component, OnInit, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-formbink',
  standalone: false,
  templateUrl: './formbink.component.html',
  styleUrl: './formbink.component.css'
})
export class FormbinkComponent implements OnInit {
  private isProcessing = false;
  pdfFile: File | null = null;

  ngOnInit() {}

  // Prevenir cierre de pestaña durante el proceso
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (this.isProcessing) {
      event.preventDefault();
      event.returnValue = '¿Estás seguro de que deseas salir? El proceso de envío está en curso.';
      return event.returnValue;
    }
    return true;
  }

  // Generar ID único para el correo
  private generateUniqueId(): string {
    return `form_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Método para exportar PDF y enviar por correo
  async exportToPDF(form: NgForm) {
    this.isProcessing = true;
    
    try {
      if (form.invalid) {
        alert('Por favor, complete todos los campos requeridos');
        this.isProcessing = false;
        return;
      }

      alert('Generando PDF y enviando, por favor espere...');
      
      const element = document.getElementById('form-container');
      if (!element) {
        throw new Error('No se encontró el elemento del formulario');
      }

      // Configuración para capturar todo el contenido
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (2 * margin);
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = margin;
      let page = 1;

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
      heightLeft -= (pageHeight - 2 * margin);

      while (heightLeft > 0) {
        pdf.addPage();
        position = -pageHeight * page + margin;
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
        heightLeft -= (pageHeight - 2 * margin);
        page++;
      }
      
      const pdfBlob = pdf.output('blob');
      this.pdfFile = new File([pdfBlob], 'formulario-business-intake.pdf', { 
        type: 'application/pdf' 
      });

      const formData = new FormData();
      const uniqueId = this.generateUniqueId();

      // Agregar ID único al formData
      formData.append('form_id', uniqueId);

      // Obtener todos los campos del formulario
      const formValues = form.value;
      Object.keys(formValues).forEach(key => {
        if (formValues[key] !== null && formValues[key] !== undefined) {
          formData.append(key, formValues[key]);
        }
      });

      // Campos adicionales de FormSubmit
      formData.append('_captcha', 'false');
      formData.append('_next', 'https://formsqualitechboston.vercel.app/');
      formData.append('_subject', `Formulario Business Intake - ID: ${uniqueId}`);
      formData.append('_autoresponse', 'Gracias por completar el formulario');
      formData.append('_template', 'table');
      formData.append('_replyto', formValues.email);

      if (this.pdfFile) {
        formData.append('pdf', this.pdfFile, `formulario-business-intake-${uniqueId}.pdf`);
      }

      const formSubmitUrl = 'https://formsubmit.co/mecg1994@gmail.com';

      const response = await fetch(formSubmitUrl, {
        method: 'POST',
        body: formData
      });

      console.log('Respuesta completa:', response);
      const responseText = await response.text();
      console.log('Texto de respuesta:', responseText);

      if (!response.ok) {
        throw new Error(`Error en el envío: ${response.status}`);
      }

      pdf.save(`formulario-business-intake-${uniqueId}.pdf`);

      alert('Formulario enviado y PDF generado exitosamente');

      form.reset();
      this.pdfFile = null;

    } catch (error) {
      console.error('Error al enviar formulario:', error);
      
      if (error instanceof Error) {
        alert(`No se pudo enviar el formulario: ${error.message}`);
      } else {
        alert('Hubo un error desconocido al enviar el formulario');
      }
    } finally {
      this.isProcessing = false;
    }
  }

  saveForm() {
    alert('Guardando formulario...');
  }
}