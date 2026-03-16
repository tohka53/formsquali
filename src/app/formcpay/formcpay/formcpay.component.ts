import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgForm } from '@angular/forms';

const PAGE_HEIGHT = 1056;

@Component({
  selector: 'app-formcpay',
  standalone: false,
  templateUrl: './formcpay.component.html',
  styleUrl: './formcpay.component.css'
})
export class FormcpayComponent implements OnInit, AfterViewInit, OnDestroy {
  isProcessing = false;

  formData: any = {
    contactName: '', contactEmail: '',
    employeeCount: '', legalName: '', dbaName: '',
    addressLine1: '', addressLine2: '', addressLine3: '',
    startDate: '', endDate: '', firstCheckDate: '',
    deduction1Type: '', deduction1Abbr: '', deduction1Tax: '',
    deduction2Type: '', deduction2Abbr: '', deduction2Tax: '',
    deduction3Type: '', deduction3Abbr: '', deduction3Tax: '',
    deduction4Type: '', deduction4Abbr: '', deduction4Tax: '',
    deduction5Type: '', deduction5Abbr: '', deduction5Tax: '',
    earning1Type: '', earning1Abbr: '', earning1Taxable: '',
    earning2Type: '', earning2Abbr: '', earning2Taxable: '',
    earning3Type: '', earning3Abbr: '', earning3Taxable: '',
    earning4Type: '', earning4Abbr: '', earning4Taxable: '',
    fein: '',
    stateIncomeTaxId1: '', stateIncomeTaxState1: '',
    stateIncomeTaxId2: '', stateIncomeTaxState2: '',
    stateUnemploymentTaxId1: '', suiRate1: '',
    stateUnemploymentTaxId2: '', suiRate2: '',
    bankName: '', routingNumber: '', accountNumber: '',
    primaryTaxFilerName: '', primaryTaxFilerSSN: '',
    otherTaxFilerName: '', otherTaxFilerSSN: ''
  };

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => this.applyScale(), 0);
  }

  ngOnDestroy() {}

  @HostListener('window:resize')
  onResize() { this.applyScale(); }

  private applyScale(): void {
    const pages = document.querySelectorAll<HTMLElement>('.form-page');
    if (!pages.length) return;

    pages.forEach(page => {
      page.style.transform = '';
      const naturalW = page.offsetWidth || 1050;
      const h        = page.offsetHeight || PAGE_HEIGHT;
      const scale    = window.innerWidth < naturalW ? window.innerWidth / naturalW : 1;

      if (scale < 1) {
        page.style.transform       = `scale(${scale})`;
        page.style.transformOrigin = 'top center';
        page.style.marginBottom    = `${(h * scale) - h + 20}px`;
        page.style.marginLeft      = '0';
        page.style.marginRight     = '0';
      } else {
        page.style.transform    = '';
        page.style.marginBottom = '24px';
        page.style.marginLeft   = '';
        page.style.marginRight  = '';
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (this.isProcessing) {
      event.preventDefault();
      event.returnValue = 'The form is being submitted. Are you sure you want to leave?';
      return event.returnValue;
    }
    return true;
  }

  private generateUniqueId(): string {
    return `payroll_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async captureElement(element: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
    const prevTransform       = element.style.transform;
    const prevTransformOrigin = element.style.transformOrigin;
    const prevMarginBottom    = element.style.marginBottom;

    element.style.transform       = 'none';
    element.style.transformOrigin = '';
    element.style.marginBottom    = '';
    void element.offsetWidth;

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width:  element.offsetWidth,
      height: element.offsetHeight
    });

    element.style.transform       = prevTransform;
    element.style.transformOrigin = prevTransformOrigin;
    element.style.marginBottom    = prevMarginBottom;
    return canvas;
  }

  private addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, margin = 8): void {
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const cw = pw - margin * 2;
    const ch = ph - margin * 2;

    const imgData  = canvas.toDataURL('image/jpeg', 0.97);
    const imgProps = pdf.getImageProperties(imgData);
    const s        = Math.min(cw / imgProps.width, ch / imgProps.height);
    const dw       = imgProps.width  * s;
    const dh       = imgProps.height * s;
    const ox       = margin + (cw - dw) / 2;

    pdf.addImage(imgData, 'JPEG', ox, margin, dw, dh);
  }

  async exportToPDF(form: NgForm) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      if (!this.formData.contactEmail) {
        alert('Please enter a valid email address before submitting.');
        this.isProcessing = false;
        return;
      }

      alert('Please wait — generating your PDF and sending the form (up to 2 minutes).');

      const page1El = document.getElementById('page-1');
      if (!page1El) throw new Error('Form page not found in the DOM.');

      const canvas = await this.captureElement(page1El, 2);

      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter', compress: true });
      this.addCanvasToPdf(pdf, canvas);

      const uniqueId = this.generateUniqueId();
      const pdfBlob  = pdf.output('blob');
      const pdfFile  = new File([pdfBlob], `company-payroll-setup-${uniqueId}.pdf`, { type: 'application/pdf' });

      const payload = new FormData();
      payload.append('form_id',       uniqueId);
      payload.append('email',         this.formData.contactEmail);
      payload.append('_captcha',      'false');
      payload.append('_next',         'https://formsqualitechboston.vercel.app/');
      payload.append('_subject',      `Company Payroll Setup — ID: ${uniqueId}`);
      payload.append('_autoresponse', 'Thank you for completing the form. We will contact you soon.');
      payload.append('_template',     'table');
      payload.append('_replyto',      this.formData.contactEmail);
      payload.append('_cc',           this.formData.contactEmail);
      payload.append('pdf',           pdfFile, pdfFile.name);

      const formValues = form.value;
      Object.keys(formValues).forEach(key => {
        const val = formValues[key];
        if (val !== null && val !== undefined && val !== '') {
          payload.append(key, String(val));
        }
      });

      const submitUrl = `https://formsubmit.co/qualitech@qualitechboston.com?_cc=${encodeURIComponent(this.formData.contactEmail)}`;
      const response  = await fetch(submitUrl, { method: 'POST', body: payload });

      if (!response.ok) throw new Error(`Server returned ${response.status}: ${await response.text()}`);

      pdf.save(`company-payroll-setup-${uniqueId}.pdf`);
      alert('✅ Form submitted and PDF downloaded successfully!');

      form.reset();
      Object.keys(this.formData).forEach(k => this.formData[k] = '');

    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof Error) {
        alert(`❌ Could not submit the form: ${error.message}`);
      } else {
        alert('❌ An unknown error occurred while submitting the form.');
      }
    } finally {
      this.isProcessing = false;
    }
  }
}