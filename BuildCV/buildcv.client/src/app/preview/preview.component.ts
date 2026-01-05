import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CvService } from '../cv.service';
import { CVData } from '../cv-data.model';
import { CustomizationSettings } from './templates/lima-template.component';
import { LimaTemplateComponent } from './templates/lima-template.component';
import { RigaTemplateComponent } from './templates/riga-template.component';
import { RotterdamTemplateComponent } from './templates/rotterdam-template.component';
import { ATSTemplateComponent } from './templates/ats-template.component';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
  cvData!: CVData;
  selectedTheme = 'lima';
  previewHtml: SafeHtml = '';
  isLoading = false;
  showCustomizationPanel = true;

  zoom = 1; // 1 = 100%

  customization: CustomizationSettings = {
    fontSize: 14,
    lineHeight: 1.6,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 32,
    paddingRight: 32,
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    textColor: '#2D3748',
    backgroundColor: '#FFFFFF',
    borderColor: '#dcdfe4',
    headingColor: '#2a303c',
    sectionBgColor: '#f9fafb',
    headingFontSize: 24,
    sectionSpacing: 20,
    fontFamily: 'Roboto'
  };

  @ViewChild('cvPreview') cvPreview?: ElementRef<HTMLDivElement>;

  constructor(
    private cvService: CvService,
    private sanitizer: DomSanitizer,
    private lima: LimaTemplateComponent,
    private riga: RigaTemplateComponent,
    private rotterdam: RotterdamTemplateComponent,
    private ats: ATSTemplateComponent
  ) {}

  ngOnInit(): void {
    this.cvData = this.cvService.getCVData();
    this.selectedTheme = (this.cvData as any).selectedTheme || 'lima';

    const saved = localStorage.getItem('cvCustomization');
    if (saved) {
      this.customization = JSON.parse(saved);
    }

    this.generatePreview();
  }

  toggleCustomizationPanel(): void {
    this.showCustomizationPanel = !this.showCustomizationPanel;
  }

  setZoom(value: string | number): void {
    const v = Number(value);
    if (!isNaN(v)) {
      this.zoom = Math.max(0.5, Math.min(2, v / 100));
    }
  }

  onCustomizationChange(): void {
    this.generatePreview(false);
    localStorage.setItem('cvCustomization', JSON.stringify(this.customization));
  }

  resetCustomization(): void {
    localStorage.removeItem('cvCustomization');
    this.ngOnInit();
  }

  generatePreview(showLoading = true): void {
    if (showLoading) this.isLoading = true;

    setTimeout(() => {
      let html = '';

      this.lima.cvData = this.cvData;
      this.lima.customization = this.customization;
      this.riga.cvData = this.cvData;
      this.riga.customization = this.customization;
      this.rotterdam.cvData = this.cvData;
      this.rotterdam.customization = this.customization;
      this.ats.cvData = this.cvData;
      this.ats.customization = this.customization;

      switch (this.selectedTheme) {
        case 'riga':
          html = this.riga.generateTemplate();
          break;
        case 'rotterdam':
          html = this.rotterdam.generateTemplate();
          break;
        case 'ats':
          html = this.ats.generateTemplate();
          break;
        default:
          html = this.lima.generateTemplate();
      }

      this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html);
      this.isLoading = false;
    }, 200);
  }

  downloadPDF(): void {
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; }
          </style>
        </head>
        <body>${this.cvPreview?.nativeElement.innerHTML}</body>
        <script>
          window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
        </script>
      </html>
    `);

    win.document.close();
  }

  backToThemeSelection(): void {
    this.cvService.setCurrentStep(8);
  }
}
