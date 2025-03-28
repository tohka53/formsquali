import { Component, OnInit, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-formbink',
  standalone: false,
  templateUrl: './formbink.component.html',
  styleUrls: ['./formbink.component.css']
})
export class FormbinkComponent implements OnInit {
  private isProcessing = false;
  pdfFile: File | null = null;
  formData = {
    email: ''
  };

  ngOnInit() {}

  // Prevenir cierre de pestaña durante el proceso
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (this.isProcessing) {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to go out? The shipping process is in progress.';
      return event.returnValue;
    }
    return true;
  }

  // Generar ID único para el correo
  private generateUniqueId(): string {
    return `form_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Método actualizado para exportar PDF y enviar por correo
  async exportToPDF(form: NgForm) {
    this.isProcessing = true;
    
    try {
      if (form.invalid) {
        alert('Please complete all required fields');
        this.isProcessing = false;
        return;
      }
      if (!this.formData.email) {
        alert('Please enter a valid email address');
        this.isProcessing = false;
        return;
      }

      alert('Please allow up to 2 minutes, for form to be sent..');
      
      const element = document.getElementById('form-container');
      if (!element) {
        throw new Error('Form element not found');
      }

      // Mejorar la configuración de html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Aumentar la escala para mejor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        logging: true, // Activar logging para debug
        scrollX: 0,
        scrollY: -window.scrollY,
        height: element.scrollHeight, // Asegurar que capture todo el alto
        onclone: (clonedDoc) => {
          // Ajustar el elemento clonado para mejor renderizado
          const clonedElement = clonedDoc.getElementById('form-container');
          if (clonedElement) {
            clonedElement.style.position = 'relative';
            clonedElement.style.height = 'auto';
            clonedElement.style.minHeight = '100%';
          }
        }
      });

      // Configurar el PDF con márgenes más específicos
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Calcular dimensiones considerando márgenes
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (2 * margin);
      
      const imgProps = pdf.getImageProperties(imgData);
      const scaleFactor = contentWidth / imgProps.width;
      const imgHeight = imgProps.height * scaleFactor;
      
      let heightLeft = imgHeight;
      let position = margin;
      let page = 1;

      // Ajustar la primera página
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
      heightLeft -= (pageHeight - 2 * margin);

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        pdf.addPage();
        position = margin - (pageHeight * page);
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
        heightLeft -= (pageHeight - 2 * margin);
        page++;
      }

      const pdfBlob = pdf.output('blob');
      this.pdfFile = new File([pdfBlob], 'form-business-intake.pdf', { 
        type: 'application/pdf' 
      });

      const formData = new FormData();
      const uniqueId = this.generateUniqueId();

      // Agregar ID único al formData
      formData.append('form_id', uniqueId);
      formData.append('email', this.formData.email);

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
      formData.append('_subject', `Form Business Intake - ID: ${uniqueId}`);
      formData.append('_autoresponse', 'Thank you for completing the form. We will contact you soon.');
      formData.append('_template', 'table');
      formData.append('_replyto', formValues.email);
      formData.append('_replyto', this.formData.email);
      formData.append('_cc', this.formData.email);

      if (this.pdfFile) {
        formData.append('pdf', this.pdfFile, `form-business-intake-${uniqueId}.pdf`);
      }

      const formSubmitUrl = `https://formsubmit.co/qualitech@qualitechboston.com?_cc=${encodeURIComponent(this.formData.email)}`;

      const response = await fetch(formSubmitUrl, {
        method: 'POST',
        body: formData
      });

      console.log('Complete answer::', response);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Guardar el PDF localmente
      pdf.save(`form-business-intake-${uniqueId}.pdf`);

      alert('Form submitted and PDF generated successfully!');

      // Resetear el formulario y los datos
      form.reset();
      this.formData.email = '';
      this.pdfFile = null;

    } catch (error) {
      console.error('Error to Send Form:', error);
      
      if (error instanceof Error) {
        alert(`The form could not be submitted: ${error.message}`);
      } else {
        alert('There was an unknown error submitting the form');
      }
    } finally {
      this.isProcessing = false;
    }
  }

  saveForm() {
    alert('Guardando formulario...');
  }
}