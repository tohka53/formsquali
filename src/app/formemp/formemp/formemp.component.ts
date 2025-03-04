import { Component, OnInit, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-formemp',
  standalone: false,
  templateUrl: './formemp.component.html',
  styleUrl: './formemp.component.css'
})
export class FormempComponent implements OnInit {
  private isProcessing = false;
  pdfFile: File | null = null;
  formData = {
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    dob: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  };
  selectedImage: string | ArrayBuffer | null = null;
  isMobile: boolean = false;

  ngOnInit() {
    // Detectar si es un dispositivo móvil al iniciar
    this.checkDevice();
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', () => {
      this.checkDevice();
    });
  }

  // Verificar si es un dispositivo móvil
  private checkDevice() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      document.body.classList.add('mobile-device');
    } else {
      document.body.classList.remove('mobile-device');
    }
  }

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

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Opcional: Verificar tipo de archivo
      if (!file.type.includes('image/')) {
        console.error('El archivo seleccionado no es una imagen');
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.selectedImage = e.target?.result || null;
      };
      
      reader.readAsDataURL(file);
    }
  }

  // Método para exportar PDF y enviar por correo
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

      alert('Generating PDF and sending, please wait...');
      
      // Preparar el formulario para la exportación
      await this.prepareFormForExport();
      
      const element = document.getElementById('form-container');
      if (!element) {
        throw new Error('Form element not found');
      }

      // Configuración adaptada para dispositivos móviles
      const canvas = await html2canvas(element, {
        scale: this.isMobile ? 1 : 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: this.isMobile ? window.innerWidth : 1024,
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        height: element.scrollHeight
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
      const margin = this.isMobile ? 5 : 10;
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
      
      // Restaurar el formulario después de la exportación
      this.restoreFormAfterExport();
      
      const pdfBlob = pdf.output('blob');
      this.pdfFile = new File([pdfBlob], 'employee-setup-sheet.pdf', { 
        type: 'application/pdf' 
      });

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
      formData.append('_subject', `Employee Setup Sheet - ID: ${uniqueId}`);
      formData.append('_autoresponse', 'Thank you for completing the form. We will contact you soon.');
      formData.append('_template', 'table');
      formData.append('_replyto', this.formData.email);
      formData.append('_cc', this.formData.email);
      
      if (this.pdfFile) {
        formData.append('pdf', this.pdfFile, `employee-setup-sheet-${uniqueId}.pdf`);
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

      pdf.save(`employee-setup-sheet-${uniqueId}.pdf`);

      alert('Form submitted and PDF generated successfully!');

       // Resetear el formulario y los datos
       form.reset();
       this.formData = {
         email: '',
         firstName: '',
         lastName: '',
         company: '',
         dob: '',
         ssn: '',
         address: '',
         city: '',
         state: '',
         zip: ''
       };
       this.selectedImage = null;
       this.pdfFile = null;

    } catch (error) {
      console.error('Error al enviar formulario:', error);
      
      if (error instanceof Error) {
        alert(`The form could not be submitted: ${error.message}`);
      } else {
        alert('There was an unknown error submitting the form');
      }
    } finally {
      this.isProcessing = false;
      // Asegurarse de restaurar el formulario si hay un error
      this.restoreFormAfterExport();
    }
  }

  // Preparar el formulario para exportación
  private async prepareFormForExport(): Promise<void> {
    // Guardar estado original de los elementos que vamos a modificar
    const formContainer = document.getElementById('form-container');
    
    if (formContainer) {
      // Añadir clase para estilos de impresión
      formContainer.classList.add('print-mode');
      
      // Para dispositivos móviles, hacer ajustes adicionales
      if (this.isMobile) {
        // Aplicar estilos específicos para móviles
        const gridElements = formContainer.querySelectorAll('.grid');
        gridElements.forEach(grid => {
          (grid as HTMLElement).style.display = 'block';
        });
        
        // Asegurar que los inputs sean visibles
        const inputs = formContainer.querySelectorAll('input, select');
        inputs.forEach(input => {
          (input as HTMLElement).style.border = '1px solid #000';
          (input as HTMLElement).style.minHeight = '24px';
        });
        
        // Ocultar botones
        const buttons = formContainer.querySelectorAll('button');
        buttons.forEach(button => {
          button.classList.add('hidden-for-print');
          (button as HTMLElement).style.display = 'none';
        });
      }
    }
    
    // Pequeña pausa para asegurar que los cambios se apliquen
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  // Restaurar el formulario después de la exportación
  private restoreFormAfterExport(): void {
    const formContainer = document.getElementById('form-container');
    
    if (formContainer) {
      // Quitar clase de impresión
      formContainer.classList.remove('print-mode');
      
      // Restaurar elementos modificados
      if (this.isMobile) {
        // Restaurar grids
        const gridElements = formContainer.querySelectorAll('.grid');
        gridElements.forEach(grid => {
          (grid as HTMLElement).style.display = '';
        });
        
        // Restaurar inputs
        const inputs = formContainer.querySelectorAll('input, select');
        inputs.forEach(input => {
          (input as HTMLElement).style.border = '';
          (input as HTMLElement).style.minHeight = '';
        });
        
        // Restaurar botones
        const buttons = formContainer.querySelectorAll('button');
        buttons.forEach(button => {
          button.classList.remove('hidden-for-print');
          (button as HTMLElement).style.display = '';
        });
      }
    }
  }

  saveForm() {
    alert('Guardando formulario...');
  }
}