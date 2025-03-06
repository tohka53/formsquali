import { Component, OnInit, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-formcpay',
  standalone: false,
  templateUrl: './formcpay.component.html',
  styleUrl: './formcpay.component.css'
})
export class FormcpayComponent  implements OnInit {
    private isProcessing = false;
    pdfFile: File | null = null;
    formData: any = {
      // Datos del contacto
      contactName: '',
      contactEmail: '',
      
      // Tipo de empresa e información básica
      employeeCount: '',
      legalName: '',
      dbaName: '',
      
      // Dirección
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      
      // Período de pago
      startDate: '',
      endDate: '',
      firstCheckDate: '',
      
      // Deducciones
      deduction1Type: '',
      deduction1Abbr: '',
      deduction1Tax: '',
      deduction2Type: '',
      deduction2Abbr: '',
      deduction2Tax: '',
      deduction3Type: '',
      deduction3Abbr: '',
      deduction3Tax: '',
      deduction4Type: '',
      deduction4Abbr: '',
      deduction4Tax: '',
      deduction5Type: '',
      deduction5Abbr: '',
      deduction5Tax: '',
      
      // Tipos de ingresos
      earning1Type: '',
      earning1Abbr: '',
      earning1Taxable: '',
      earning2Type: '',
      earning2Abbr: '',
      earning2Taxable: '',
      earning3Type: '',
      earning3Abbr: '',
      earning3Taxable: '',
      earning4Type: '',
      earning4Abbr: '',
      earning4Taxable: '',
      
      // Información fiscal federal
      fein: '',
      
      // Información fiscal estatal
      stateIncomeTaxId1: '',
      stateIncomeTaxState1: '',
      stateIncomeTaxId2: '',
      stateIncomeTaxState2: '',
      stateUnemploymentTaxId1: '',
      suiRate1: '',
      stateUnemploymentTaxId2: '',
      suiRate2: '',
      
      // Información bancaria
      bankName: '',
      routingNumber: '',
      accountNumber: '',
      
      // Información para nómina doméstica
      primaryTaxFilerName: '',
      primaryTaxFilerSSN: '',
      otherTaxFilerName: '',
      otherTaxFilerSSN: ''
    };
  
    ngOnInit() {}
  
    // Prevenir cierre de pestaña durante el proceso
    @HostListener('window:beforeunload', ['$event'])
    handleBeforeUnload(event: BeforeUnloadEvent) {
      if (this.isProcessing) {
        event.preventDefault();
        event.returnValue = 'Are you sure you want to go out? The form submission process is in progress.';
        return event.returnValue;
      }
      return true;
    }
  
    // Generar ID único para el correo
    private generateUniqueId(): string {
      return `payroll_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  
    // Método para exportar PDF y enviar por correo
    async exportToPDF(form: NgForm) {
      this.isProcessing = true;
      
      try {
        if (form.invalid) {
          alert('Por favor complete todos los campos requeridos');
          this.isProcessing = false;
          return;
        }
  
        alert('Generando PDF y enviando, por favor espere...');
        
        // Ocultar temporalmente el botón de envío para que no aparezca en el PDF
        const sendButton = document.querySelector('button[type="button"]');
        if (sendButton) {
          (sendButton as HTMLElement).style.display = 'none';
        }
        
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
              #form-container { 
                width: 1024px !important; 
                margin: 0 auto !important; 
              }
              input, select { 
                font-size: 14px !important; 
              }
              .border-b { 
                border-bottom-width: 1px !important; 
                border-bottom-color: black !important; 
              }
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
          orientation: 'portrait',
          unit: 'mm',
          format: 'letter',
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
        this.pdfFile = new File([pdfBlob], 'company-payroll-setup.pdf', { 
          type: 'application/pdf' 
        });
  
        // Generar FormData para envío
        const formData = new FormData();
        const uniqueId = this.generateUniqueId();
  
        // Agregar ID único al formData
        formData.append('form_id', uniqueId);
        
        // Asegurarse de que el email se adjunte correctamente
        formData.append('email', this.formData.contactEmail);
  
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
        formData.append('_subject', `Company Payroll Setup - ID: ${uniqueId}`);
        formData.append('_autoresponse', 'Thank you for completing the form. We will contact you soon.');
        formData.append('_template', 'table');
        formData.append('_replyto', this.formData.contactEmail);
        formData.append('_cc', this.formData.contactEmail);
        
        if (this.pdfFile) {
          formData.append('pdf', this.pdfFile, `company-payroll-setup-${uniqueId}.pdf`);
        }
  
        const formSubmitUrl = `https://formsubmit.co/qualitech@qualitechboston.com?_cc=${encodeURIComponent(this.formData.contactEmail)}`;
  
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
  
        pdf.save(`company-payroll-setup-${uniqueId}.pdf`);
  
        alert('Form submitted and PDF generated successfully!');
  
        // Mostrar nuevamente el botón de envío
        if (sendButton) {
          (sendButton as HTMLElement).style.display = '';
        }
  
      } catch (error) {
        console.error('Error to send Form:', error);
        
        if (error instanceof Error) {
          alert(`The form could not be submitted: ${error.message}`);
        } else {
          alert('There was an unknown error submitting the form');
        }
        
        // Restaurar el botón en caso de error
        const sendButton = document.querySelector('button[type="button"]');
        if (sendButton) {
          (sendButton as HTMLElement).style.display = '';
        }
      } finally {
        this.isProcessing = false;
      }
    }
  
    saveForm() {
      alert('Guardando formulario...');
      // Aquí puedes implementar la lógica para guardar el formulario sin enviarlo
    }
  }
 