import { Component, Input } from '@angular/core';
import { CVData } from '../../cv-data.model';
import { CustomizationSettings } from './lima-template.component';

@Component({
  selector: 'app-ats-template',
  template: '',
})
export class ATSTemplateComponent {
  @Input() cvData!: CVData;
  @Input() customization!: CustomizationSettings;

  generateTemplate(): string {
    const c = this.customization;
    const pi = this.cvData.personalInfo || ({} as any);

    return `
      <div class="cv-ats-container" style="${this.applyContainerStyles()}">
        <style>
@page {
  size: A4;
  margin: 0;
}

.cv-page {
  width: 210mm;
  min-height: 297mm;
  box-sizing: border-box;
  background: white;
}
 @media print { .cv-page { page-break-after: always; } .cv-page:last-child { page-break-after: auto; } }
          ${this.getGoogleFontImport(c.fontFamily)}
          .cv-ats-container { font-family: ${this.getFontStack(
            c.fontFamily
          )}; color: ${c.textColor}; }
          .ats-page { width: 100%; min-height: 1100px; padding: 24px; box-sizing: border-box; }

          .ats-header { text-align: center; margin-bottom: 8px; }
          /* Name and section titles use primary color */
          .ats-header h1 { margin: 0; font-size: ${
            c.headingFontSize * 1.6
          }px; font-weight:700; letter-spacing:2px; color: ${c.primaryColor}; }
          .ats-header .contact { color: #374151; font-size: ${
            c.fontSize - 1
          }px; margin-top:8px; }
          .ats-links { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:10px; }
          .ats-link { background:#f1f5f9; color:#1f2937; padding:6px 10px; border-radius:6px; font-size:0.9rem; text-decoration:none; }

          .ats-section { margin-top:18px; }
          .ats-section .title { display:block; background:#eef6ff; color: ${
            c.primaryColor
          }; padding:8px 12px; border-radius:6px; font-weight:700; text-align:center; letter-spacing:1px; }
          .ats-body { padding:12px 6px; color:#374151; line-height:${
            c.lineHeight
          }; }

          .ats-list { margin:8px 0 0 0; padding-left:16px; }
          .ats-list li { margin-bottom:6px; }

          .ats-subtitle { font-weight:700; color:#111827; }
          .ats-meta { color:#6b7280; font-size:0.95rem; margin-top:4px; }

          @media print, (max-width:720px) { .ats-header h1 { font-size: 26px; } }
        </style>

        <div class="cv-page">
        <div class="ats-page">
          <header class="ats-header">
            <h1>${
              pi.fullName || this.cvData.personalInfo.fullName || 'Your Name'
            }</h1>
            <div class="contact">${pi.phone || ''} ${
      pi.phone && pi.email ? ' | ' : ''
    } ${pi.email || ''} ${pi.location ? ' | ' + pi.location : ''}</div>
            ${
              pi.links && pi.links.length
                ? `<div class="ats-links">${pi.links
                    .map(
                      (l: any) =>
                        `<a class="ats-link" href="${l}" target="_blank">${l}</a>`
                    )
                    .join('')}</div>`
                : ''
            }
          </header>

          ${
            this.cvData.professionalSummary
              ? `
            <section class="ats-section">
              <div class="title">ABOUT ME</div>
              <div class="ats-body">${this.cvData.professionalSummary}</div>
            </section>
          `
              : ''
          }

          ${
            this.cvData.experiences && this.cvData.experiences.length
              ? `
            <section class="ats-section">
              <div class="title">PROFESSIONAL EXPERIENCE</div>
              <div class="ats-body">
                ${this.cvData.experiences
                  .map(
                    (e: any) => `
                  <div style="margin-bottom:10px;">
                    <div class="ats-subtitle">${e.jobTitle} ${
                      e.company ? ' | ' + e.company : ''
                    } ${e.startDate ? '| ' + e.startDate : ''} ${
                      e.endDate ? '- ' + e.endDate : ''
                    }</div>
                    ${
                      e.responsibilities && e.responsibilities.length
                        ? `<ul class="ats-list">${e.responsibilities
                            .map((r: any) => `<li>${r}</li>`)
                            .join('')}</ul>`
                        : ''
                    }
                  </div>
                `
                  )
                  .join('')}
              </div>
            </section>
          `
              : ''
          }

          ${
            this.cvData.education && this.cvData.education.length
              ? `
            <section class="ats-section">
              <div class="title">EDUCATION</div>
              <div class="ats-body">
                ${this.cvData.education
                  .map(
                    (ed: any) => `
                  <div style="margin-bottom:10px;"><div class="ats-subtitle">${
                    ed.degree
                  } ${ed.institution ? '| ' + ed.institution : ''} ${
                      ed.startDate ? '| ' + ed.startDate : ''
                    } ${ed.endDate ? '- ' + ed.endDate : ''}</div>${
                      ed.achievements && ed.achievements.length
                        ? `<ul class="ats-list">${ed.achievements
                            .map((a: any) => `<li>${a}</li>`)
                            .join('')}</ul>`
                        : ''
                    }</div>
                `
                  )
                  .join('')}
              </div>
            </section>
          `
              : ''
          }

          ${
            this.cvData.skills && this.cvData.skills.length
              ? `
            <section class="ats-section">
              <div class="title">SKILLS</div>
              <div class="ats-body">
                <div style="display:flex;flex-wrap:wrap;gap:10px;">
                  ${this.cvData.skills
                    .map(
                      (s: any) =>
                        `<div style="background:#f1f5f9;padding:6px 10px;border-radius:16px;font-size:0.92rem;">${s}</div>`
                    )
                    .join('')}
                </div>
              </div>
            </section>
          `
              : ''
          }

          ${
            this.cvData.languages && this.cvData.languages.length
              ? `
            <section class="ats-section">
              <div class="title">LANGUAGE</div>
              <div class="ats-body">${this.cvData.languages
                .map((l: any) => (typeof l === 'string' ? l : l.name))
                .join(', ')}</div>
            </section>
          `
              : ''
          }
        </div>
        </div>
    `;
  }

