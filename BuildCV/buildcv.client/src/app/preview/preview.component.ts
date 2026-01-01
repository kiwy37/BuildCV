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
  fontFamily: string;
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
  // paper size for preview (A4 or Letter)
  pageSize: 'A4' | 'Letter' = 'A4';

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
    sectionSpacing: 20,
    fontFamily: 'Roboto'
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
      sectionSpacing: 20,
      fontFamily: 'Roboto'
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

  private applyCustomStyles(): string {
    const c = this.customization;
    return `
      font-family: ${this.getFontStack(c.fontFamily)} !important;
      font-size: ${c.fontSize}px !important;
      line-height: ${c.lineHeight} !important;
      color: ${c.textColor} !important;
    `;
  }

  private getFontStack(fontFamily: string): string {
    const fonts: { [key: string]: string } = {
      'Roboto': "'Roboto', sans-serif",
      'Lato': "'Lato', sans-serif",
      'Montserrat': "'Montserrat', sans-serif",
      'Open Sans': "'Open Sans', sans-serif",
      'Raleway': "'Raleway', sans-serif",
      'Caladea': "'Caladea', serif",
      'Lora': "'Lora', serif",
      'Roboto Slab': "'Roboto Slab', serif",
      'Playfair Display': "'Playfair Display', serif",
      'Merriweather': "'Merriweather', serif"
    };
    return fonts[fontFamily] || fonts['Roboto'];
  }

  private getGoogleFontImport(fontFamily: string): string {
    const map: { [key: string]: string } = {
      'Roboto': "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap",
      'Lato': "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap",
      'Montserrat': "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap",
      'Open Sans': "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&display=swap",
      'Raleway': "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;700&display=swap",
      'Caladea': "https://fonts.googleapis.com/css2?family=Caladea&display=swap",
      'Lora': "https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap",
      'Roboto Slab': "https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;700&display=swap",
      'Playfair Display': "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap",
      'Merriweather': "https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap"
    };
    const url = map[fontFamily];
    return url ? `@import url('${url}');` : '';
  }

  private applyContainerStyles(): string {
    const c = this.customization;
    const maxWidth = 794; // keep width constant; pageSize now only toggles aspect ratio via CSS
    return `
      /* Use padding instead of margin so the preview can be centered inside the wrapper */
      padding: ${c.paddingTop + c.marginTop}px ${c.paddingRight + c.marginRight}px ${c.paddingBottom + c.marginBottom}px ${c.paddingLeft + c.marginLeft}px !important;
      background-color: ${c.backgroundColor} !important;
      max-width: ${maxWidth}px;
      margin-left: auto;
      margin-right: auto;
    `;
  }

  private generateLimaTemplate(): string {
    const c = this.customization;
    const pi = this.cvData.personalInfo || {} as any;
    return `
      <div class="cv-lima-container" style="${this.applyContainerStyles()} background: ${c.backgroundColor};">
        <style>
          ${this.getGoogleFontImport(c.fontFamily)}
          .cv-lima-container { font-family: ${this.getFontStack(c.fontFamily)}; color: ${c.textColor}; }
          .lima-wrap { display: flex; width: 100%; min-height: 1100px; background: white; box-shadow: 0 0 0 rgba(0,0,0,0); }
          .lima-sidebar { width: 30%; background: #2b3442; color: #d1d5db; padding: 36px 28px; box-sizing: border-box; display: flex; flex-direction: column; gap: 18px; }
          .lima-profile { display: flex; flex-direction: column; align-items: center; gap: 12px; }
          .lima-avatar { width: 120px; height: 120px; border-radius: 50%; overflow: hidden; background: #e5e7eb; }
          .lima-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .lima-sidebar h4 { color: #f8fafc; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          .lima-section { margin-top: 8px; }
          .lima-section p, .lima-section div { color: #cbd5e1; font-size: ${c.fontSize}px; line-height: ${c.lineHeight}; }
          .lima-links a { color: #cbd5e1; text-decoration: none; display:block; margin-bottom:6px; }

          .lima-main { width: 70%; padding: 36px 44px; box-sizing: border-box; display: flex; flex-direction: column; }
          .lm-header { display:flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
          .lm-title { font-family: ${this.getFontStack(c.fontFamily)}; color: ${c.textColor}; }
          .lm-title h1 { margin: 0; font-size: ${c.headingFontSize * 1.4}px; letter-spacing: 1px; }
          .lm-title h2 { margin: 6px 0 0 0; color: ${c.primaryColor}; font-size: ${c.headingFontSize}px; font-weight:700; }
          .lm-contact { text-align: right; color: ${c.textColor}; opacity: 0.8; font-size: ${c.fontSize}px; }

          .lm-body { margin-top: 18px; display: flex; flex-direction: column; gap: 18px; }
          .section-title { text-transform: uppercase; font-weight:700; letter-spacing: 1px; color: ${c.textColor}; margin-bottom:8px; }

          /* Experience two-column layout with vertical rule */
          .experience-item { display: grid; grid-template-columns: 28% 1fr; gap: 18px; align-items: start; padding: 12px 0; border-top: 1px solid #e6e6e6; }
          .exp-left { color: ${c.textColor}; opacity: 0.8; font-size: ${c.fontSize - 1}px; }
          .exp-right h3 { margin: 0; font-size: ${c.fontSize * 1.05}px; color: ${c.primaryColor}; }
          .exp-right ul { margin: 8px 0 0 0; padding-left: 18px; }

          .education-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
          .skill-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }

          /* small bullets under hobbies */
          .hobby-list { display:flex; gap:8px; flex-wrap:wrap; }
          .hobby { background:#f3f4f6; padding:6px 10px; border-radius:999px; font-size:0.85rem; color:#374151; }

          /* make lists look neat */
          .lm-body p, .lm-body li { color: ${c.textColor}; font-size: ${c.fontSize}px; line-height: ${c.lineHeight}; }
        </style>

        <div class="lima-wrap">
          <aside class="lima-sidebar">
            <div class="lima-profile">
              <div class="lima-avatar">
                ${pi.photoUrl ? `<img src="${pi.photoUrl}" alt="avatar">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#d1d5db,#94a3b8);"></div>`}
              </div>
              <div style="text-align:center; color:#f8fafc; font-weight:700;">${pi.fullName || 'Your Name'}</div>
              <div style="text-align:center; color:#cbd5e1">${pi.title || pi.profession || ''}</div>
            </div>

            ${this.cvData.professionalSummary ? `
              <div class="lima-section">
                <h4>About</h4>
                <p>${this.cvData.professionalSummary}</p>
              </div>
            ` : ''}

            ${pi.links && pi.links.length ? `
              <div class="lima-section lima-links">
                <h4>Links</h4>
                ${pi.links.map((l:any)=>`<a href="${l}" target="_blank">${l}</a>`).join('')}
              </div>
            ` : ''}

            ${this.cvData.languages && this.cvData.languages.length ? `
              <div class="lima-section">
                <h4>Languages</h4>
                <div>${this.cvData.languages.join(', ')}</div>
              </div>
            ` : ''}

            ${this.cvData.references && this.cvData.references.length ? `
              <div class="lima-section">
                <h4>References</h4>
                ${this.cvData.references.map((r:any)=>`<div style="font-weight:600;color:#f8fafc">${r.name}</div><div style="font-size:0.85rem;color:#cbd5e1">${r.title || ''}${r.phone ? ' | ' + r.phone : ''}</div>`).join('')}
              </div>
            ` : ''}
          </aside>

          <main class="lima-main">
            <div class="lm-header">
              <div class="lm-title">
                <h1>${pi.fullName || 'Your Name'}</h1>
                <h2>${pi.title || ''}</h2>
              </div>
              <div class="lm-contact">
                <div>${pi.location || ''}</div>
                <div>${pi.email || ''}</div>
                <div>${pi.phone || ''}</div>
              </div>
            </div>

            <div class="lm-body">
              ${this.cvData.experiences && this.cvData.experiences.length ? `
                <section>
                  <div class="section-title">Work Experience</div>
                  ${this.cvData.experiences.map((e:any)=>`
                    <div class="experience-item">
                      <div class="exp-left">
                        <div style="font-weight:700">${e.company}</div>
                        <div>${e.location || ''}</div>
                        <div style="margin-top:6px;opacity:0.8">${e.startDate} - ${e.isCurrent ? 'Present' : e.endDate}</div>
                      </div>
                      <div class="exp-right">
                        <h3>${e.jobTitle}</h3>
                        ${e.responsibilities && e.responsibilities.length ? `<ul>${e.responsibilities.map((r:any)=>`<li>${r}</li>`).join('')}</ul>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </section>
              ` : ''}

              ${this.cvData.education && this.cvData.education.length ? `
                <section>
                  <div class="section-title">Education</div>
                  <div class="education-grid">
                    ${this.cvData.education.map((ed:any)=>`
                      <div>
                        <div style="font-weight:700">${ed.institution}</div>
                        <div style="opacity:0.8">${ed.degree} • ${ed.startDate} - ${ed.endDate}</div>
                      </div>
                    `).join('')}
                  </div>
                </section>
              ` : ''}

              ${this.cvData.skills && this.cvData.skills.length ? `
                <section>
                  <div class="section-title">Skills</div>
                  <div class="skill-grid">
                    ${this.cvData.skills.map((s:any)=>`<div style="padding:6px 8px;background:#f8fafc;border-radius:6px;">${s}</div>`).join('')}
                  </div>
                </section>
              ` : ''}

              ${this.cvData.hobbies && this.cvData.hobbies.length ? `
                <section>
                  <div class="section-title">Hobbies</div>
                  <div class="hobby-list">
                    ${this.cvData.hobbies.map((h:any)=>`<div class="hobby">${h}</div>`).join('')}
                  </div>
                </section>
              ` : ''}
            </div>
          </main>
        </div>
      </div>
    `;
  }

 private generateRotterdamTemplate(): string {
  const c = this.customization;
  const pi = this.cvData.personalInfo;
  
  const sidebarBg = '#d9ccc4';
  const headerBg = '#3a3a3a';

  return `
    <div class="cv-rotterdam-container" style="
      font-family: ${this.getFontStack(c.fontFamily)};
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
      ${this.getGoogleFontImport(c.fontFamily)}
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        .sidebar { width: 30%; background-color: ${sidebarBg}; padding: 40px 25px; box-sizing: border-box; overflow-y: auto; }
        .main-content { width: 70%; display: flex; flex-direction: column; }
        .rt-header { background-color: ${headerBg}; color: white; padding: 40px 35px; display: flex; align-items: center; gap: 30px; }
        .rt-profile-pic { width: 100px; height: 100px; border-radius: 50%; background: #ddd; flex-shrink: 0; overflow: hidden; }
        .rt-profile-pic img { width: 100%; height: 100%; object-fit: cover; }
        .rt-header-info { flex: 1; }
        .rt-header h1 { font-family: 'Playfair Display', serif; font-size: ${c.headingFontSize * 1.6}px; margin: 0; line-height: 1.1; color: white; }
        .rt-header p { text-transform: uppercase; letter-spacing: 3px; font-size: 0.75rem; margin-top: 8px; opacity: 0.9; }
        .content-body { padding: 35px; flex: 1; overflow-y: auto; }
        .section-title { 
            text-transform: uppercase; 
            font-size: 1rem; 
            font-weight: 700;
            border-bottom: 2px solid #999; 
            padding-bottom: 8px; 
            margin: 20px 0 15px 0; 
            letter-spacing: 1px;
            color: #333;
        }
        .sidebar-title { 
            text-transform: uppercase; 
            font-size: 0.9rem; 
            border-bottom: 2px solid #333; 
            padding-bottom: 5px; 
            margin-bottom: 12px; 
            margin-top: 20px;
            font-weight: 700;
        }
        .contact-item { display: flex; align-items: flex-start; margin-bottom: 10px; font-size: 0.8rem; }
        .icon-circle { 
            width: 22px; height: 22px; background: #333; color: white; 
            border-radius: 50%; display: flex; justify-content: center; 
            align-items: center; margin-right: 10px; font-size: 9px; flex-shrink: 0;
        }
        .sidebar-item { font-size: 0.85rem; margin-bottom: 10px; }
        .sidebar-label { font-weight: 700; color: #333; margin-bottom: 2px; }
        .sidebar-value { color: #666; }
        .job-title { font-weight: 700; margin-top: 12px; font-size: 1rem; }
        .job-meta { color: #666; font-size: 0.85rem; margin-top: 3px; }
        .job-company { font-weight: 700; font-size: 0.95rem; }
        .job-period { font-size: 0.85rem; color: #666; }
        ul { padding-left: 16px; margin-top: 6px; margin-bottom: 0; }
        li { margin-bottom: 3px; font-size: 0.9rem; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .skill-tag { background: #f0f0f0; padding: 4px 10px; border-radius: 15px; font-size: 0.8rem; }
      </style>

      <div class="sidebar">
        <div class="contact-info">
          <div class="contact-item">
            <div class="icon-circle">☎</div> 
            <div style="word-break: break-word;">${pi.phone || ''}</div>
          </div>
          <div class="contact-item">
            <div class="icon-circle">✉</div> 
            <div style="word-break: break-word;">${pi.email || ''}</div>
          </div>
          <div class="contact-item">
            <div class="icon-circle">📍</div> 
            <div style="word-break: break-word;">${pi.location || ''}</div>
          </div>
          ${pi.website ? `
          <div class="contact-item">
            <div class="icon-circle">🔗</div> 
            <div style="word-break: break-word;"><a href="${pi.website}" style="color: #333; text-decoration: none;">${pi.website}</a></div>
          </div>
          ` : ''}
          ${pi.linkedIn ? `
          <div class="contact-item">
            <div class="icon-circle">💼</div> 
            <div style="word-break: break-word;"><a href="${pi.linkedIn}" style="color: #333; text-decoration: none;">LinkedIn</a></div>
          </div>
          ` : ''}
        </div>

        ${this.cvData.personalInfo.fullName ? `
        <div class="sidebar-title">Personal Details</div>
        <div class="sidebar-item">
          <div class="sidebar-label">Name</div>
          <div class="sidebar-value">${pi.fullName}</div>
        </div>
        ` : ''}

        ${(this.cvData.references || []).length > 0 ? `
        <div class="sidebar-title">References</div>
        ${(this.cvData.references || []).map(ref => `
          <div class="sidebar-item">
            <div class="sidebar-label">${ref.name}</div>
            <div class="sidebar-value">${ref.position}</div>
            <div class="sidebar-value">${ref.phone}${ref.email ? ' | ' + ref.email : ''}</div>
          </div>
        `).join('')}
        ` : ''}

        ${this.cvData.languages && this.cvData.languages.length > 0 ? `
        <div class="sidebar-title">Languages</div>
        ${this.cvData.languages.map(lang => `
          <div class="sidebar-value" style="margin-bottom: 8px;">${lang}</div>
        `).join('')}
        ` : ''}

        ${this.cvData.skills && this.cvData.skills.length > 0 ? `
        <div class="sidebar-title">Skills</div>
        <div class="skills-list">
          ${this.cvData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
        ` : ''}
      </div>

      <div class="main-content">
        <div class="rt-header">
          ${pi.photoUrl ? `
          <div class="rt-profile-pic">
            <img src="${pi.photoUrl}" alt="Profile">
          </div>
          ` : ''}
          <div class="rt-header-info">
            <h1>${pi.fullName || 'Your Name'}</h1>
            <p>Professional Profile</p>
          </div>
        </div>

        <div class="content-body">
          ${this.cvData.professionalSummary ? `
          <div class="section-title">About Me</div>
          <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">${this.cvData.professionalSummary}</p>
          ` : ''}

          ${this.cvData.experiences && this.cvData.experiences.length > 0 ? `
          <div class="section-title">Work Experience</div>
          ${this.cvData.experiences.map(exp => `
            <div style="margin-bottom: 18px;">
              <div class="job-title">${exp.jobTitle}</div>
              <div class="job-company">${exp.company}${exp.location ? ' / ' + exp.location : ''}</div>
              <div class="job-period">${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}</div>
              ${exp.responsibilities && exp.responsibilities.length > 0 ? `
              <ul>
                ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
              </ul>
              ` : ''}
            </div>
          `).join('')}
          ` : ''}

          ${this.cvData.education && this.cvData.education.length > 0 ? `
          <div class="section-title">Education</div>
          ${this.cvData.education.map(edu => `
            <div style="margin-bottom: 15px;">
              <div class="job-title">${edu.degree}</div>
              <div class="job-company">${edu.institution}${edu.location ? ' / ' + edu.location : ''}</div>
              <div class="job-period">${edu.startDate} - ${edu.endDate}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}</div>
              ${edu.achievements && edu.achievements.length > 0 ? `
              <ul>
                ${edu.achievements.map(a => `<li>${a}</li>`).join('')}
              </ul>
              ` : ''}
            </div>
          `).join('')}
          ` : ''}

          ${this.cvData.projects && this.cvData.projects.length > 0 ? `
          <div class="section-title">Projects</div>
          ${this.cvData.projects.map(proj => `
            <div style="margin-bottom: 15px;">
              <div class="job-title">${proj.name}</div>
              <p style="color: #555; margin: 6px 0; font-size: 0.95rem;">${proj.description}</p>
              ${proj.technologies && proj.technologies.length > 0 ? `
              <div style="color: #666; font-size: 0.85rem;">
                <strong>Technologies:</strong> ${proj.technologies.join(', ')}
              </div>
              ` : ''}
              ${proj.link ? `
              <div style="margin-top: 6px;"><a href="${proj.link}" target="_blank" style="color: #333; text-decoration: none; font-size: 0.85rem;">View Project →</a></div>
              ` : ''}
            </div>
          `).join('')}
          ` : ''}

          ${this.cvData.certifications && this.cvData.certifications.length > 0 ? `
          <div class="section-title">Certifications & Awards</div>
          ${this.cvData.certifications.map(cert => `
            <div style="margin-bottom: 12px;">
              <div class="job-title">${cert.name}</div>
              <div class="job-meta">${cert.issuer}${cert.date ? ' | ' + cert.date : ''}${cert.credentialId ? ' | ID: ' + cert.credentialId : ''}</div>
            </div>
          `).join('')}
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

  private generateRigaTemplate(): string {
    const c = this.customization;
    const pi = this.cvData.personalInfo || {} as any;

    return `
      <div class="cv-riga-container" style="${this.applyContainerStyles()} background: ${c.backgroundColor};">
        <style>
          ${this.getGoogleFontImport(c.fontFamily)}
          .cv-riga-container { font-family: ${this.getFontStack(c.fontFamily)}; color: ${c.textColor}; }
          .riga-page { width: 100%; min-height: 1100px; background: white; display: flex; flex-direction: column; }

          /* strong navy top band */
          .riga-top { background: #1f2937; color: #fff; padding: 34px 24px 28px 24px; text-align: center; }
          .riga-top .small { color: #d6c39a; letter-spacing: 6px; font-size: 12px; margin-bottom: 6px; display:block; }
          .riga-top h1 { margin: 6px 0 6px 0; font-size: ${c.headingFontSize * 2}px; letter-spacing: 6px; text-transform:uppercase; }
          .riga-top h2 { margin: 0; font-size: ${c.fontSize + 2}px; color: #b88c3a; font-weight:700; letter-spacing: 2px; }

          .riga-body { display:flex; }
          .riga-left { width: 34%; background: #f4f4f6; padding: 24px 28px 40px 28px; box-sizing: border-box; position: relative; }
          .riga-right { width: 66%; padding: 28px 44px 40px 44px; box-sizing: border-box; }

          /* avatar overlaps the top band */
          .riga-avatar { width: 140px; height: 140px; border-radius: 50%; overflow: hidden; margin: -70px auto 14px auto; border: 6px solid #fff; box-shadow: 0 6px 18px rgba(17,24,39,0.12); background:#e6e7ea }
          .riga-avatar img { width:100%; height:100%; object-fit:cover; display:block; }

          .left-section { padding-top: 8px; }
          .left-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:22px; }
          .left-heading h4 { margin:0; text-transform:uppercase; letter-spacing:1px; color:#374151; font-size:0.95rem; }
          .left-hr { height:1px; background:#d1d5db; margin-top:12px; }

          .edu-item { margin:12px 0; }
          .edu-item .degree { font-weight:700; color:#111827; }
          .edu-item .meta { color:#8b8f95; font-size:0.9rem; margin-top:6px; }

          .lang-item { margin:10px 0; }
          .lang-label { font-size:0.9rem; color:#374151; font-weight:600; margin-bottom:8px; }
          .lang-bar { height:8px; background:#e6e6e6; border-radius:999px; overflow:hidden; }
          .lang-fill { height:8px; background:#b88c3a; width:60%; }

          /* right column styling */
          .section-title { text-transform:uppercase; font-weight:700; letter-spacing:1px; color:#374151; margin: 6px 0 12px 0; border-bottom:1px solid #e6e6e6; padding-bottom:8px; }

          .job { margin-bottom:18px; }
          .job h3 { margin: 0; font-size: ${c.fontSize * 1.05}px; color:#111827; }
          .job .company { color:#b88c3a; font-weight:700; margin-top:6px; }
          .job p { margin:8px 0 0 0; color:#4b5563; line-height:${c.lineHeight}; }

          .skills-grid { display:grid; grid-template-columns: repeat(2,1fr); gap:12px; margin-top:8px; }
          .skill-row { display:flex; align-items:center; gap:12px; }
          .skill-name { width:40%; font-weight:600; color:#374151; }
          .skill-meter { flex:1; height:8px; background:#e6e6e6; border-radius:999px; overflow:hidden; }
          .skill-meter .fill { height:8px; background:#b88c3a; width:70%; }

          /* small print tweak for contact row */
          .contact-row { display:flex; gap:18px; justify-content:center; color:#c9cdd2; margin-top:8px; }

          @media print, (max-width:720px) {
            .riga-body { flex-direction:column; }
            .riga-left, .riga-right { width:100%; }
            .riga-top h1 { font-size: 26px; }
            .riga-avatar { margin-top:-56px; }
          }
        </style>

        <div class="riga-page">
          <div class="riga-top">
            <span class="small">C I M</span>
            <h1>${pi.fullName || 'Your Name'}</h1>
            <h2>${pi.title || pi.profession || ''}</h2>
            <div class="contact-row">
              <div>${pi.location || ''}</div>
              <div>${pi.phone || ''}</div>
              <div>${pi.email || ''}</div>
            </div>
          </div>

          <div class="riga-body">
            <aside class="riga-left">
              <div class="riga-avatar">
                ${pi.photoUrl ? `<img src="${pi.photoUrl}" alt="avatar">` : `<div style="width:100%;height:100%;"></div>`}
              </div>
              <div class="left-section">
                <div style="text-align:center;font-weight:700;color:#111827">${pi.fullName || ''}</div>
                <div style="text-align:center;color:#8b8f95;margin-bottom:8px">${pi.title || ''}</div>

                ${this.cvData.education && this.cvData.education.length ? `
                  <div>
                    <div class="left-heading"><h4>Education</h4></div>
                    <div class="left-hr"></div>
                    ${this.cvData.education.map((ed:any)=>`
                      <div class="edu-item"><div class="degree">${ed.degree}</div><div class="meta">${ed.institution} • ${ed.endDate || ''}</div></div>
                    `).join('')}
                  </div>
                ` : ''}

                ${this.cvData.languages && this.cvData.languages.length ? `
                  <div>
                    <div class="left-heading"><h4>Languages</h4></div>
                    <div class="left-hr"></div>
                    ${this.cvData.languages.map((l:any)=>`
                      <div class="lang-item"><div class="lang-label">${l.name || l}</div><div class="lang-bar"><div class="lang-fill" style="width:${(l.levelPercent||60)}%"></div></div></div>
                    `).join('')}
                  </div>
                ` : ''}

                ${this.cvData.skills && this.cvData.skills.length ? `
                  <div>
                    <div class="left-heading"><h4>Skills</h4></div>
                    <div class="left-hr"></div>
                    <div class="skills-grid">
                      ${this.cvData.skills.map((s:any)=>`<div class="skill-tag">${s}</div>`).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </aside>

            <main class="riga-right">
              ${this.cvData.professionalSummary ? `<div><div class="section-title">Profile</div><p style="color:#4b5563">${this.cvData.professionalSummary}</p></div>` : ''}

              ${this.cvData.experiences && this.cvData.experiences.length ? `
                <div>
                  <div class="section-title">Work Experience</div>
                  ${this.cvData.experiences.map((e:any)=>`
                    <div class="job"><h3>${e.jobTitle}</h3><div class="company">${e.company} ${e.location ? ' • ' + e.location : ''}</div>${e.responsibilities && e.responsibilities.length ? `<p>${e.responsibilities.map((r:any)=>`• ${r}`).join('<br>')}</p>` : ''}</div>
                  `).join('')}
                </div>
              ` : ''}

              ${this.cvData.skills && this.cvData.skills.length ? `
                <div>
                  <div class="section-title">Skills & Tools</div>
                  <div>
                    ${this.cvData.skills.map((s:any)=>`
                      <div class="skill-row"><div class="skill-name">${s}</div><div class="skill-meter"><div class="fill" style="width:70%"></div></div></div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${this.cvData.projects && this.cvData.projects.length ? `
                <div>
                  <div class="section-title">Projects</div>
                  ${this.cvData.projects.map((p:any)=>`<div style="margin-bottom:10px;"><div style="font-weight:700">${p.name}</div><div style="color:#6b7280">${p.description || ''}</div></div>`).join('')}
                </div>
              ` : ''}
            </main>
          </div>
        </div>
      </div>
    `;
  }

  private generateATSTemplate(): string {
    const c = this.customization;
    const pi = this.cvData.personalInfo || {} as any;

    return `
      <div class="cv-ats-container" style="${this.applyContainerStyles()} background: ${c.backgroundColor};">
        <style>
          ${this.getGoogleFontImport(c.fontFamily)}
          .cv-ats-container { font-family: ${this.getFontStack(c.fontFamily)}; color: ${c.textColor}; }
          .ats-page { width: 100%; min-height: 1100px; background: white; padding: 24px; box-sizing: border-box; }

          .ats-header { text-align: center; margin-bottom: 8px; }
          .ats-header h1 { margin: 0; font-size: ${c.headingFontSize * 1.6}px; font-weight:700; letter-spacing:2px; }
          .ats-header .contact { color: #374151; font-size: ${c.fontSize - 1}px; margin-top:8px; }
          .ats-links { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:10px; }
          .ats-link { background:#f1f5f9; color:#1f2937; padding:6px 10px; border-radius:6px; font-size:0.9rem; text-decoration:none; }

          .ats-section { margin-top:18px; }
          .ats-section .title { display:block; background:#eef6ff; color:#1f2937; padding:8px 12px; border-radius:6px; font-weight:700; text-align:center; letter-spacing:1px; }
          .ats-body { padding:12px 6px; color:#374151; line-height:${c.lineHeight}; }

          .ats-list { margin:8px 0 0 0; padding-left:16px; }
          .ats-list li { margin-bottom:6px; }

          .ats-subtitle { font-weight:700; color:#111827; }
          .ats-meta { color:#6b7280; font-size:0.95rem; margin-top:4px; }

          @media print, (max-width:720px) { .ats-header h1 { font-size: 26px; } }
        </style>

        <div class="ats-page">
          <header class="ats-header">
            <h1>${pi.fullName || this.cvData.personalInfo.fullName || 'Your Name'}</h1>
            <div class="contact">${pi.phone || ''} ${pi.phone && pi.email ? ' | ' : ''} ${pi.email || ''} ${pi.location ? ' | ' + pi.location : ''}</div>
            ${pi.links && pi.links.length ? `<div class="ats-links">${pi.links.map((l:any)=>`<a class="ats-link" href="${l}" target="_blank">${l}</a>`).join('')}</div>` : ''}
          </header>

          ${this.cvData.professionalSummary ? `
            <section class="ats-section">
              <div class="title">ABOUT ME</div>
              <div class="ats-body">${this.cvData.professionalSummary}</div>
            </section>
          ` : ''}

          ${this.cvData.experiences && this.cvData.experiences.length ? `
            <section class="ats-section">
              <div class="title">PROFESSIONAL EXPERIENCE</div>
              <div class="ats-body">
                ${this.cvData.experiences.map((e:any)=>`
                  <div style="margin-bottom:10px;">
                    <div class="ats-subtitle">${e.jobTitle} ${e.company ? ' | ' + e.company : ''} ${e.startDate ? '| ' + e.startDate : ''} ${e.endDate ? '- ' + e.endDate : ''}</div>
                    ${e.responsibilities && e.responsibilities.length ? `<ul class="ats-list">${e.responsibilities.map((r:any)=>`<li>${r}</li>`).join('')}</ul>` : ''}
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          ${this.cvData.education && this.cvData.education.length ? `
            <section class="ats-section">
              <div class="title">EDUCATION</div>
              <div class="ats-body">
                ${this.cvData.education.map((ed:any)=>`
                  <div style="margin-bottom:10px;"><div class="ats-subtitle">${ed.degree} ${ed.institution ? '| ' + ed.institution : ''} ${ed.startDate ? '| ' + ed.startDate : ''} ${ed.endDate ? '- ' + ed.endDate : ''}</div>${ed.achievements && ed.achievements.length ? `<ul class="ats-list">${ed.achievements.map((a:any)=>`<li>${a}</li>`).join('')}</ul>` : ''}</div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          ${this.cvData.skills && this.cvData.skills.length ? `
            <section class="ats-section">
              <div class="title">SKILLS</div>
              <div class="ats-body">
                <div style="display:flex;flex-wrap:wrap;gap:10px;">
                  ${this.cvData.skills.map((s:any)=>`<div style="background:#f1f5f9;padding:6px 10px;border-radius:16px;font-size:0.92rem;">${s}</div>`).join('')}
                </div>
              </div>
            </section>
          ` : ''}

          ${this.cvData.languages && this.cvData.languages.length ? `
            <section class="ats-section">
              <div class="title">LANGUAGE</div>
              <div class="ats-body">${this.cvData.languages.map((l:any)=>typeof l === 'string' ? l : l.name).join(', ')}</div>
            </section>
          ` : ''}
        </div>
      </div>
    `;
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