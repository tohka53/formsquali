import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgForm } from '@angular/forms';

const PAGE_HEIGHT = 1056;

@Component({
  selector: 'app-formcare',
  standalone: false,
  templateUrl: './formcare.component.html',
  styleUrl: './formcare.component.css'
})
export class FormcareComponent implements OnInit, AfterViewInit, OnDestroy {
  isProcessing = false;

  formData = {
    email: ''
  };

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => this.applyScale(), 0);
  }

  ngOnDestroy() {}

  @HostListener('window:resize')
  onResize() {
    this.applyScale();
  }

  /**
   * Scales .form-page to fill the viewport on small screens.
   * Applied via JS so the PDF capture always uses the full desktop size.
   */
  private applyScale(): void {
    const pages = document.querySelectorAll<HTMLElement>('.form-page');
    if (!pages.length) return;

    pages.forEach(page => {
      // Reset first so offsetWidth reflects natural size
      page.style.transform = '';
      const naturalW = page.offsetWidth || 1050;
      const h        = page.offsetHeight || PAGE_HEIGHT;

      const scale = window.innerWidth < naturalW
        ? window.innerWidth / naturalW
        : 1;

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

  /**
   * Captures a page element at full desktop size regardless of current
   * mobile scale transform, then restores the transform afterwards.
   */
  private async captureElement(element: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
    const prevTransform       = element.style.transform;
    const prevTransformOrigin = element.style.transformOrigin;
    const prevMarginBottom    = element.style.marginBottom;

    // Remove mobile scaling for the capture
    element.style.transform       = 'none';
    element.style.transformOrigin = '';
    element.style.marginBottom    = '';

    // Force reflow so html2canvas measures full size
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

    // Restore mobile scale
    element.style.transform       = prevTransform;
    element.style.transformOrigin = prevTransformOrigin;
    element.style.marginBottom    = prevMarginBottom;

    return canvas;
  }

  /**
   * Adds a canvas image to the current PDF page, scaled to fill the page width.
   * If the content is taller than one page, it paginates automatically.
   * Scaling by width only (never by height) keeps text readable.
   */
  private addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, margin = 6): void {
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const cw = pw - margin * 2;
    const ch = ph - margin * 2;

    const imgData  = canvas.toDataURL('image/jpeg', 0.97);
    const imgProps = pdf.getImageProperties(imgData);

    // Scale by width only — never shrink to fit height (makes text tiny)
    const s    = cw / imgProps.width;
    const drawW = imgProps.width  * s;
    const drawH = imgProps.height * s;

    // First page
    pdf.addImage(imgData, 'JPEG', margin, margin, drawW, drawH);

    // Paginate if content overflows one page
    let heightLeft = drawH - ch;
    let page = 1;
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, margin - (ch * page), drawW, drawH);
      heightLeft -= ch;
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

      // Capture at 2× resolution for crisp PDF output
      const canvas = await this.captureElement(page1El, 2);

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'letter',
        compress: true
      });

      this.addCanvasToPdf(pdf, canvas);

      // Build FormData payload
      const uniqueId = this.generateUniqueId();
      const pdfBlob  = pdf.output('blob');
      const pdfFile  = new File([pdfBlob], `daycare-form-${uniqueId}.pdf`, {
        type: 'application/pdf'
      });

      const payload = new FormData();
      payload.append('form_id',       uniqueId);
      payload.append('email',         this.formData.email);
      payload.append('_captcha',      'false');
      payload.append('_next',         'https://formsqualitechboston.vercel.app/');
      payload.append('_subject',      `DayCare Form — ID: ${uniqueId}`);
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

      const response = await fetch(submitUrl, {
        method: 'POST',
        body: payload
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }

      pdf.save(`daycare-form-${uniqueId}.pdf`);

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