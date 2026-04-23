import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgForm } from '@angular/forms';

const PAGE_HEIGHT = 1056;

@Component({
  selector: 'app-formsc',
  standalone: false,
  templateUrl: './formsc.component.html',
  styleUrl: './formsc.component.css'
})
export class FormscComponent implements OnInit, AfterViewInit, OnDestroy {
  isProcessing = false;
  formData = { email: '' };

  expenses = {
    advertising: null as number | null, carAndTruck: null as number | null,
    commissions: null as number | null, contractLabor: null as number | null,
    depreciation: null as number | null, insurance: null as number | null,
    mortgageInterest: null as number | null, otherInterest: null as number | null,
    legalProfessional: null as number | null, officeExpense: null as number | null,
    rentLease: null as number | null, rentVehicles: null as number | null,
    rentOtherProperty: null as number | null, repairMaintenance: null as number | null,
    supplies: null as number | null, taxes: null as number | null,
    licenses: null as number | null, travel: null as number | null,
    mealsEnt: null as number | null, utilities: null as number | null,
    wages: null as number | null, otherExpenses: null as number | null,
    cellPhone: null as number | null, telephone: null as number | null,
  };
  totalExpenses: number = 0;
  calcTotal(): void {
    this.totalExpenses = Object.values(this.expenses).reduce((sum: number, v) => sum + (Number(v) || 0), 0);
  }
  ngOnInit() {}
  ngAfterViewInit() { setTimeout(() => this.applyScale(), 0); }
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
    return `form_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async captureElement(element: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
    const prevTransform       = element.style.transform;
    const prevTransformOrigin = element.style.transformOrigin;
    const prevMarginBottom    = element.style.marginBottom;

    element.style.transform       = 'none';
    element.style.transformOrigin = '';
    element.style.marginBottom    = '';
    // Force desktop width — on mobile min(95vw,1050px) gives phone width
    const prevWidth    = element.style.width;
    const prevMinWidth = element.style.minWidth;
    element.style.width    = '1050px';
    element.style.minWidth = '1050px';
    void element.offsetWidth;

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width:  1050,
      height: element.scrollHeight,
      onclone: (_doc: Document, cloned: HTMLElement) => {
        cloned.querySelectorAll<HTMLInputElement>(
          'input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="url"], input[type="password"]'
        ).forEach(input => {
          const div = _doc.createElement('div');
          div.textContent = input.value || '';
          const cs = window.getComputedStyle(input);
          div.style.cssText = `
            display: block;
            width: 100%;
            min-height: ${cs.height};
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            font-weight: bold;
            color: #000;
            background: transparent;
            border: none;
            border-bottom: 1px solid #000;
            padding: ${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft};
            box-sizing: border-box;
            word-break: break-word;
            white-space: pre-wrap;
            overflow: visible;
          `;
          input.parentNode?.replaceChild(div, input);
        });
        cloned.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(chk => {
          chk.style.minWidth  = '14px';
          chk.style.minHeight = '14px';
          chk.style.border    = '1px solid #000';
        });
      }
    });

    element.style.transform       = prevTransform;
    element.style.transformOrigin = prevTransformOrigin;
    element.style.marginBottom    = prevMarginBottom;
    element.style.width           = prevWidth;
    element.style.minWidth        = prevMinWidth;
    return canvas;
  }

  private addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, margin = 2): void {
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const cw = pw - margin * 2;

    const imgData  = canvas.toDataURL('image/jpeg', 0.97);
    const imgProps = pdf.getImageProperties(imgData);
    const s     = cw / imgProps.width;
    const drawW = imgProps.width  * s;
    const drawH = imgProps.height * s;

    pdf.addImage(imgData, 'JPEG', margin, margin, drawW, drawH);

    let heightLeft = drawH - (ph - margin);
    let page = 1;
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, -(page * (ph - margin)), drawW, drawH);
      heightLeft -= ph;
      page++;
    }
  }

  async exportToPDF(form: NgForm) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      if (form.invalid || !this.formData.email) {
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
      const pdfFile  = new File([pdfBlob], `schedule-c-${uniqueId}.pdf`, { type: 'application/pdf' });

      const payload = new FormData();
      payload.append('form_id',       uniqueId);
      payload.append('email',         this.formData.email);
      payload.append('_captcha',      'false');
      payload.append('_next',         'https://formsqualitechboston.vercel.app/');
      payload.append('_subject',      `Schedule C — ID: ${uniqueId}`);
      payload.append('_autoresponse', 'Thank you for completing the form. We will contact you soon.');
      payload.append('_template',     'table');
      payload.append('_replyto',      this.formData.email);
      payload.append('_cc',           this.formData.email);
      payload.append('pdf',           pdfFile, pdfFile.name);

      const formValues = form.value;
      Object.keys(formValues).forEach(key => {
        const val = formValues[key];
        if (val !== null && val !== undefined && val !== '') {
          payload.append(key, String(val));
        }
      });

      const submitUrl = `https://formsubmit.co/qualitech@qualitechboston.com?_cc=${encodeURIComponent(this.formData.email)}`;
      const response  = await fetch(submitUrl, { method: 'POST', body: payload });
      if (!response.ok) throw new Error(`Server returned ${response.status}: ${await response.text()}`);

      pdf.save(`schedule-c-${uniqueId}.pdf`);
      alert('✅ Form submitted and PDF downloaded successfully!');

      form.reset();
      this.formData.email = '';

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