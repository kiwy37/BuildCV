import { CvService } from '../cv.service';
import { CVData } from '../cv-data.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';

interface CustomizationSettings {
  fontSize: number;
  lineHeight: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
}

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
  showCustomizationPanel: boolean = false;

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
    backgroundColor: '#FFFFFF'
  };

  constructor(
    private cvService: CvService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cvData = this.cvService.getCVData();
    this.selectedTheme = (this.cvData as any).selectedTheme || 'lima';
    this.generatePreview();
  }

  toggleCustomizationPanel(): void {
    this.showCustomizationPanel = !this.showCustomizationPanel;
  }

  onCustomizationChange(): void {
    this.generatePreview();
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
      backgroundColor: '#FFFFFF'
    };
    this.generatePreview();
  }

  generatePreview(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      let html = '';
      switch(this.selectedTheme) {
        case 'lima':
          html = this.generateLimaTemplate();
          break;
        case 'rotterdam':
          html = this.generateRotterdamTemplate();
          break;
        case 'riga':
          html = this.generateRigaTemplate();
          break;
        case 'ats':
          html = this.generateATSTemplate();
          break;
        default:
          html = this.generateLimaTemplate();
      }
      
      this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html);
      this.isLoading = false;
    }, 300);
  }

  private applyCustomStyles(): string {
    const c = this.customization;
    return `
      font-size: ${c.fontSize}px !important;
      line-height: ${c.lineHeight} !important;
      color: ${c.textColor} !important;
    `;
  }

  private applyContainerStyles(): string {
    const c = this.customization;
    return `
      margin: ${c.marginTop}px ${c.marginRight}px ${c.marginBottom}px ${c.marginLeft}px !important;
      padding: ${c.paddingTop}px ${c.paddingRight}px ${c.paddingBottom}px ${c.paddingLeft}px !important;
      background-color: ${c.backgroundColor} !important;
    `;
  }

  private generateLimaTemplate(): string {
    const c = this.customization;
    return `
      <div class="cv-lima" style="${this.applyContainerStyles()}">
        <style>
          .cv-lima { ${this.applyCustomStyles()} }
          .cv-lima h1 { color: ${c.primaryColor} !important; font-size: ${c.fontSize * 2.2}px !important; }
          .cv-lima h2 { color: ${c.primaryColor} !important; font-size: ${c.fontSize * 1.6}px !important; }
          .cv-lima h3 { color: ${c.textColor} !important; font-size: ${c.fontSize * 1.2}px !important; }
          .cv-lima .section-title { color: ${c.primaryColor} !important; border-bottom-color: ${c.primaryColor} !important; }
          .cv-lima a { color: ${c.secondaryColor} !important; }
        </style>
        <h1>${this.cvData.personalInfo.fullName || 'Your Name'}</h1>
        <div class="contact-info">
          ${this.cvData.personalInfo.email} | ${this.cvData.personalInfo.phone} | ${this.cvData.personalInfo.location}
        </div>
        ${this.cvData.professionalSummary ? `
          <div class="section">
            <h2 class="section-title">Professional Summary</h2>
            <p>${this.cvData.professionalSummary}</p>
          </div>
        ` : ''}
        ${this.cvData.experiences && this.cvData.experiences.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Experience</h2>
            ${this.cvData.experiences.map(exp => `
              <div class="item">
                <h3>${exp.jobTitle}</h3>
                <div>${exp.company} | ${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}</div>
                ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                  <ul>
                    ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateRotterdamTemplate(): string {
    return `<div style="${this.applyContainerStyles()}"><h1>Rotterdam Template</h1><p>Coming soon...</p></div>`;
  }

  private generateRigaTemplate(): string {
    return `<div style="${this.applyContainerStyles()}"><h1>Riga Template</h1><p>Coming soon...</p></div>`;
  }

  private generateATSTemplate(): string {
    return `<div style="${this.applyContainerStyles()}"><h1>ATS Template</h1><p>Coming soon...</p></div>`;
  }

  downloadPDF(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this site to download PDF');
      return;
    }

    const cvContent = this.previewHtml;
    
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
          body { margin: 0; padding: 0; }
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
}