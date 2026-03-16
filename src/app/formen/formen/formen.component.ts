import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgForm } from '@angular/forms';

const PAGE_WIDTH  = 1050; // matches max-width in CSS
const PAGE_HEIGHT = 1056;

@Component({
  selector: 'app-formen',
  standalone: false,
  templateUrl: './formen.component.html',
  styleUrl: './formen.component.css'
})
export class FormenComponent implements OnInit, AfterViewInit, OnDestroy {
  isProcessing = false;

  formData = {
    email: ''
  };

  ngOnInit() {}

  // Wait for DOM to be fully painted before measuring and scaling
  ngAfterViewInit() {
    setTimeout(() => this.applyScale(), 0);
  }

  ngOnDestroy() {}

  @HostListener('window:resize')
  onResize() {
    this.applyScale();
  }

  /**
   * Scales every .form-page to fill the viewport width when on small screens.
   * Uses transform-origin: top center so the page is always centered.
   * Adjusts marginBottom to collapse the layout gap caused by scaling.
   */
  private applyScale(): void {
    const pages = document.querySelectorAll<HTMLElement>('.form-page');
    if (!pages.length) return;

    pages.forEach(page => {
      // Reset transform first so offsetWidth gives the natural width
      page.style.transform = '';
      const naturalW = page.offsetWidth || PAGE_WIDTH;
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

  // Prevent tab close while processing
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
   * Captures a DOM element as a canvas at given scale.
   * Temporarily resets any CSS transform so html2canvas captures the
   * full-size desktop layout (816px), not the scaled mobile view.
   */
  private async captureElement(element: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
    // Save current transform state
    const prevTransform       = element.style.transform;
    const prevTransformOrigin = element.style.transformOrigin;
    const prevMarginBottom    = element.style.marginBottom;

    // Reset to full desktop size for capture
    element.style.transform       = 'none';
    element.style.transformOrigin = '';
    element.style.marginBottom    = '';

    // Force a synchronous reflow so the element measures correctly
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
   * Adds a canvas image to the PDF page, scaled to fit letter size with margins.
   */
  private addCanvasToPdf(
    pdf: jsPDF,
    canvas: HTMLCanvasElement,
    margin = 8
  ): void {
    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentW   = pageWidth  - margin * 2;
    const contentH   = pageHeight - margin * 2;

    const imgData   = canvas.toDataURL('image/jpeg', 0.97);
    const imgProps  = pdf.getImageProperties(imgData);
    // Scale image to fit within the content area (preserving aspect ratio)
    const scale     = Math.min(contentW / imgProps.width, contentH / imgProps.height);
    const drawW     = imgProps.width  * scale;
    const drawH     = imgProps.height * scale;
    // Center horizontally
    const offsetX   = margin + (contentW - drawW) / 2;

    pdf.addImage(imgData, 'JPEG', offsetX, margin, drawW, drawH);
  }

  async exportToPDF(form: NgForm) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Validate email
      if (form.invalid || !this.formData.email) {
        alert('Please enter a valid email address before submitting.');
        this.isProcessing = false;
        return;
      }

      alert('Please wait — generating your PDF and sending the form (up to 2 minutes).');

      const page1El = document.getElementById('page-1');
      const page2El = document.getElementById('page-2');

      if (!page1El || !page2El) {
        throw new Error('Form pages not found in the DOM.');
      }

      // ── Capture both pages ──────────────────────────────────────────────
      const [canvas1, canvas2] = await Promise.all([
        this.captureElement(page1El, 2),
        this.captureElement(page2El, 2)
      ]);

      // ── Build PDF (US Letter, portrait) ────────────────────────────────
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'letter',   // 215.9 × 279.4 mm
        compress: true
      });

      this.addCanvasToPdf(pdf, canvas1);

      pdf.addPage();
      this.addCanvasToPdf(pdf, canvas2);

      // ── Prepare form data for submission ────────────────────────────────
      const uniqueId  = this.generateUniqueId();
      const pdfBlob   = pdf.output('blob');
      const pdfFile   = new File([pdfBlob], `income-tax-form-${uniqueId}.pdf`, {
        type: 'application/pdf'
      });

      const payload = new FormData();
      payload.append('form_id',       uniqueId);
      payload.append('email',         this.formData.email);
      payload.append('_captcha',      'false');
      payload.append('_next',         'https://formsqualitechboston.vercel.app/');
      payload.append('_subject',      `Income Tax Form — ID: ${uniqueId}`);
      payload.append('_autoresponse', 'Thank you for completing the form. We will contact you soon.');
      payload.append('_template',     'table');
      payload.append('_replyto',      this.formData.email);
      payload.append('_cc',           this.formData.email);
      payload.append('pdf',           pdfFile, pdfFile.name);

      // Include any named ngModel values
      const formValues = form.value;
      Object.keys(formValues).forEach(key => {
        const val = formValues[key];
        if (val !== null && val !== undefined && val !== '') {
          payload.append(key, String(val));
        }
      });

      // ── Send to FormSubmit ───────────────────────────────────────────────
      const submitUrl = `https://formsubmit.co/qualitech@qualitechboston.com?_cc=${encodeURIComponent(this.formData.email)}`;

      const response = await fetch(submitUrl, {
        method: 'POST',
        body: payload
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }

      // ── Save PDF locally ────────────────────────────────────────────────
      pdf.save(`income-tax-form-${uniqueId}.pdf`);

      alert('✅ Form submitted and PDF downloaded successfully!');

      // Reset
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