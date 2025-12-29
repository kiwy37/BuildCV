import { Component, OnInit } from '@angular/core';
import { CvService } from '../cv.service';
import { CVData, CVTemplate, ValidationResult } from '../cv-data.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
  cvData!: CVData;
  templates: CVTemplate[] = [
    {
      id: 'modern',
      name: 'Modern Professional',
      description: 'Clean, ATS-friendly design',
      previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgZmlsbD0iI0VFRjJGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM0RjQ2RTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1vZGVybjwvdGV4dD48L3N2Zz4='
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional professional format',
      previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgZmlsbD0iI0Y5RkFGQiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNsYXNzaWM8L3RleHQ+PC9zdmc+'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean minimalist design',
      previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjRTVFN0VCIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjMUYyOTM3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NaW5pbWFsPC90ZXh0Pjwvc3ZnPg=='
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Stand out with style',
      previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgZmlsbD0iI0VDRkRGNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiMxMEI5ODEiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNyZWF0aXZlPC90ZXh0Pjwvc3ZnPg=='
    }
  ];
  selectedTemplateId: string = 'modern';
  previewHtml: SafeHtml = '';
  validationResult: ValidationResult | null = null;
  isLoading: boolean = false;

  constructor(
    private cvService: CvService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cvData = this.cvService.getCVData();
    this.validateCV();
    this.generatePreview();
  }

  selectTemplate(templateId: string): void {
    this.selectedTemplateId = templateId;
    this.generatePreview();
  }

  validateCV(): void {
    this.validationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!this.cvData.personalInfo.fullName) {
      this.validationResult.isValid = false;
      this.validationResult.errors.push('Full name is required');
    }
    if (!this.cvData.personalInfo.email) {
      this.validationResult.isValid = false;
      this.validationResult.errors.push('Email is required');
    }

    if (!this.cvData.professionalSummary) {
      this.validationResult.warnings.push('Consider adding a professional summary');
    }
    if (!this.cvData.experiences || this.cvData.experiences.length === 0) {
      this.validationResult.warnings.push('No work experience added');
    }
    if (!this.cvData.skills || this.cvData.skills.length === 0) {
      this.validationResult.warnings.push('Consider adding skills');
    }
  }

  generatePreview(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      const html = this.generateProfessionalHTML(this.cvData, this.selectedTemplateId);
      this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html);
      this.isLoading = false;
    }, 300);
  }

  private generateProfessionalHTML(data: CVData, templateId: string): string {
    switch(templateId) {
      case 'modern':
        return this.generateModernTemplate(data);
      case 'classic':
        return this.generateClassicTemplate(data);
      case 'minimal':
        return this.generateMinimalTemplate(data);
      case 'creative':
        return this.generateCreativeTemplate(data);
      default:
        return this.generateModernTemplate(data);
    }
  }

  private generateModernTemplate(data: CVData): string {
    return `
      <div class="cv-modern">
        <style>
          .cv-modern {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 850px;
            margin: 0 auto;
            background: white;
            padding: 0;
            color: #2d3748;
            line-height: 1.6;
          }
          .cv-modern .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 3rem 2rem;
            text-align: center;
          }
          .cv-modern .header h1 {
            font-size: 2.5rem;
            margin: 0 0 0.5rem;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .cv-modern .header .contact {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
            margin-top: 1rem;
            font-size: 0.95rem;
            opacity: 0.95;
          }
          .cv-modern .content {
            padding: 2.5rem 3rem;
          }
          .cv-modern .section {
            margin-bottom: 2.5rem;
          }
          .cv-modern .section-title {
            font-size: 1.4rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 3px solid #667eea;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .cv-modern .summary {
            font-size: 1.05rem;
            line-height: 1.8;
            color: #4a5568;
          }
          .cv-modern .item {
            margin-bottom: 2rem;
            position: relative;
            padding-left: 1.5rem;
            border-left: 2px solid #e2e8f0;
          }
          .cv-modern .item::before {
            content: '';
            position: absolute;
            left: -6px;
            top: 5px;
            width: 10px;
            height: 10px;
            background: #667eea;
            border-radius: 50%;
          }
          .cv-modern .item-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 0.25rem;
          }
          .cv-modern .item-subtitle {
            font-size: 1rem;
            color: #4a5568;
            font-weight: 500;
            margin-bottom: 0.25rem;
          }
          .cv-modern .item-date {
            font-size: 0.9rem;
            color: #718096;
            margin-bottom: 0.75rem;
          }
          .cv-modern ul {
            margin: 0.5rem 0 0 1.5rem;
            padding: 0;
          }
          .cv-modern li {
            margin-bottom: 0.4rem;
            color: #4a5568;
          }
          .cv-modern .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 0.75rem;
          }
          .cv-modern .skill-tag {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            text-align: center;
            font-weight: 500;
          }
        </style>
        
        <div class="header">
          <h1>${data.personalInfo.fullName || 'Your Name'}</h1>
          <div class="contact">
            ${data.personalInfo.email ? `<span>📧 ${data.personalInfo.email}</span>` : ''}
            ${data.personalInfo.phone ? `<span>📱 ${data.personalInfo.phone}</span>` : ''}
            ${data.personalInfo.location ? `<span>📍 ${data.personalInfo.location}</span>` : ''}
            ${data.personalInfo.linkedIn ? `<span>💼 ${data.personalInfo.linkedIn}</span>` : ''}
          </div>
        </div>
        
        <div class="content">
          ${data.professionalSummary ? `
            <div class="section">
              <div class="section-title">Professional Summary</div>
              <div class="summary">${data.professionalSummary}</div>
            </div>
          ` : ''}
          
          ${data.experiences && data.experiences.length > 0 ? `
            <div class="section">
              <div class="section-title">Experience</div>
              ${data.experiences.map(exp => `
                <div class="item">
                  <div class="item-title">${exp.jobTitle}</div>
                  <div class="item-subtitle">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
                  <div class="item-date">${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}</div>
                  ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                    <ul>
                      ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.education && data.education.length > 0 ? `
            <div class="section">
              <div class="section-title">Education</div>
              ${data.education.map(edu => `
                <div class="item">
                  <div class="item-title">${edu.degree}</div>
                  <div class="item-subtitle">${edu.institution}${edu.location ? ` • ${edu.location}` : ''}</div>
                  <div class="item-date">${edu.startDate} - ${edu.endDate}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
                  ${edu.achievements && edu.achievements.length > 0 ? `
                    <ul>
                      ${edu.achievements.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.skills && data.skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="skills-grid">
                ${data.skills.map(skill => `<div class="skill-tag">${skill}</div>`).join('')}
              </div>
            </div>
          ` : ''}
          
          ${data.projects && data.projects.length > 0 ? `
            <div class="section">
              <div class="section-title">Projects</div>
              ${data.projects.map(proj => `
                <div class="item">
                  <div class="item-title">${proj.name}</div>
                  <div class="summary" style="margin-bottom: 0.5rem;">${proj.description}</div>
                  ${proj.link ? `<div class="item-date">🔗 ${proj.link}</div>` : ''}
                  ${proj.technologies && proj.technologies.length > 0 ? `
                    <div class="skills-grid" style="margin-top: 0.75rem;">
                      ${proj.technologies.map(tech => `<div class="skill-tag">${tech}</div>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.certifications && data.certifications.length > 0 ? `
            <div class="section">
              <div class="section-title">Certifications</div>
              ${data.certifications.map(cert => `
                <div class="item">
                  <div class="item-title">${cert.name}</div>
                  <div class="item-subtitle">${cert.issuer}</div>
                  <div class="item-date">${cert.date}${cert.credentialId ? ` • ID: ${cert.credentialId}` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.languages && data.languages.length > 0 ? `
            <div class="section">
              <div class="section-title">Languages</div>
              <div class="skills-grid">
                ${data.languages.map(lang => `<div class="skill-tag">${lang}</div>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private generateClassicTemplate(data: CVData): string {
    return `
      <div class="cv-classic">
        <style>
          .cv-classic {
            font-family: 'Times New Roman', Times, serif;
            max-width: 850px;
            margin: 0 auto;
            background: white;
            padding: 2.5rem 3rem;
            color: #000;
            line-height: 1.5;
          }
          .cv-classic .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 1.5rem;
            margin-bottom: 2rem;
          }
          .cv-classic .header h1 {
            font-size: 2.2rem;
            margin: 0 0 0.5rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .cv-classic .header .contact {
            font-size: 0.95rem;
            margin-top: 0.75rem;
          }
          .cv-classic .section {
            margin-bottom: 2rem;
          }
          .cv-classic .section-title {
            font-size: 1.3rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #000;
            padding-bottom: 0.3rem;
            margin-bottom: 1rem;
          }
          .cv-classic .summary {
            font-size: 1rem;
            text-align: justify;
            margin-bottom: 1rem;
          }
          .cv-classic .item {
            margin-bottom: 1.5rem;
          }
          .cv-classic .item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.3rem;
          }
          .cv-classic .item-title {
            font-size: 1.1rem;
            font-weight: 700;
          }
          .cv-classic .item-date {
            font-size: 0.95rem;
            font-style: italic;
          }
          .cv-classic .item-subtitle {
            font-size: 1rem;
            font-style: italic;
            margin-bottom: 0.5rem;
          }
          .cv-classic ul {
            margin: 0.5rem 0 0 2rem;
            padding: 0;
          }
          .cv-classic li {
            margin-bottom: 0.3rem;
          }
          .cv-classic .skills-list {
            font-size: 1rem;
            line-height: 1.8;
          }
        </style>
        
        <div class="header">
          <h1>${data.personalInfo.fullName || 'YOUR NAME'}</h1>
          <div class="contact">
            ${data.personalInfo.email || ''} 
            ${data.personalInfo.phone ? ` • ${data.personalInfo.phone}` : ''}
            ${data.personalInfo.location ? ` • ${data.personalInfo.location}` : ''}
            ${data.personalInfo.linkedIn ? `<br/>${data.personalInfo.linkedIn}` : ''}
          </div>
        </div>
        
        ${data.professionalSummary ? `
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="summary">${data.professionalSummary}</div>
          </div>
        ` : ''}
        
        ${data.experiences && data.experiences.length > 0 ? `
          <div class="section">
            <div class="section-title">Professional Experience</div>
            ${data.experiences.map(exp => `
              <div class="item">
                <div class="item-header">
                  <div class="item-title">${exp.jobTitle}</div>
                  <div class="item-date">${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}</div>
                </div>
                <div class="item-subtitle">${exp.company}${exp.location ? `, ${exp.location}` : ''}</div>
                ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                  <ul>
                    ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.education && data.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${data.education.map(edu => `
              <div class="item">
                <div class="item-header">
                  <div class="item-title">${edu.degree}</div>
                  <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
                </div>
                <div class="item-subtitle">${edu.institution}${edu.location ? `, ${edu.location}` : ''}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
                ${edu.achievements && edu.achievements.length > 0 ? `
                  <ul>
                    ${edu.achievements.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.skills && data.skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-list">${data.skills.join(' • ')}</div>
          </div>
        ` : ''}
        
        ${data.projects && data.projects.length > 0 ? `
          <div class="section">
            <div class="section-title">Projects</div>
            ${data.projects.map(proj => `
              <div class="item">
                <div class="item-title">${proj.name}</div>
                <div class="summary">${proj.description}</div>
                ${proj.technologies && proj.technologies.length > 0 ? `
                  <div style="margin-top: 0.3rem;"><strong>Technologies:</strong> ${proj.technologies.join(', ')}</div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.certifications && data.certifications.length > 0 ? `
          <div class="section">
            <div class="section-title">Certifications</div>
            ${data.certifications.map(cert => `
              <div class="item">
                <div class="item-title">${cert.name}</div>
                <div class="item-subtitle">${cert.issuer} • ${cert.date}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.languages && data.languages.length > 0 ? `
          <div class="section">
            <div class="section-title">Languages</div>
            <div class="skills-list">${data.languages.join(' • ')}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateMinimalTemplate(data: CVData): string {
    return `
      <div class="cv-minimal">
        <style>
          .cv-minimal {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            max-width: 850px;
            margin: 0 auto;
            background: white;
            padding: 3rem 3rem;
            color: #1a1a1a;
            line-height: 1.7;
          }
          .cv-minimal .header {
            margin-bottom: 3rem;
          }
          .cv-minimal .header h1 {
            font-size: 3rem;
            margin: 0 0 0.5rem;
            font-weight: 300;
            letter-spacing: -1px;
            color: #000;
          }
          .cv-minimal .header .contact {
            font-size: 0.95rem;
            color: #666;
            font-weight: 300;
          }
          .cv-minimal .section {
            margin-bottom: 2.5rem;
          }
          .cv-minimal .section-title {
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #000;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e0e0e0;
          }
          .cv-minimal .summary {
            font-size: 1rem;
            color: #333;
            font-weight: 300;
          }
          .cv-minimal .item {
            margin-bottom: 2rem;
          }
          .cv-minimal .item-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.3rem;
          }
          .cv-minimal .item-title {
            font-size: 1.1rem;
            font-weight: 500;
            color: #000;
          }
          .cv-minimal .item-date {
            font-size: 0.85rem;
            color: #999;
            font-weight: 300;
          }
          .cv-minimal .item-subtitle {
            font-size: 0.95rem;
            color: #666;
            margin-bottom: 0.5rem;
            font-weight: 400;
          }
          .cv-minimal ul {
            margin: 0.5rem 0 0 1.5rem;
            padding: 0;
            list-style: none;
          }
          .cv-minimal li {
            margin-bottom: 0.4rem;
            color: #444;
            position: relative;
            padding-left: 1rem;
          }
          .cv-minimal li::before {
            content: '—';
            position: absolute;
            left: 0;
            color: #ccc;
          }
          .cv-minimal .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
          }
          .cv-minimal .skill-tag {
            background: #f5f5f5;
            color: #333;
            padding: 0.4rem 1rem;
            border-radius: 3px;
            font-size: 0.85rem;
            font-weight: 400;
            border: 1px solid #e0e0e0;
          }
        </style>
        
        <div class="header">
          <h1>${data.personalInfo.fullName || 'Your Name'}</h1>
          <div class="contact">
            ${data.personalInfo.email || ''} 
            ${data.personalInfo.phone ? ` / ${data.personalInfo.phone}` : ''}
            ${data.personalInfo.location ? ` / ${data.personalInfo.location}` : ''}
            ${data.personalInfo.linkedIn ? ` / ${data.personalInfo.linkedIn}` : ''}
          </div>
        </div>
        
        ${data.professionalSummary ? `
          <div class="section">
            <div class="section-title">About</div>
            <div class="summary">${data.professionalSummary}</div>
          </div>
        ` : ''}
        
        ${data.experiences && data.experiences.length > 0 ? `
          <div class="section">
            <div class="section-title">Experience</div>
            ${data.experiences.map(exp => `
              <div class="item">
                <div class="item-header">
                  <div class="item-title">${exp.jobTitle}</div>
                  <div class="item-date">${exp.startDate} — ${exp.isCurrent ? 'Present' : exp.endDate}</div>
                </div>
                <div class="item-subtitle">${exp.company}${exp.location ? ` / ${exp.location}` : ''}</div>
                ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                  <ul>
                    ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.education && data.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${data.education.map(edu => `
              <div class="item">
                <div class="item-header">
                  <div class="item-title">${edu.degree}</div>
                  <div class="item-date">${edu.startDate} — ${edu.endDate}</div>
                </div>
                <div class="item-subtitle">${edu.institution}${edu.location ? ` / ${edu.location}` : ''}${edu.gpa ? ` / GPA: ${edu.gpa}` : ''}</div>
                ${edu.achievements && edu.achievements.length > 0 ? `
                  <ul>
                    ${edu.achievements.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.skills && data.skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-grid">
              ${data.skills.map(skill => `<div class="skill-tag">${skill}</div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateCreativeTemplate(data: CVData): string {
    return `
      <div class="cv-creative">
        <style>
          .cv-creative {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            background: white;
            color: #2d3748;
            display: grid;
            grid-template-columns: 300px 1fr;
            min-height: 100vh;
          }
          .cv-creative .sidebar {
            background: linear-gradient(180deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 3rem 2rem;
          }
          .cv-creative .sidebar h1 {
            font-size: 2rem;
            margin: 0 0 0.5rem;
            font-weight: 700;
          }
          .cv-creative .sidebar .contact-item {
            margin-bottom: 1rem;
            font-size: 0.9rem;
            opacity: 0.95;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .cv-creative .sidebar .section {
            margin-top: 2.5rem;
          }
          .cv-creative .sidebar .section-title {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid rgba(255,255,255,0.3);
            padding-bottom: 0.5rem;
          }
          .cv-creative .sidebar .skill-item {
            background: rgba(255,255,255,0.2);
            padding: 0.5rem 0.75rem;
            border-radius: 5px;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }
          .cv-creative .main {
            padding: 3rem 2.5rem;
          }
          .cv-creative .main .section {
            margin-bottom: 2.5rem;
          }
          .cv-creative .main .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #10b981;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .cv-creative .main .summary {
            font-size: 1.05rem;
            line-height: 1.8;
            color: #4a5568;
          }
          .cv-creative .main .item {
            margin-bottom: 2rem;
            padding-left: 1.5rem;
            border-left: 3px solid #10b981;
          }
          .cv-creative .main .item-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 0.25rem;
          }
          .cv-creative .main .item-subtitle {
            font-size: 1rem;
            color: #4a5568;
            font-weight: 500;
            margin-bottom: 0.25rem;
          }
          .cv-creative .main .item-date {
            font-size: 0.9rem;
            color: #718096;
            margin-bottom: 0.75rem;
          }
          .cv-creative .main ul {
            margin: 0.5rem 0 0 1.5rem;
            padding: 0;
          }
          .cv-creative .main li {
            margin-bottom: 0.4rem;
            color: #4a5568;
          }
        </style>
        
        <div class="sidebar">
          <h1>${data.personalInfo.fullName || 'Your Name'}</h1>
          
          <div class="section">
            <div class="section-title">Contact</div>
            ${data.personalInfo.email ? `<div class="contact-item">📧 ${data.personalInfo.email}</div>` : ''}
            ${data.personalInfo.phone ? `<div class="contact-item">📱 ${data.personalInfo.phone}</div>` : ''}
            ${data.personalInfo.location ? `<div class="contact-item">📍 ${data.personalInfo.location}</div>` : ''}
            ${data.personalInfo.linkedIn ? `<div class="contact-item">💼 ${data.personalInfo.linkedIn}</div>` : ''}
          </div>
          
          ${data.skills && data.skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Skills</div>
              ${data.skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
            </div>
          ` : ''}
          
          ${data.languages && data.languages.length > 0 ? `
            <div class="section">
              <div class="section-title">Languages</div>
              ${data.languages.map(lang => `<div class="skill-item">${lang}</div>`).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="main">
          ${data.professionalSummary ? `
            <div class="section">
              <div class="section-title">Profile</div>
              <div class="summary">${data.professionalSummary}</div>
            </div>
          ` : ''}
          
          ${data.experiences && data.experiences.length > 0 ? `
            <div class="section">
              <div class="section-title">Experience</div>
              ${data.experiences.map(exp => `
                <div class="item">
                  <div class="item-title">${exp.jobTitle}</div>
                  <div class="item-subtitle">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
                  <div class="item-date">${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}</div>
                  ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                    <ul>
                      ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.education && data.education.length > 0 ? `
            <div class="section">
              <div class="section-title">Education</div>
              ${data.education.map(edu => `
                <div class="item">
                  <div class="item-title">${edu.degree}</div>
                  <div class="item-subtitle">${edu.institution}${edu.location ? ` • ${edu.location}` : ''}</div>
                  <div class="item-date">${edu.startDate} - ${edu.endDate}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.projects && data.projects.length > 0 ? `
            <div class="section">
              <div class="section-title">Projects</div>
              ${data.projects.map(proj => `
                <div class="item">
                  <div class="item-title">${proj.name}</div>
                  <div class="summary" style="margin-bottom: 0.5rem;">${proj.description}</div>
                  ${proj.technologies && proj.technologies.length > 0 ? `
                    <div style="margin-top: 0.5rem;">
                      ${proj.technologies.map(tech => `<span style="background: #e6f7f0; color: #10b981; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.85rem; margin-right: 0.5rem; display: inline-block; margin-bottom: 0.25rem;">${tech}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  downloadPDF(): void {
    // Create a printable window with the CV content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this site to download PDF');
      return;
    }

    const cvContent = this.generateProfessionalHTML(this.cvData, this.selectedTemplateId);
    
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
          }
        </style>
      </head>
      <body>
        ${cvContent}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  }

  downloadWord(): void {
    alert('To download as Word document, please save the PDF and convert it online, or use "Save as PDF" from your browser\'s print dialog (Ctrl+P / Cmd+P).');
  }

  goToStep(step: number): void {
    this.cvService.setCurrentStep(step);
  }
}