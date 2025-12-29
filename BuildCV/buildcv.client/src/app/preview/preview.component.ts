import { CvService } from '../cv.service';
import { CVData } from '../cv-data.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
  zoom: number = 1.0;
  // actual scale applied to the preview. Use this to implement fit-to-container when zoom is 100%
  effectiveScale: number = 1.0;

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
      headingFontSize: 24,
      sectionSpacing: 20
    };
    // Reset and update preview without showing loading spinner
    this.generatePreview(false);
    localStorage.removeItem('cvCustomization');
  }

  generatePreview(showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoading = true;
    }

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
      /* Use padding instead of margin so the preview can be centered inside the wrapper */
      padding: ${c.paddingTop + c.marginTop}px ${c.paddingRight + c.marginRight}px ${c.paddingBottom + c.marginBottom}px ${c.paddingLeft + c.marginLeft}px !important;
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
  const c = this.customization;
  const pi = this.cvData.personalInfo;
  
  // Culori din imagine (sau din customization dacă vrei să fie editabile)
  const sidebarBg = '#e3d5c8'; // Bejul din imagine
  const headerBg = '#3d3d3d';  // Griul închis din imagine

  return `
    <div class="cv-rotterdam-container" style="
        font-family: 'Roboto', sans-serif;
        display: flex;
        width: 850px;
        min-height: 1100px;
        background: white;
        color: ${c.textColor};
        font-size: ${c.fontSize}px;
        line-height: ${c.lineHeight};
        text-align: left;
    ">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@300;400;700&display=swap');
        .sidebar { width: 35%; background-color: ${sidebarBg}; padding: 40px 30px; box-sizing: border-box; }
        .main-content { width: 65%; display: flex; flex-direction: column; }
        .rt-header { background-color: ${headerBg}; color: white; padding: 50px 40px; }
        .rt-header h1 { font-family: 'Playfair Display', serif; font-size: ${c.headingFontSize * 1.8}px; margin: 0; line-height: 1.1; }
        .rt-header p { text-transform: uppercase; letter-spacing: 4px; font-size: 0.8rem; margin-top: 10px; opacity: 0.9; }
        .content-body { padding: 40px; }
        .section-title { 
            text-transform: uppercase; 
            font-size: 1.1rem; 
            font-weight: 700;
            border-bottom: 1px solid #ddd; 
            padding-bottom: 5px; 
            margin: ${c.sectionSpacing}px 0 15px 0; 
            letter-spacing: 2px;
            color: ${c.primaryColor};
        }
        .sidebar-title { 
            text-transform: uppercase; 
            font-size: 1rem; 
            border-bottom: 2px solid #333; 
            padding-bottom: 5px; 
            margin-bottom: 15px; 
            margin-top: 25px;
        }
        .contact-item { display: flex; align-items: center; margin-bottom: 12px; font-size: 0.85rem; }
        .icon-circle { 
            width: 24px; height: 24px; background: black; color: white; 
            border-radius: 50%; display: flex; justify-content: center; 
            align-items: center; margin-right: 12px; font-size: 10px;
        }
        .job-title { font-weight: 700; margin-top: 15px; }
        .job-meta { font-weight: 700; color: #666; font-size: 0.9rem; }
        ul { padding-left: 18px; margin-top: 8px; }
        li { margin-bottom: 4px; }
      </style>

      <div class="sidebar">


        <div class="contact-info">
          <div class="contact-item"><div class="icon-circle">📞</div> ${pi.phone || ''}</div>
          <div class="contact-item"><div class="icon-circle">✉️</div> ${pi.email || ''}</div>
          <div class="contact-item"><div class="icon-circle">📍</div> ${pi.location || ''}</div>
        </div>

        <div class="sidebar-title">Kişisel Bilgiler</div>
        <div style="font-size: 0.9rem;">
            <strong>Doğum tarihi</strong><br><span style="color:#555">12-10-1996</span><br><br>
            <strong>Uyruğu</strong><br><span style="color:#555">Türk</span>
        </div>

        <div class="sidebar-title">Referanslar</div>
        ${(this.cvData.references || []).map(ref => `
          <div style="font-size: 0.85rem; margin-bottom: 15px;">
            <strong>${ref.name}</strong><br>
            <span style="color:#666">${ref.position}<br>${ref.phone}</span>
          </div>
        `).join('')}
      </div>

      <div class="main-content">
        <div class="rt-header">
          <h1>${pi.fullName || 'Nume Prenume'}</h1>
          <p>Grafik ve Web Tasarımcısı</p>
        </div>

        <div class="content-body">
          <div class="section-title">Hakkımda</div>
          <p style="color:#444">${this.cvData.professionalSummary || ''}</p>

          <div class="section-title">İş Deneyimi</div>
          ${this.cvData.experiences.map(exp => `
            <div style="margin-bottom: 20px;">
              <div class="job-title">${exp.jobTitle}</div>
              <div class="job-meta">${exp.company} / ${exp.startDate} - ${exp.endDate}</div>
              <ul>${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>
            </div>
          `).join('')}

          <div class="section-title">Eğitim</div>
          ${this.cvData.education.map(edu => `
            <div style="margin-bottom: 15px;">
              <div class="job-title">${edu.degree}</div>
              <div class="job-meta">${edu.institution} / ${edu.endDate}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
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