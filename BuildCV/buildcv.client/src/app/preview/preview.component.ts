import { CvService } from '../cv.service';
import { CVData } from '../cv-data.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CustomizationSettings } from './templates/lima-template.component';
import { LimaTemplateComponent } from './templates/lima-template.component';
import { RotterdamTemplateComponent } from './templates/rotterdam-template.component';
import { RigaTemplateComponent } from './templates/riga-template.component';
import { ATSTemplateComponent } from './templates/ats-template.component';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
  cvData!: CVData;
  selectedTheme: string = 'lima';
  previewHtml: SafeHtml = '';
  isLoading: boolean = false;
  showCustomizationPanel: boolean = true;
  zoom: number = 1.0;
  effectiveScale: number = 1.0;
  pageSize: 'A4' | 'Letter' = 'A4';
  activeTab: 'colors' | 'text' | 'spacing' = 'colors';

  customization: CustomizationSettings = {
    fontSize: 14,
    lineHeight: 1.6,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 30,
    marginRight: 30,
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 40,
    paddingRight: 40,
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

  constructor(
    private cvService: CvService,
    private sanitizer: DomSanitizer,
    private limaTemplate: LimaTemplateComponent,
    private rotterdamTemplate: RotterdamTemplateComponent,
    private rigaTemplate: RigaTemplateComponent,
    private atsTemplate: ATSTemplateComponent
  ) {}

  @ViewChild('cvWrapper', { static: false }) cvWrapper?: ElementRef<HTMLDivElement>;
  @ViewChild('cvPreview', { static: false }) cvPreview?: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.cvData = this.cvService.getCVData();
    this.selectedTheme = (this.cvData as any).selectedTheme || 'lima';
    
    // Load saved customization if exists
    const savedCustomization = localStorage.getItem('cvCustomization');
    if (savedCustomization) {
      this.customization = JSON.parse(savedCustomization);
    }
    
    this.generatePreview();
  }

  ngAfterViewInit(): void {
    // ensure scale is updated once view is initialized
    setTimeout(() => this.updateEffectiveScale(), 50);
  }

  toggleCustomizationPanel(): void {
    this.showCustomizationPanel = !this.showCustomizationPanel;
  }

  onCustomizationChange(): void {
    // Update preview without showing the loading spinner for smoother UX
    this.generatePreview(false);
    localStorage.setItem('cvCustomization', JSON.stringify(this.customization));
  }

  resetCustomization(): void {
    this.customization = {
      fontSize: 14,
      lineHeight: 1.6,
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 30,
      marginRight: 30,
      paddingTop: 30,
      paddingBottom: 30,
      paddingLeft: 40,
      paddingRight: 40,
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
    // Reset and update preview without showing loading spinner
    this.generatePreview(false);
    localStorage.removeItem('cvCustomization');
  }

  selectTab(tab: 'colors' | 'text' | 'spacing'): void {
    this.activeTab = tab;
  }

  generatePreview(showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoading = true;
    }

    setTimeout(() => {
      let html = '';
      
      // Set cvData and customization on each template component
      this.limaTemplate.cvData = this.cvData;
      this.limaTemplate.customization = this.customization;
      this.rotterdamTemplate.cvData = this.cvData;
      this.rotterdamTemplate.customization = this.customization;
      this.rigaTemplate.cvData = this.cvData;
      this.rigaTemplate.customization = this.customization;
      this.atsTemplate.cvData = this.cvData;
      this.atsTemplate.customization = this.customization;

      switch(this.selectedTheme) {
        case 'lima':
          html = this.limaTemplate.generateTemplate();
          break;
        case 'rotterdam':
          html = this.rotterdamTemplate.generateTemplate();
          break;
        case 'riga':
          html = this.rigaTemplate.generateTemplate();
          break;
        case 'ats':
          html = this.atsTemplate.generateTemplate();
          break;
        default:
          html = this.limaTemplate.generateTemplate();
      }
      
      this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html);
      // Ensure spinner is hidden once generation completes
      this.isLoading = false;
    }, 300);
  }

  setZoom(value: string | number): void {
    const v = Number(value);
    if (!isNaN(v)) {
      this.zoom = Math.max(0.5, Math.min(1.5, v / 100));
      // recalc effectiveScale after user changes zoom
      setTimeout(() => this.updateEffectiveScale(), 0);
    }
  }

  onPageSizeChange(): void {
    // regenerate preview sizing and refit
    this.generatePreview(false);
    setTimeout(() => this.updateEffectiveScale(), 50);
  }

  private updateEffectiveScale(): void {
    // When user zoom is 100% (zoom === 1.0) we want to fit the whole CV inside the
    // preview wrapper both horizontally and vertically. Otherwise use the explicit zoom.
    try {
      const wrapper = this.cvWrapper?.nativeElement;
      const preview = this.cvPreview?.nativeElement;
      if (!wrapper || !preview) {
        this.effectiveScale = this.zoom;
        return;
      }

      if (Math.abs(this.zoom - 1) < 0.001) {
        // natural sizes (before transform): preview element may have a set width (max-width:850px)
        const wrapperW = wrapper.clientWidth - 32; // account for padding in wrapper
        const wrapperH = wrapper.clientHeight - 32;

        const previewW = preview.scrollWidth || preview.offsetWidth;
        const previewH = preview.scrollHeight || preview.offsetHeight;

        if (previewW > 0 && previewH > 0) {
          const scaleW = wrapperW / previewW;
          const scaleH = wrapperH / previewH;
          const fitScale = Math.min(scaleW, scaleH, 1);
          this.effectiveScale = Number(fitScale.toFixed(4));
        } else {
          this.effectiveScale = 1;
        }
      } else {
        this.effectiveScale = this.zoom;
      }
    } catch (e) {
      this.effectiveScale = this.zoom;
    }
  }

  downloadPDF(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this site to download PDF');
      return;
    }

    const cvContent = document.querySelector('.cv-preview')?.innerHTML || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${this.cvData.personalInfo.fullName} - CV</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            @page { margin: 0; }
          }
          body { 
            margin: 0; 
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
        </style>
      </head>
      <body>
        ${cvContent}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  }

  goToStep(step: number): void {
    this.cvService.setCurrentStep(step);
  }

  backToThemeSelection(): void {
    this.cvService.setCurrentStep(8);
  }
}