  private applyContainerStyles(): string {
    const c = this.customization;
    const maxWidth = 794;
    return `
      padding: ${c.paddingTop + c.marginTop}px ${
      c.paddingRight + c.marginRight
    }px ${c.paddingBottom + c.marginBottom}px ${
      c.paddingLeft + c.marginLeft
    }px !important;
      max-width: ${maxWidth}px;
      margin-left: auto;
      margin-right: auto;
    `;
  }

  private getFontStack(fontFamily: string): string {
    const fonts: { [key: string]: string } = {
      Roboto: "'Roboto', sans-serif",
      Lato: "'Lato', sans-serif",
      Montserrat: "'Montserrat', sans-serif",
      'Open Sans': "'Open Sans', sans-serif",
      Raleway: "'Raleway', sans-serif",
      Caladea: "'Caladea', serif",
      Lora: "'Lora', serif",
      'Roboto Slab': "'Roboto Slab', serif",
      'Playfair Display': "'Playfair Display', serif",
      Merriweather: "'Merriweather', serif",
    };
    return fonts[fontFamily] || fonts['Roboto'];
  }

  private getGoogleFontImport(fontFamily: string): string {
    const map: { [key: string]: string } = {
      Roboto:
        'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap',
      Lato: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
      Montserrat:
        'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap',
      'Open Sans':
        'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&display=swap',
      Raleway:
        'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;700&display=swap',
      Caladea: 'https://fonts.googleapis.com/css2?family=Caladea&display=swap',
      Lora: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
      'Roboto Slab':
        'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;700&display=swap',
      'Playfair Display':
        'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
      Merriweather:
        'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap',
    };
    const url = map[fontFamily];
    return url ? `@import url('${url}');` : '';
  }
}
