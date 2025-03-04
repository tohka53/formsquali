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
      
      // Ocultar temporalmente el botón de envío para que no aparezca en el PDF
      const sendButton = document.querySelector('button[type="button"]');
      if (sendButton) {
        (sendButton as HTMLElement).style.display = 'none';
      }
      
      // 1. Crear un elemento contenedor para la versión de impresión fuera de la vista
      const printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.style.position = 'absolute';
      printContainer.style.width = '8.5in'; // Ancho de página carta
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.backgroundColor = 'white';
      printContainer.style.zIndex = '-1000';
      
      // 2. Agregar el logo de Qualitech (opcional)
      const logoHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <div style="width: 300px;">
            <img src="/assets/logo1.png" alt="Qualitech Professional Services" style="max-width: 100%;" />
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: 600;">671 Adams Street</p>
            <p style="margin: 0;">Dorchester MA 02122</p>
            <p style="margin: 0;">Ph (617)288-1333</p>
            <p style="margin: 0;">Fax: 617-249-1859</p>
            <p style="margin: 0;">Email: qualitech@qualitechboston.com</p>
          </div>
        </div>
      `;
      
      // 3. Obtener el HTML del formulario original
      const formContainer = document.getElementById('form-container');
      if (!formContainer) {
        throw new Error('Form container not found');
      }
      
      // 4. Crear una estructura de tabla explícita y consistente para el PDF
      printContainer.innerHTML = `
        <div style="padding: 0.5in; font-family: Arial, sans-serif;">
          ${logoHTML}
          <h1 style="text-align: center; font-size: 24px; margin: 20px 0;">EMPLOYEE SETUP SHEET</h1>
          
          <!-- Información Personal -->
          <div style="display: flex; margin-bottom: 20px;">
            <div style="width: 110px; height: 110px; background-color: #f0f0f0; margin-right: 20px;">
              ${this.selectedImage ? 
                `<img src="${this.selectedImage}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #ccc;">
                  <div style="width: 70%; height: 70%; border-radius: 50%; background-color: white;"></div>
                </div>`
              }
            </div>
            
            <div style="flex: 1;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 33%; padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">First Name</div>
                    <div>${this.formData.firstName || ''}</div>
                  </td>
                  <td style="width: 33%; padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">Last Name</div>
                    <div>${this.formData.lastName || ''}</div>
                  </td>
                  <td style="width: 33%; padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">Company Name</div>
                    <div>${this.formData.company || ''}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">DOB</div>
                    <div>${this.formData.dob || ''}</div>
                  </td>
                  <td style="padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">SSN</div>
                    <div>${this.formData.ssn || ''}</div>
                  </td>
                  <td style="padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">Email Address</div>
                    <div>${this.formData.email || ''}</div>
                  </td>
                  <td style="padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">Hire Date</div>
                    <div>${form.value.hireDate || ''}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">Address</div>
                    <div>${this.formData.address || ''}</div>
                  </td>
                  <td style="padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">City</div>
                    <div>${this.formData.city || ''}</div>
                  </td>
                  <td style="padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">State</div>
                    <div>${this.formData.state || ''}</div>
                  </td>
                  <td style="padding: 5px; border-bottom: 1px solid black;">
                    <div style="font-size: 12px;">Zip</div>
                    <div>${this.formData.zip || ''}</div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
          
          <!-- Información de Empleo -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="width: 20%; background-color: #f0f0f0; border: 1px solid black; padding: 8px; font-weight: bold;">Gender</td>
              <td style="width: 20%; background-color: #f0f0f0; border: 1px solid black; padding: 8px; font-weight: bold;">Pay Information</td>
              <td style="width: 20%; background-color: #f0f0f0; border: 1px solid black; padding: 8px; font-weight: bold;">Employee Type</td>
              <td style="width: 20%; background-color: #f0f0f0; border: 1px solid black; padding: 8px; font-weight: bold;">Employee Status</td>
              <td style="width: 20%; background-color: #f0f0f0; border: 1px solid black; padding: 8px; font-weight: bold;">Pay Type</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                <div style="margin: 4px 0;">☐ Male</div>
                <div style="margin: 4px 0;">☐ Female</div>
              </td>
              <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                <div style="margin: 4px 0;">☐ Hourly</div>
                <div style="margin: 4px 0;">☐ Salary</div>
              </td>
              <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                <div style="margin: 4px 0;">☐ Full Time</div>
                <div style="margin: 4px 0;">☐ 1099</div>
                <div style="margin: 4px 0;">☐ Part Time</div>
                <div style="margin: 4px 0;">☐ Temporary</div>
              </td>
              <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                <div style="margin: 4px 0;">☐ Active</div>
                <div style="margin: 4px 0;">☐ New Hire</div>
                <div style="margin: 4px 0;">☐ Terminated</div>
                <div style="margin: 4px 0;">☐ Inactive</div>
              </td>
              <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                <div style="margin: 4px 0;">☐ Check</div>
                <div style="margin: 4px 0;">☐ Direct Deposit</div>
              </td>
            </tr>
          </table>
          
          <!-- Información de Tarifa -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="width: 33.33%; background-color: #f0f0f0; border: 1px solid black; padding: 8px; font-weight: bold;">Regular Pay Rate</td>
              <td style="width: 33.33%; background-color: #f0f0f0; border: 1px solid black; padding: 8px; font-weight: bold;">Overtime Rate</td>
              <td style="width: 33.33%; background-color: #f0f0f0; border: 1px solid black; padding: 8px; font-weight: bold;">Other Rate</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 8px;">$ __________ / hour or salary</td>
              <td style="border: 1px solid black; padding: 8px;">$ __________</td>
              <td style="border: 1px solid black; padding: 8px;">$ __________ Per Hour / Pay Period</td>
            </tr>
          </table>
          
          <!-- Información de Depósito Directo -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="width: 20%; border: 1px solid black; padding: 8px; font-weight: bold;">Direct Deposit Information</td>
              <td style="width: 15%; border: 1px solid black; padding: 8px; font-weight: bold;">$ or %*</td>
              <td style="width: 25%; border: 1px solid black; padding: 8px; font-weight: bold;">Routing Number (9 digits)</td>
              <td style="width: 20%; border: 1px solid black; padding: 8px; font-weight: bold;">Account Number</td>
              <td style="width: 20%; border: 1px solid black; padding: 8px; font-weight: bold;">Bank Name</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 8px;">☐ Checking ☐ Savings</td>
              <td style="border: 1px solid black; padding: 8px;"></td>
              <td style="border: 1px solid black; padding: 8px;"></td>
              <td style="border: 1px solid black; padding: 8px;"></td>
              <td style="border: 1px solid black; padding: 8px;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 8px;">☐ Checking ☐ Savings</td>
              <td style="border: 1px solid black; padding: 8px;"></td>
              <td style="border: 1px solid black; padding: 8px;"></td>
              <td style="border: 1px solid black; padding: 8px;"></td>
              <td style="border: 1px solid black; padding: 8px;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 8px;">☐ Checking ☐ Savings</td>
              <td style="border: 1px solid black; padding: 8px;"></td>
              <td style="border: 1px solid black; padding: 8px;"></td>
              <td style="border: 1px solid black; padding: 8px;"></td>
              <td style="border: 1px solid black; padding: 8px;"></td>
            </tr>
          </table>
          
          <!-- Advertencia 1099 -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="color: red; font-weight: bold;">*1099 Contractors DO NOT Complete Below This Line*</div>
            <div style="color: gray; font-size: 12px;">*With fixed dollar amount or percentage, the 'remainder' will be deposited into the last account entered.</div>
          </div>
          
          <!-- Deducciones e Impuestos -->
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 33.33%; text-align: center; border: 1px solid black; padding: 8px; font-weight: bold;">Deductions</td>
              <td style="width: 33.33%; text-align: center; border: 1px solid black; padding: 8px; font-weight: bold;">Federal Tax Info</td>
              <td style="width: 33.33%; text-align: center; border: 1px solid black; padding: 8px; font-weight: bold;">State Tax Info</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                <!-- Tabla de deducciones -->
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="border-bottom: 1px solid #ccc; padding: 4px;">Deduction Name</td>
                    <td style="border-bottom: 1px solid #ccc; padding: 4px; white-space: nowrap;">☐ $ ☐ % Amount</td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #ccc; padding: 4px;">Deduction Name</td>
                    <td style="border-bottom: 1px solid #ccc; padding: 4px; white-space: nowrap;">☐ $ ☐ % Amount</td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #ccc; padding: 4px;">Deduction Name</td>
                    <td style="border-bottom: 1px solid #ccc; padding: 4px; white-space: nowrap;">☐ $ ☐ % Amount</td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #ccc; padding: 4px;">Deduction Name</td>
                    <td style="border-bottom: 1px solid #ccc; padding: 4px; white-space: nowrap;">☐ $ ☐ % Amount</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px;">Deduction Name</td>
                    <td style="padding: 4px; white-space: nowrap;">☐ $ ☐ % Amount</td>
                  </tr>
                </table>
              </td>
              <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                <div style="margin-bottom: 8px;">Filing Status:</div>
                <div style="margin: 4px 0;">☐ Single or Married Filing Separately</div>
                <div style="margin: 4px 0;">☐ Married Filing Jointly</div>
                <div style="margin: 4px 0;">☐ Head of Household</div>
                <div style="margin: 8px 0; font-size: 12px;">
                  If your income will be $200,000 or less ($400,000 or less if married filing jointly):
                </div>
                <div style="margin: 4px 0; font-size: 12px;">
                  Multiply the number of children under age 17 by $2,000 _______
                </div>
                <div style="margin: 4px 0; font-size: 12px;">
                  Multiply the number of other dependents by $500 _______
                </div>
                <div style="margin: 4px 0; font-size: 12px;">
                  Add the amounts above and enter the total here _______
                </div>
                <div style="margin: 4px 0; font-size: 12px;">
                  Other income (not from jobs) _______
                </div>
                <div style="margin: 4px 0; font-size: 12px;">
                  Deductions _______
                </div>
                <div style="margin: 4px 0; font-size: 12px;">
                  Extra withholding _______
                </div>
              </td>
              <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                <div style="margin-bottom: 8px;">Filing Status:</div>
                <div style="margin: 4px 0;">☐ Single or Married Filing Separately</div>
                <div style="margin: 4px 0;">☐ Married Filing Jointly</div>
                <div style="margin: 4px 0;">☐ Head of Household</div>
                <div style="margin: 4px 0;">☐ Other</div>
                <div style="margin: 8px 0;">
                  Income Tax Filing State _______
                </div>
                <div style="margin: 8px 0;">
                  Unemployment Filing State _______
                </div>
                <div style="margin: 8px 0;">
                  Allowances _______
                </div>
                <div style="margin: 8px 0;">
                  Additional Withholding Amount $ _______
                </div>
              </td>
            </tr>
          </table>
        </div>
      `;
      
      // 5. Agregar el contenedor al DOM fuera de la vista
      document.body.appendChild(printContainer);
      
      // 6. Esperar a que se apliquen los estilos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 7. Configuración específica para html2canvas
      const canvas = await html2canvas(printContainer, {
        scale: 2, // Mayor resolución
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (doc) => {
          // Podemos ajustar el clon del documento si es necesario
          console.log('Document cloned for PDF');
        }
      });
      
      // 8. Eliminar el contenedor de impresión
      document.body.removeChild(printContainer);
      
      // 9. Crear PDF con dimensiones específicas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
        compress: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Dimensiones de página carta
      const pageWidth = 8.5;
      const pageHeight = 11;
      const margin = 0;
      
      // Calcular dimensiones conservando proporciones
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / pageWidth;
      const scaledHeight = imgHeight / ratio;
      
      // Agregar la imagen al PDF con las dimensiones correctas
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, scaledHeight);
      
      // Mostrar nuevamente el botón de envío
      if (sendButton) {
        (sendButton as HTMLElement).style.display = '';
      }
      
      // Convertir a Blob y crear archivo
      const pdfBlob = pdf.output('blob');
      this.pdfFile = new File([pdfBlob], 'employee-setup-sheet.pdf', { 
        type: 'application/pdf' 
      });

      // Continuar con el proceso de envío
      const formData = new FormData();
      const uniqueId = this.generateUniqueId();
      
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
      
      // Restaurar el botón en caso de error
      const sendButton = document.querySelector('button[type="button"]');
      if (sendButton) {
        (sendButton as HTMLElement).style.display = '';
      }
    } finally {
      this.isProcessing = false;
      
      // Asegurarse de que cualquier elemento temporal agregado sea eliminado
      const tempElement = document.getElementById('print-container');
      if (tempElement) {
        document.body.removeChild(tempElement);
      }
    }
  }

  saveForm() {
    alert('Guardando formulario...');
  }
}