import { Component, OnInit, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-formsc',
  standalone: false,
  templateUrl: './formsc.component.html',
  styleUrl: './formsc.component.css'
})
export class FormscComponent implements OnInit {
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
        alert('Por favor complete todos los campos requeridos');
        this.isProcessing = false;
        return;
      }
      if (!this.formData.email) {
        alert('Por favor ingrese una dirección de email válida');
        this.isProcessing = false;
        return;
      }

      alert('Generando PDF y enviando, por favor espere...');
      
      const element = document.getElementById('form-container');
      if (!element) {
        throw new Error('Elemento del formulario no encontrado');
      }

      // Guardar el ancho original y el overflow para restaurarlos después
      const originalWidth = element.style.width;
      const originalOverflow = document.body.style.overflow;
      
      // Establecer un ancho fijo para una generación de PDF consistente
      element.style.width = '1024px';
      document.body.style.overflow = 'visible';

      // Configuración mejorada para capturar el contenido de manera consistente
      const canvas = await html2canvas(element, {
        scale: 2, // Escala más alta para mejor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: 1024, // Forzar un ancho de ventana consistente
        width: 1024, // Forzar el ancho del elemento
        height: element.scrollHeight,
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          // Agregar un estilo para asegurar un renderizado consistente en el documento clonado
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            #form-container { width: 1024px !important; margin: 0 !important; }
            input, select { font-size: 14px !important; }
          `;
          clonedDoc.head.appendChild(style);
          
          // Asegurarse de que todos los campos del formulario sean visibles en el documento clonado
          const formContainer = clonedDoc.getElementById('form-container');
          if (formContainer) {
            formContainer.style.width = '1024px';
            formContainer.style.transform = 'none';
          }
        }
      });

      // Restaurar los estilos originales
      element.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
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
      this.pdfFile = new File([pdfBlob], 'form-schedulec.pdf', { 
        type: 'application/pdf' 
      });

      // El resto del código de envío del formulario se mantiene igual
      const formData = new FormData();
      const uniqueId = this.generateUniqueId();

      // Agregar ID único al formData
      formData.append('form_id', uniqueId);
      
      // Asegurarse de que el email se adjunte correctamente
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
      formData.append('_subject', `Form Schedule C - ID: ${uniqueId}`);
      formData.append('_autoresponse', 'Thank you for completing the form. We will contact you soon.');
      formData.append('_template', 'table');
      formData.append('_replyto', this.formData.email);
      formData.append('_cc', this.formData.email); // Enviar copia al email proporcionado
      
      if (this.pdfFile) {
        formData.append('pdf', this.pdfFile, `form-schedulec-${uniqueId}.pdf`);
      }

      const formSubmitUrl = `https://formsubmit.co/qualitech@qualitechboston.com?_cc=${encodeURIComponent(this.formData.email)}`;

      const response = await fetch(formSubmitUrl, {
        method: 'POST',
        body: formData
      });

      console.log('Respuesta completa:', response);
      const responseText = await response.text();
      console.log('Texto de respuesta:', responseText);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      pdf.save(`form-schedulec-${uniqueId}.pdf`);

      alert('¡Formulario enviado y PDF generado exitosamente!');

      // Resetear el formulario y los datos
      form.reset();
      this.formData.email = '';
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