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
  headingFontSize: number;
  sectionSpacing: number;
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
  showCustomizationPanel: boolean = true;

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
    headingFontSize: 24,
    sectionSpacing: 20
  };

  constructor(
    private cvService: CvService,
    private sanitizer: DomSanitizer
  ) {}

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

  toggleCustomizationPanel(): void {
    this.showCustomizationPanel = !this.showCustomizationPanel;
  }

  onCustomizationChange(): void {
    this.generatePreview();
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
      headingFontSize: 24,
      sectionSpacing: 20
    };
    this.generatePreview();
    localStorage.removeItem('cvCustomization');
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
      max-width: 850px;
      margin-left: auto;
      margin-right: auto;
    `;
  }

  private generateLimaTemplate(): string {
    const c = this.customization;
    return `
      <div class="cv-lima" style="${this.applyContainerStyles()}">
        <style>
          .cv-lima { ${this.applyCustomStyles()} }
          .cv-lima h1 { 
            color: ${c.primaryColor} !important; 
            font-size: ${c.headingFontSize}px !important; 
            margin-bottom: ${c.sectionSpacing * 0.5}px !important;
          }
          .cv-lima h2 { 
            color: ${c.primaryColor} !important; 
            font-size: ${c.fontSize * 1.4}px !important; 
            margin-top: ${c.sectionSpacing}px !important;
            margin-bottom: ${c.sectionSpacing * 0.5}px !important;
            padding-bottom: ${c.sectionSpacing * 0.3}px !important;
            border-bottom: 2px solid ${c.primaryColor} !important;
          }
          .cv-lima h3 { 
            color: ${c.textColor} !important; 
            font-size: ${c.fontSize * 1.15}px !important; 
            margin-bottom: ${c.sectionSpacing * 0.3}px !important;
          }
          .cv-lima .contact-info { 
            color: ${c.textColor} !important; 
            margin-bottom: ${c.sectionSpacing}px !important;
            opacity: 0.8;
          }
          .cv-lima .section { 
            margin-bottom: ${c.sectionSpacing}px !important; 
          }
          .cv-lima .item { 
            margin-bottom: ${c.sectionSpacing * 0.8}px !important; 
          }
          .cv-lima a { color: ${c.secondaryColor} !important; }
          .cv-lima ul { 
            margin-top: ${c.sectionSpacing * 0.4}px !important;
            padding-left: ${c.paddingLeft * 0.5}px !important;
          }
          .cv-lima li { 
            margin-bottom: ${c.sectionSpacing * 0.2}px !important; 
          }
        </style>
        
        <h1>${this.cvData.personalInfo.fullName || 'Your Name'}</h1>
        <div class="contact-info">
          ${this.cvData.personalInfo.email}${this.cvData.personalInfo.phone ? ' | ' + this.cvData.personalInfo.phone : ''}${this.cvData.personalInfo.location ? ' | ' + this.cvData.personalInfo.location : ''}
        </div>
        
        ${this.cvData.professionalSummary ? `
          <div class="section">
            <h2>Professional Summary</h2>
            <p>${this.cvData.professionalSummary}</p>
          </div>
        ` : ''}
        
        ${this.cvData.experiences && this.cvData.experiences.length > 0 ? `
          <div class="section">
            <h2>Experience</h2>
            ${this.cvData.experiences.map(exp => `
              <div class="item">
                <h3>${exp.jobTitle}</h3>
                <div style="opacity: 0.8; margin-bottom: 8px;">
                  ${exp.company}${exp.location ? ' | ' + exp.location : ''} | ${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}
                </div>
                ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                  <ul>
                    ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${this.cvData.education && this.cvData.education.length > 0 ? `
          <div class="section">
            <h2>Education</h2>
            ${this.cvData.education.map(edu => `
              <div class="item">
                <h3>${edu.degree}</h3>
                <div style="opacity: 0.8; margin-bottom: 8px;">
                  ${edu.institution}${edu.location ? ' | ' + edu.location : ''} | ${edu.startDate} - ${edu.endDate}
                </div>
                ${edu.gpa ? `<div style="opacity: 0.8;">GPA: ${edu.gpa}</div>` : ''}
                ${edu.achievements && edu.achievements.length > 0 ? `
                  <ul>
                    ${edu.achievements.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${this.cvData.skills && this.cvData.skills.length > 0 ? `
          <div class="section">
            <h2>Skills</h2>
            <div>${this.cvData.skills.join(' • ')}</div>
          </div>
        ` : ''}
        
        ${this.cvData.projects && this.cvData.projects.length > 0 ? `
          <div class="section">
            <h2>Projects</h2>
            ${this.cvData.projects.map(proj => `
              <div class="item">
                <h3>${proj.name}</h3>
                <p>${proj.description}</p>
                ${proj.technologies && proj.technologies.length > 0 ? `
                  <div style="opacity: 0.8; margin-top: 8px;">
                    <strong>Technologies:</strong> ${proj.technologies.join(', ')}
                  </div>
                ` : ''}
                ${proj.link ? `<div style="margin-top: 4px;"><a href="${proj.link}" target="_blank">${proj.link}</a></div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${this.cvData.certifications && this.cvData.certifications.length > 0 ? `
          <div class="section">
            <h2>Certifications</h2>
            ${this.cvData.certifications.map(cert => `
              <div class="item">
                <h3>${cert.name}</h3>
                <div style="opacity: 0.8;">
                  ${cert.issuer}${cert.date ? ' | ' + cert.date : ''}${cert.credentialId ? ' | ID: ' + cert.credentialId : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${this.cvData.languages && this.cvData.languages.length > 0 ? `
          <div class="section">
            <h2>Languages</h2>
            <div>${this.cvData.languages.join(' • ')}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateRotterdamTemplate(): string {
    return this.generateLimaTemplate();
  }

  private generateRigaTemplate(): string {
    return this.generateLimaTemplate();
  }

  private generateATSTemplate(): string {
    return this.generateLimaTemplate();
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
    this.cvService.setCurrentStep(7);
  }
}