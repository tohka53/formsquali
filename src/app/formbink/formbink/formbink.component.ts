import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgForm } from '@angular/forms'; // Añade esta importación


@Component({
  selector: 'app-formbink',
  standalone: false,
  templateUrl: './formbink.component.html',
  styleUrl: './formbink.component.css'
})
export class FormbinkComponent implements OnInit {
  
  
    
    pdfFile: File | null = null;
  
    ngOnInit() {}
  
    // Método para exportar PDF y enviar por correo
    async exportToPDF(form: NgForm) {
      try {
        // Validar que el formulario sea válido
        if (form.invalid) {
          alert('Por favor, complete todos los campos requeridos');
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
        
        // Calcular dimensiones y escala
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
        
        // Agregar páginas según sea necesario
        let heightLeft = imgHeight;
        let position = margin;
        let page = 1;
  
        // Primera página
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
        heightLeft -= (pageHeight - 2 * margin);
  
        // Páginas adicionales
        while (heightLeft > 0) {
          pdf.addPage();
          position = -pageHeight * page + margin;
          pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
          heightLeft -= (pageHeight - 2 * margin);
          page++;
        }
        
        // Convertir PDF a Blob para envío
        const pdfBlob = pdf.output('blob');
        this.pdfFile = new File([pdfBlob], 'formulario-business-intake.pdf', { 
          type: 'application/pdf' 
        });
  
        // Crear FormData para envío
        const formData = new FormData();
  
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
        formData.append('_subject', 'Formulario Business Intake');
        formData.append('_autoresponse', 'Gracias por completar el formulario');
        formData.append('_template', 'table');
        formData.append('_replyto', formValues.email);
      
  
        // Adjuntar PDF
        if (this.pdfFile) {
          formData.append('pdf', this.pdfFile, 'formulario-business-intake.pdf');
          
        }
  
        // URL de FormSubmit - IMPORTANTE: reemplazar con tu email
        const formSubmitUrl = 'https://formsubmit.co/mmecabreragi@icloud.com';
  
        // Enviar formulario
        const response = await fetch(formSubmitUrl, {
          method: 'POST',
          body: formData
        });
  
        // Registro detallado de la respuesta
        console.log('Respuesta completa:', response);
        const responseText = await response.text();
        console.log('Texto de respuesta:', responseText);
  
        // Verificar respuesta
        if (!response.ok) {
          throw new Error(`Error en el envío: ${response.status}`);
        }
  
        // Guardar PDF localmente
        pdf.save('formulario-business-intake.pdf');
  
        // Mostrar mensaje de éxito
        alert('Formulario enviado y PDF generado exitosamente');
  
        // Limpiar formulario y PDF
        form.reset();
        this.pdfFile = null;
  
      } catch (error) {
        // Manejo de errores detallado
        console.error('Error al enviar formulario:', error);
        
        // Mensaje de error más descriptivo
        if (error instanceof Error) {
          alert(`No se pudo enviar el formulario: ${error.message}`);
        } else {
          alert('Hubo un error desconocido al enviar el formulario');
        }
      }
    }
  
    // Método para guardar formulario (si es necesario)
    saveForm() {
      alert('Guardando formulario...');
    }
  }