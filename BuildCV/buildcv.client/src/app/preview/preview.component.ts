// BuildCV/buildcv.client/src/app/preview/preview.component.ts
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CvService } from '../cv.service';
import { CVData } from '../cv-data.model';
import { CustomizationSettings } from './templates/lima-template/lima-template.component';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const DEFAULT_CUSTOMIZATION: CustomizationSettings = {
  fontSize: 16,
  lineHeight: 1.5,
  marginTop: 30,
  marginBottom: 30,
  marginLeft: 30,
  marginRight: 30,
  paddingTop: 32,
  paddingBottom: 32,
  paddingLeft: 32,
  paddingRight: 32,
  primaryColor: '#4F46E5',
  secondaryColor: '#000000',
  textColor: '#2D3748',
  backgroundColor: '#FFFFFF',
  borderColor: '#dcdfe4',
  headingColor: '#2a303c',
  sectionBgColor: '#f9fafb',
  atsThemeColor: '#eef6ff',
  headingFontSize: 25,
  sectionSpacing: 27,
  fontFamily: 'Roboto'
};

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit, OnDestroy {
  @ViewChild('templateContainer', { static: false }) templateContainer!: ElementRef;
  
  cvData!: CVData;
  selectedTheme = 'lima';
  showCustomizationPanel = true;
  
  // PDF generation state
  pdfBlobUrl: SafeResourceUrl | null = null;
  private pdfBlobUrlRaw: string | null = null;
  isGeneratingPdf = false;
  isPdfLoading = false;
  pdfGenerationError: string | null = null;

  customization: CustomizationSettings = { ...DEFAULT_CUSTOMIZATION };

  // Debounce subject for PDF regeneration
  private regeneratePdfSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  private viewReady = false;

  constructor(private cvService: CvService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.cvData = this.cvService.getCVData();
    this.selectedTheme = (this.cvData as any).selectedTheme || 'lima';
    this.isPdfLoading = true;

    const saved = localStorage.getItem('cvCustomization');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(this.customization, DEFAULT_CUSTOMIZATION, parsed);
    } else {
      Object.assign(this.customization, DEFAULT_CUSTOMIZATION);
    }

    // Setup debounced PDF regeneration
    this.regeneratePdfSubject
      .pipe(
        debounceTime(500)
      )
      .subscribe(() => {
        this.generatePdfPreview();
      });

    // React to CV data changes so preview stays in sync
    this.cvService.cvData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.cvData = data;
        const themeFromData = (data as any).selectedTheme || 'lima';
        if (themeFromData !== this.selectedTheme) {
          this.selectedTheme = themeFromData;
        }
        this.regeneratePdfSubject.next();
      });

    // Initial PDF generation happens in ngAfterViewInit, after template is rendered.
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    // Let Angular render the hidden template once before we serialize it.
    setTimeout(() => this.generatePdfPreview(), 0);
  }

  ngOnDestroy(): void {
    if (this.pdfBlobUrlRaw) {
      URL.revokeObjectURL(this.pdfBlobUrlRaw);
      this.pdfBlobUrlRaw = null;
    }
    this.destroy$.next();
    this.destroy$.complete();
    this.regeneratePdfSubject.complete();
  }

  toggleCustomizationPanel(): void {
    this.showCustomizationPanel = !this.showCustomizationPanel;
  }

  onCustomizationChange(): void {
    localStorage.setItem('cvCustomization', JSON.stringify(this.customization));
    // Trigger debounced PDF regeneration
    this.regeneratePdfSubject.next();
  }

  resetCustomization(): void {
    Object.assign(this.customization, DEFAULT_CUSTOMIZATION);
    localStorage.setItem('cvCustomization', JSON.stringify(this.customization));
    this.generatePdfPreview();
  }

  private async waitForTemplateRender(timeoutMs: number = 2000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const host = this.templateContainer?.nativeElement as HTMLElement | undefined;
      if (host) {
        const html = (host.innerHTML || '').trim();
        if (html.length > 50) return true;
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    return false;
  }

  async generatePdfPreview(): Promise<void> {
    try {
      this.isPdfLoading = true;
      this.pdfGenerationError = null;

      // Avoid generating a PDF before the Angular template exists.
      if (!this.viewReady) {
        this.isPdfLoading = true;
        return;
      }

      await this.waitForTemplateRender();

      const topMargin = this.pxToMmString(this.customization.marginTop);
      const sideMargin = this.pxToMmString(this.customization.marginLeft);

      // Get HTML content from template (do NOT include inner page padding for PDF generation
      // because Puppeteer already applies the page margins; including both caused double spacing)
      const htmlContent = this.getTemplateHtml(false);

      // Send to backend for PDF generation
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent: htmlContent,
          options: {
            format: 'A4',
            printBackground: true,
            scale: 1.0,
            margin: {
              top: topMargin,
              right: sideMargin,
              bottom: topMargin,
              left: sideMargin
            }
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'PDF generation failed');
      }

      const blob = await response.blob();

      // Revoke old blob URL
      if (this.pdfBlobUrlRaw) {
        URL.revokeObjectURL(this.pdfBlobUrlRaw);
      }

      // Create new blob URL and update iframe
      const url = URL.createObjectURL(blob);
      this.pdfBlobUrlRaw = url;
      this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    } catch (error: any) {
      console.error('PDF generation error:', error);
      this.pdfGenerationError = error.message || 'Failed to generate PDF preview';
      this.isPdfLoading = false;
    }
  }

  async downloadPDF(): Promise<void> {
    try {
      this.isGeneratingPdf = true;
      this.pdfGenerationError = null;

      // Export exactly what the preview iframe shows.
      if (!this.pdfBlobUrlRaw) {
        await this.generatePdfPreview();
      }

      if (!this.pdfBlobUrlRaw) {
        throw new Error('PDF preview is not available yet');
      }

      const response = await fetch(this.pdfBlobUrlRaw);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV-${(this.cvData.personalInfo.fullName || 'Export').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('PDF export error:', error);
      this.pdfGenerationError = error.message || 'Failed to export PDF';
    } finally {
      this.isGeneratingPdf = false;
    }
  }

  onPdfLoad(): void {
    this.isPdfLoading = false;
  }

  private getTemplateHtml(includeInnerPadding: boolean = true): string {
    // Create a temporary container
    const tempContainer = document.createElement('div');
    
    // Generate complete HTML with styles
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV Preview</title>
  ${this.getGoogleFontsLink()}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: '${this.customization.fontFamily}', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    ${this.getTemplateStyles(includeInnerPadding)}
  </style>
</head>
<body>
  ${this.getTemplateBodyHtml()}
</body>
</html>`;

    return html;
  }

  private getGoogleFontsLink(): string {
    const fontMap: { [key: string]: string } = {
      'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap',
      'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
      'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap',
      'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&display=swap',
      'Raleway': 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;700&display=swap',
      'Lora': 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
      'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
      'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap'
    };

    const fontUrl = fontMap[this.customization.fontFamily] || fontMap['Roboto'];
    return `<link href="${fontUrl}" rel="stylesheet">`;
  }

  private getTemplateStyles(includeInnerPadding: boolean = true): string {
    // Ensure a minimum sensible section spacing
    const sectionSpacingVal = Math.max(8, (this.customization.sectionSpacing ?? 16));
    // compute page margins in mm so we can set @page margins that apply to all printed pages
    const topMarginMm = this.pxToMmString(this.customization.marginTop);
    const sideMarginMm = this.pxToMmString(this.customization.marginLeft);
    const base = `
      :root {
        --primary-color: ${this.customization.primaryColor};
        --secondary-color: ${this.customization.secondaryColor};
        --text-color: ${this.customization.textColor};
        --background-color: ${this.customization.backgroundColor};
        --border-color: ${this.customization.borderColor || '#dcdfe4'};
        --heading-color: ${this.customization.headingColor || this.customization.primaryColor};
        --section-bg: ${this.customization.sectionBgColor || '#f9fafb'};
        --section-spacing: ${sectionSpacingVal}px;
        --page-padding-top: ${includeInnerPadding ? (this.customization.marginTop ?? 0) : 0}px;
        --page-padding-bottom: ${includeInnerPadding ? (this.customization.marginTop ?? 0) : 0}px;
        --page-padding-left: ${includeInnerPadding ? (this.customization.marginLeft ?? 0) : 0}px;
        --page-padding-right: ${includeInnerPadding ? (this.customization.marginLeft ?? 0) : 0}px;
        /* page margin used by @page so margins apply on every PDF page */
        --page-margin: ${topMarginMm} ${sideMarginMm} ${topMarginMm} ${sideMarginMm};
      }
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background: var(--background-color);
      }
      .cv-root {
        width: 100%;
        display: flex;
        justify-content: center;
        background: var(--background-color);
      }
      /* Apply page padding so "page margins" controls have visible effect */
      .cv-page {
        box-sizing: border-box;
        padding: var(--page-padding-top) var(--page-padding-right) var(--page-padding-bottom) var(--page-padding-left);
      }
      /* Default section spacing hook */
      .section-spacing {
        margin-top: var(--section-spacing);
      }
    `;
     switch (this.selectedTheme) {
       case 'lima':
         return base + this.getLimaStyles();
       case 'rotterdam':
         return base + this.getRotterdamStyles();
       case 'riga':
         return base + this.getRigaStyles();
       case 'ats':
         return base + this.getATSStyles();
       default:
         return base;
     }
   }

  private getTemplateBodyHtml(): string {
    // This needs to render the actual template HTML with data
    // For now, returning a placeholder - you'll need to actually render the component
    const tempDiv = document.createElement('div');
    
    // Inject the template HTML based on theme
    // This is where you'd use the template component's generateTemplate() method
    // or extract the rendered HTML from the actual template component
    
    return this.renderTemplateToString();
  }

  private renderTemplateToString(): string {
    // This is a critical method that needs to serialize your Angular template component
    // to HTML string. Implementation depends on your template structure.
    
    // Option 1: Use the template container if it exists
    if (this.templateContainer?.nativeElement) {
      return this.templateContainer.nativeElement.innerHTML;
    }

    // Option 2: Manually construct based on theme
    // You'll need to implement theme-specific HTML generation
    return this.generateThemeHtml();
  }

  private generateThemeHtml(): string {
    // Simplified example for Lima template
    // You'll need to implement full template generation for each theme
    const pi = this.cvData.personalInfo;
    
    return `
      <div class="cv-lima-container">
        <div class="cv-page">
          <div class="lima-wrap">
            <aside class="lima-sidebar">
              <div class="lima-profile">
                ${pi.photoUrl ? `<div class="lima-avatar"><img src="${pi.photoUrl}" alt="avatar"></div>` : ''}
                <div class="lima-name">${pi.fullName?.toUpperCase() || 'YOUR NAME'}</div>
                <div class="lima-title">${pi.title || pi.profession || ''}</div>
              </div>
              <!-- Add more sections here -->
            </aside>
            <main class="lima-main">
              <h1>${pi.fullName || 'Your Name'}</h1>
              <!-- Add more content here -->
            </main>
          </div>
        </div>
      </div>
    `;
  }

  private getLimaStyles(): string {
    return `
      @page { size: A4; margin: var(--page-margin); }
      .cv-lima-container { min-height: 100vh; display: flex; justify-content: center; font-family: 'Roboto', sans-serif; }
      .cv-page { width: 210mm; min-height: 297mm; background: linear-gradient(to right, #1a2a3a 33%, #fff 33%); box-shadow: 0 5px 15px rgba(0,0,0,0.5); position: relative; overflow: visible; --a4-height: 297mm; --page-marker-color: #000; --page-marker-thickness: 5px; }
      @media screen { .cv-page::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; background-image: repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--a4-height) - var(--page-marker-thickness)), var(--page-marker-color) calc(var(--a4-height) - var(--page-marker-thickness)), var(--page-marker-color) var(--a4-height)); background-size: 100% var(--a4-height); background-repeat: repeat-y; } }
      .lima-wrap { display: flex; width: 100%; height: 100%; align-items: stretch; }
      .lima-sidebar { flex: 0 0 33%; max-width: 33%; flex-shrink: 0; background: ${this.customization.primaryColor}; color: #fff; padding: 40px 28px; box-sizing: border-box; display: flex; flex-direction: column; gap: 18px; }
      .sidebar-section, .lima-profile { break-inside: avoid; page-break-inside: avoid; }
      .lima-profile { display: flex; flex-direction: column; align-items: center; gap: 10px; }
      .lima-avatar { width: 130px; height: 130px; border-radius: 50%; overflow: hidden; background: #e5e7eb; border: 4px solid #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
      .lima-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .avatar-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg,#2c3e50,#3b5566); }
      .lima-name { margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-size: 20px; text-align: center; word-break: break-word; }
      .lima-title { margin-top: 2px; font-size: 13px; text-align: center; word-break: break-word; }
      .sidebar-section h4 { margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; }
      .sidebar-text { line-height: 1.6; word-break: break-word; }
      .contact-row { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
      .contact-item { display: flex; gap: 10px; align-items: center; color: #d1d5db; word-break: break-word; }
      .contact-item a { color: inherit; text-decoration: none; word-break: break-all; }
      .contact-icon { width: 18px; height: 18px; flex-shrink: 0; }
      .skill-item, .language-item, .main-skill-item { margin-bottom: 10px; break-inside: avoid; }
      .skill-name, .main-skill-name, .language-name { font-weight: 700; word-break: break-word; margin-bottom: 6px; }
      .skill-bar, .language-bar, .main-skill-bar { height: 8px; background: rgba(255,255,255,0.12); border-radius: 999px; overflow: hidden; }
      .skill-fill, .language-fill, .main-skill-fill { height: 8px; background: ${this.customization.secondaryColor}; }
      .lima-main { flex: 1 1 67%; padding: 48px 44px; box-sizing: border-box; display: flex; flex-direction: column; background: #fff; color: ${this.customization.textColor}; }
      .lm-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
      .lm-title h1 { margin: 0; letter-spacing: 1px; text-transform: uppercase; font-weight: 800; word-break: break-word; color: ${this.customization.headingColor || this.customization.primaryColor}; }
      .lm-title h2 { margin: 8px 0 0 0; font-weight: 700; word-break: break-word; }
      .lm-contact { text-align: right; opacity: 0.8; word-break: break-word; }
      .lm-body { margin-top: var(--section-spacing); display: flex; flex-direction: column; gap: var(--section-spacing); }
      .section-title { text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid currentColor; color: ${this.customization.primaryColor}; }
      .experience-item, .education-grid > div, section { break-inside: avoid; page-break-inside: avoid; }
      .experience-item { display: grid; grid-template-columns: 24% 1fr; gap: 18px; align-items: start; padding: 14px 0; border-top: 1px solid #f1f5f9; }
      .exp-left { opacity: 0.75; word-break: break-word; }
      .exp-company { font-weight: 700; word-break: break-word; }
      .exp-date { margin-top: 6px; opacity: 0.8; }
      .exp-right h3 { margin: 0; font-weight: 700; word-break: break-word; }
      .exp-right ul { margin: 8px 0 0 0; padding-left: 18px; }
      .exp-right ul li { margin-bottom: 4px; word-break: break-word; }
      .education-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
      .edu-institution { font-weight: 700; word-break: break-word; }
      .edu-meta { opacity: 0.8; word-break: break-word; }
      .hobby-list { display: flex; gap: 8px; flex-wrap: wrap; }
      .hobby { background: #f3f4f6; padding: 6px 10px; border-radius: 999px; font-size: .85rem; color: #374151; word-break: break-word; }
      @media print { .cv-lima-container { background: white; padding: 0; display: block; } .cv-page { box-shadow: none; margin: 0; width: 100%; height: auto; min-height: auto; background-image: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      p, .sidebar-text, .exp-right li, .contact-item { orphans: 3; widows: 3; }
      .sidebar-text { display: block; break-inside: avoid; page-break-inside: avoid; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
      .sidebar-section, .experience-item, .education-grid > div { break-inside: avoid; page-break-inside: avoid; margin-bottom: 2px; }
    `;
  }

  private getRotterdamStyles(): string {
    return `
      @page { size: A4; margin: var(--page-margin); }
      .cv-page { width: 210mm; min-height: 297mm; box-sizing: border-box; background: white; position: relative; overflow: visible; --a4-height: 297mm; --page-marker-color: #000; --page-marker-thickness: 5px; }
      @media screen { .cv-page::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; background-image: repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--a4-height) - var(--page-marker-thickness)), var(--page-marker-color) calc(var(--a4-height) - var(--page-marker-thickness)), var(--page-marker-color) var(--a4-height)); background-size: 100% var(--a4-height); background-repeat: repeat-y; } }
      @media print { .cv-page { page-break-after: always; } .cv-page:last-child { page-break-after: auto; } }
      .rotterdam-layout { display: flex; min-height: 297mm; }
      .sidebar { width: 30%; background-color: #d9ccc4; padding: 40px 25px; box-sizing: border-box; overflow: visible; word-break: break-word; overflow-wrap: break-word; color: ${this.customization.textColor}; }
      .contact-info { margin-bottom: 30px; }
      .contact-item { display: flex; align-items: flex-start; margin-bottom: 10px; font-size: 0.8rem; }
      .contact-item a { color: #333; text-decoration: none; }
      .icon-circle { width: 22px; height: 22px; background: ${this.customization.primaryColor}; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 10px; font-size: 9px; flex-shrink: 0; }
      .sidebar-title { text-transform: uppercase; font-size: 0.9rem; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 12px; margin-top: 20px; font-weight: 700; color: ${this.customization.primaryColor}; }
      .sidebar-item { font-size: 0.85rem; margin-bottom: 10px; }
      .sidebar-label { font-weight: 700; color: #333; margin-bottom: 2px; }
      .sidebar-value { color: #666; }
      .language-item { margin-bottom: 8px; }
      .skills-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
      .skill-tag { background: #f0f0f0; padding: 4px 10px; border-radius: 15px; font-size: 0.8rem; }
      .main-content { width: 70%; display: flex; flex-direction: column; word-break: break-word; overflow-wrap: break-word; }
      .rt-header { background-color: #3a3a3a; color: white; padding: 40px 35px; display: flex; align-items: center; gap: 30px; }
      .rt-profile-pic { width: 100px; height: 100px; border-radius: 50%; background: #ddd; flex-shrink: 0; overflow: hidden; }
      .rt-profile-pic img { width: 100%; height: 100%; object-fit: cover; }
      .rt-header-info { flex: 1; }
      .rt-header h1 { font-family: 'Playfair Display', serif; margin: 0; line-height: 1.1; color: ${this.customization.primaryColor}; }
      .rt-header p { text-transform: uppercase; letter-spacing: 3px; font-size: 0.75rem; margin-top: 8px; opacity: 0.9; }
      .content-body { padding: 35px; flex: 1; overflow: visible; }
      .section-title { text-transform: uppercase; font-size: 1rem; font-weight: 700; border-bottom: 2px solid #999; padding-bottom: 8px; margin: var(--section-spacing) 0 8px 0; letter-spacing: 1px; color: ${this.customization.primaryColor}; }
      .summary-text { color: #555; line-height: 1.6; margin: 0 0 15px 0; }
      .experience-block, .education-block, .project-block, .cert-block { margin-bottom: 18px; }
      .experience-block, .education-block, .project-block, .cert-block, .sidebar-item, .contact-item { break-inside: avoid; page-break-inside: avoid; }
      .job-title { font-weight: 700; margin-top: 12px; font-size: 1rem; }
      .job-company { font-weight: 700; font-size: 0.95rem; }
      .job-period { font-size: 0.85rem; color: #666; }
      .job-meta { color: #666; font-size: 0.85rem; margin-top: 3px; }
      ul { padding-left: 16px; margin-top: 6px; margin-bottom: 0; }
      li { margin-bottom: 3px; font-size: 0.9rem; }
      .project-description { color: #555; margin: 6px 0; font-size: 0.95rem; }
      .technologies { color: #666; font-size: 0.85rem; }
      .project-link { margin-top: 6px; }
      .project-link a { color: #333; text-decoration: none; font-size: 0.85rem; }
      .project-link a:hover { text-decoration: underline; }
    `;
  }

  private getRigaStyles(): string {
    return `
      @page { size: A4; margin: var(--page-margin); }
      .cv-page { width: 210mm; min-height: 297mm; box-sizing: border-box; background: white; position: relative; overflow: visible; --a4-height: 297mm; --page-marker-color: #000; --page-marker-thickness: 5px; }
      @media screen { .cv-page::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; background-image: repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--a4-height) - var(--page-marker-thickness)), var(--page-marker-color) calc(var(--a4-height) - var(--page-marker-thickness)), var(--page-marker-color) var(--a4-height)); background-size: 100% var(--a4-height); background-repeat: repeat-y; } }
      @media print { .cv-page { page-break-after: always; } .cv-page:last-child { page-break-after: auto; } }
      .riga-page { width: 100%; min-height: 1100px; display: flex; flex-direction: column; }
      .riga-top { background: #1f2937; color: #fff; padding: 34px 24px 28px 24px; text-align: center; }
      .riga-top .small { color: #d6c39a; letter-spacing: 6px; font-size: 12px; margin-bottom: 6px; display: block; }
      .riga-top h1 { margin: 6px 0; letter-spacing: 6px; text-transform: uppercase; color: ${this.customization.primaryColor}; }
      .riga-top h2 { margin: 0; color: ${this.customization.secondaryColor}; font-weight: 700; letter-spacing: 2px; }
      .contact-row { display: flex; gap: 18px; justify-content: center; color: #c9cdd2; margin-top: 8px; flex-wrap: wrap; word-break: break-word; }
      .riga-body { display: flex; }
      .riga-left { width: 34%; background: #f4f4f6; padding: 24px 28px 40px 28px; box-sizing: border-box; position: relative; word-break: break-word; overflow-wrap: break-word; }
      .riga-right { width: 66%; padding: 28px 44px 40px 44px; box-sizing: border-box; word-break: break-word; overflow-wrap: break-word; }
      .riga-avatar { width: 140px; height: 140px; border-radius: 50%; overflow: hidden; margin: -70px auto 14px auto; border: 6px solid #fff; box-shadow: 0 6px 18px rgba(17, 24, 39, 0.12); background: #e6e7ea; }
      .riga-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .left-section { padding-top: 8px; }
      .profile-name { text-align: center; font-weight: 700; color: #111827; }
      .profile-title { text-align: center; color: #8b8f95; margin-bottom: 8px; }
      .left-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 22px; color: ${this.customization.primaryColor}; }
      .left-heading h4 { margin: 0; text-transform: uppercase; letter-spacing: 1px; font-size: 0.95rem; }
      .left-hr { height: 1px; background: #d1d5db; margin-top: 12px; }
      .edu-item { margin: 12px 0; }
      .edu-item .degree { font-weight: 700; }
      .edu-item .meta { color: #8b8f95; font-size: 0.9rem; margin-top: 6px; }
      .lang-item { margin: 10px 0; }
      .lang-label { font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; }
      .lang-bar { height: 8px; background: #e6e6e6; border-radius: 999px; overflow: hidden; }
      .lang-fill { height: 8px; background: ${this.customization.secondaryColor}; width: 60%; }
      .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 8px; }
      .skill-tag { background: #e5e7eb; padding: 6px 10px; border-radius: 6px; font-size: 0.85rem; text-align: center; }
      .section-title { text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin: var(--section-spacing) 0 12px 0; border-bottom: 1px solid #e6e6e6; padding-bottom: 8px; color: ${this.customization.primaryColor}; }
      .job { margin-bottom: 18px; }
      .job h3 { margin: 0; color: #111827; }
      .job .company { color: ${this.customization.secondaryColor}; font-weight: 700; margin-top: 6px; }
      .job p { margin: 8px 0 0 0; color: #4b5563; }
      .skill-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
      .skill-name { width: 40%; font-weight: 600; }
      .skill-meter { flex: 1; height: 8px; background: #e6e6e6; border-radius: 999px; overflow: hidden; }
      .skill-meter .fill { height: 8px; background: ${this.customization.secondaryColor}; width: 70%; }
      .project-item { margin-bottom: 10px; }
      .project-name { font-weight: 700; }
      .project-desc { color: #6b7280; }
      @media (max-width: 720px) { .riga-body { flex-direction: column; } .riga-left, .riga-right { width: 100%; } .riga-top h1 { font-size: 26px; } .riga-avatar { margin-top: -56px; } }
      @media print { .job, .edu-item, .project-item, .lang-item, .section-title { break-inside: avoid; page-break-inside: avoid; } }
    `;
  }

  private getATSStyles(): string {
    const metaColor = this.withAlpha(this.customization.textColor, 0.72) || '#6b7280';
    const atsThemeColor = this.customization.atsThemeColor || 'transparent';
 
     return `
      /* For PDF/print we rely on Puppeteer margins (set in request options) */
      @page { size: A4; margin: var(--page-margin); }

      /* Screen-only: keep the A4 look if this HTML is ever viewed directly */
      @media screen {
        .cv-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0; /* page-content margin remains 0, @page defines printable margins */
          background: white;
          box-shadow: 0 0 0 1px #e5e7eb, 0 10px 30px rgba(0,0,0,.12);
          position: relative;
          overflow: visible;
          --a4-height: 297mm;
          --page-marker-color: #000;
          --page-marker-thickness: 5px;
        }
        .cv-page::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent calc(var(--a4-height) - var(--page-marker-thickness)),
            var(--page-marker-color) calc(var(--a4-height) - var(--page-marker-thickness)),
            var(--page-marker-color) var(--a4-height)
          );
          background-size: 100% var(--a4-height);
          background-repeat: repeat-y;
        }
        .ats-page { width: 100%; padding: 24px; box-sizing: border-box; }
      }

      /* Print/PDF: avoid fixed-width container and shadows (each PDF page already has a boundary) */
      @media print {
        .cv-page {
          width: auto;
          min-height: auto;
          margin: 0;
          box-shadow: none;
          background: transparent;
        }
        .ats-page { width: auto; padding: 0; }
      }

      .ats-page {
        font-size: ${this.customization.fontSize}px;
        line-height: ${this.customization.lineHeight};
        color: ${this.customization.textColor};
      }

      .ats-section { position: relative; }

      /* Keep items together when possible, but allow long sections to flow */
      .experience-item, .education-item, .project-item, .certification-item, .reference-item {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      /* Header */
      .ats-header {
        text-align: center;
        margin-bottom: 14px;
        padding-bottom: 14px;
        border-bottom: 1px solid ${this.customization.borderColor || '#e5e7eb'};
      }
      .ats-header h1 {
        margin: 0;
        font-weight: 800;
        letter-spacing: 0.06em;
        word-break: break-word;
        color: ${this.customization.primaryColor};
      }
      .ats-headline {
        margin-top: 6px;
        color: ${this.customization.textColor};
        font-weight: 600;
        word-break: break-word;
      }
      .ats-header .contact {
        color: ${this.customization.textColor};
        margin-top: 8px;
        word-break: break-word;
      }

      /* Links: keep as plain text-like for ATS */
      .ats-links {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 8px;
      }
      .ats-link {
        background: transparent;
        color: ${this.customization.primaryColor};
        padding: 0;
        border-radius: 0;
        font-size: 0.95em;
        text-decoration: underline;
        text-underline-offset: 2px;
        word-break: break-all;
        max-width: 100%;
      }

      /* Sections */
      .ats-section { margin-top: 16px; }
      .ats-section { margin-top: var(--section-spacing); }
      .ats-section .title {
        display: block;
        background: ${atsThemeColor};
        padding: ${atsThemeColor !== 'transparent' ? '6px 10px' : '0 0 6px 0'};
        border-radius: ${atsThemeColor !== 'transparent' ? '6px' : '0'};
        font-weight: 800;
        text-align: left;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${this.customization.primaryColor};
        border-bottom: ${atsThemeColor !== 'transparent'
          ? `1px solid ${this.customization.borderColor || '#e5e7eb'}`
          : `2px solid ${this.customization.primaryColor}`};
        break-after: avoid;
        page-break-after: avoid;
      }

      .ats-body {
        padding: 10px 0 0 0;
        color: ${this.customization.textColor};
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      /* Lists */
      .ats-list {
        margin: 8px 0 0 0;
        padding-left: 18px;
      }
      .ats-list li {
        margin-bottom: 6px;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      /* Experience & Education */
      .experience-item, .education-item, .project-item, .certification-item, .reference-item {
        margin-top: 10px;
      }
      .ats-subtitle {
        font-weight: 700;
        color: ${this.customization.secondaryColor};
        word-break: break-word;
      }
      .ats-meta {
        color: ${metaColor};
        font-size: 0.95em;
        margin-top: 2px;
        word-break: break-word;
      }

      /* Prevent lonely lines */
      p, .ats-body, .ats-list li {
        orphans: 3;
        widows: 3;
      }
    `;
  }

  private pxToMmString(px: number | undefined | null): string {
    const valuePx = Number(px ?? 0);
    if (!isFinite(valuePx) || valuePx <= 0) return '0mm';
    // Puppeteer parses CSS-like units; mm is the most reliable for PDF.
    const mm = valuePx / 3.7795275591;
    return `${mm.toFixed(2)}mm`;
  }

  private withAlpha(color: string | undefined | null, alpha: number): string {
    if (!color) return '';
    const a = Math.min(1, Math.max(0, alpha));
    const hex = color.trim();
    const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
    if (!match) return '';
    const value = match[1];
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  backToThemeSelection(): void {
    this.cvService.setCurrentStep(8);
  }
}