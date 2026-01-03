import { Component, Input } from '@angular/core';
import { CVData } from '../../cv-data.model';
import { CustomizationSettings } from './lima-template.component';

@Component({
  selector: 'app-rotterdam-template',
  template: ''
})
export class RotterdamTemplateComponent {
  @Input() cvData!: CVData;
  @Input() customization!: CustomizationSettings;

  generateTemplate(): string {
    const c = this.customization;
    const pi = this.cvData.personalInfo;
    const sidebarBg = '#d9ccc4';
    const headerBg = '#3a3a3a';

    return `
    <div class="cv-rotterdam-container" style="font-family: ${this.getFontStack(c.fontFamily)}; color: ${c.textColor}; font-size: ${c.fontSize}px; line-height: ${c.lineHeight}; text-align: left;">
      <style>
        @page { size: A4; margin: 0; }
        .cv-page { width: 210mm; height: 297mm; box-sizing: border-box; }
        @media print { .cv-page { page-break-after: always; } .cv-page:last-child { page-break-after: auto; } }
      </style>
      <div class="cv-page">
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
}
