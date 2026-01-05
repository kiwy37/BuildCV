import { Component, Input } from '@angular/core';
import { CVData } from '../../cv-data.model';
import { CustomizationSettings } from './lima-template.component';

@Component({
  selector: 'app-riga-template',
  template: '',
})
export class RigaTemplateComponent {
  @Input() cvData!: CVData;
  @Input() customization!: CustomizationSettings;

  generateTemplate(): string {
    const c = this.customization;
    const pi = this.cvData.personalInfo || ({} as any);

    return `
      <div class="cv-riga-container" style="${this.applyContainerStyles()}">
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
          .cv-riga-container { font-family: ${this.getFontStack(
            c.fontFamily
          )}; color: ${c.textColor}; }
          .riga-page { width: 100%; min-height: 1100px; display: flex; flex-direction: column; }

          /* strong navy top band */
          /* top band keeps background but name uses primary color */
          .riga-top { background: #1f2937; color: #fff; padding: 34px 24px 28px 24px; text-align: center; }
          .riga-top .small { color: #d6c39a; letter-spacing: 6px; font-size: 12px; margin-bottom: 6px; display:block; }
          .riga-top h1 { margin: 6px 0 6px 0; font-size: ${
            c.headingFontSize * 2
          }px; letter-spacing: 6px; text-transform:uppercase; color: ${
      c.primaryColor
    }; }
          .riga-top h2 { margin: 0; font-size: ${
            c.fontSize + 2
          }px; color: #b88c3a; font-weight:700; letter-spacing: 2px; }

          .riga-body { display:flex; }
          .riga-left { width: 34%; background: #f4f4f6; padding: 24px 28px 40px 28px; box-sizing: border-box; position: relative; }
          .riga-right { width: 66%; padding: 28px 44px 40px 44px; box-sizing: border-box; }

          /* avatar overlaps the top band */
          .riga-avatar { width: 140px; height: 140px; border-radius: 50%; overflow: hidden; margin: -70px auto 14px auto; border: 6px solid #fff; box-shadow: 0 6px 18px rgba(17,24,39,0.12); background:#e6e7ea }
          .riga-avatar img { width:100%; height:100%; object-fit:cover; display:block; }

          .left-section { padding-top: 8px; }
          .left-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:22px; }
          /* sidebar small headings use primary color (titles only) */
          .left-heading h4 { margin:0; text-transform:uppercase; letter-spacing:1px; color: ${
            c.primaryColor
          }; font-size:0.95rem; }
          .left-hr { height:1px; background:#d1d5db; margin-top:12px; }

          .edu-item { margin:12px 0; }
          /* degree/content should use textColor (not primary) */
          .edu-item .degree { font-weight:700; color: ${c.textColor}; }
          .edu-item .meta { color:#8b8f95; font-size:0.9rem; margin-top:6px; }

          .lang-item { margin:10px 0; }
          /* language labels (content) use textColor */
          .lang-label { font-size:0.9rem; color: ${
            c.textColor
          }; font-weight:600; margin-bottom:8px; }
          .lang-bar { height:8px; background:#e6e6e6; border-radius:999px; overflow:hidden; }
          .lang-fill { height:8px; background:#b88c3a; width:60%; }

          /* right column styling */
          /* section headings use primary color */
          .section-title { text-transform:uppercase; font-weight:700; letter-spacing:1px; color: ${
            c.primaryColor
          }; margin: 6px 0 12px 0; border-bottom:1px solid #e6e6e6; padding-bottom:8px; }

          .job { margin-bottom:18px; }
          .job h3 { margin: 0; font-size: ${
            c.fontSize * 1.05
          }px; color:#111827; }
          .job .company { color:#b88c3a; font-weight:700; margin-top:6px; }
          .job p { margin:8px 0 0 0; color:#4b5563; line-height:${
            c.lineHeight
          }; }

          .skills-grid { display:grid; grid-template-columns: repeat(2,1fr); gap:12px; margin-top:8px; }
          .skill-row { display:flex; align-items:center; gap:12px; }
          .skill-name { width:40%; font-weight:600; color:${c.textColor}; }
          .skill-meter { flex:1; height:8px; background:#e6e6e6; border-radius:999px; overflow:hidden; }
          .skill-meter .fill { height:8px; background:#b88c3a; width:70%; } /* fixed fill color */

          /* small print tweak for contact row */
          .contact-row { display:flex; gap:18px; justify-content:center; color:#c9cdd2; margin-top:8px; }

          @media print, (max-width:720px) {
            .riga-body { flex-direction:column; }
            .riga-left, .riga-right { width:100%; }
            .riga-top h1 { font-size: 26px; }
            .riga-avatar { margin-top:-56px; }
          }
        </style>

        <div class="cv-page">
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
                ${
                  pi.photoUrl
                    ? `<img src="${pi.photoUrl}" alt="avatar">`
                    : `<div style="width:100%;height:100%;"></div>`
                }
              </div>
              <div class="left-section">
                <div style="text-align:center;font-weight:700;color:#111827">${
                  pi.fullName || ''
                }</div>
                <div style="text-align:center;color:#8b8f95;margin-bottom:8px">${
                  pi.title || ''
                }</div>

                ${
                  this.cvData.education && this.cvData.education.length
                    ? `
                  <div>
                    <div class="left-heading"><h4>Education</h4></div>
                    <div class="left-hr"></div>
                    ${this.cvData.education
                      .map(
                        (ed: any) => `
                      <div class="edu-item"><div class="degree">${
                        ed.degree
                      }</div><div class="meta">${ed.institution} • ${
                          ed.endDate || ''
                        }</div></div>
                    `
                      )
                      .join('')}
                  </div>
                `
                    : ''
                }

                ${
                  this.cvData.languages && this.cvData.languages.length
                    ? `
                  <div>
                    <div class="left-heading"><h4>Languages</h4></div>
                    <div class="left-hr"></div>
                    ${this.cvData.languages
                      .map(
                        (l: any) => `
                      <div class="lang-item"><div class="lang-label">${
                        l.name || l
                      }</div><div class="lang-bar"><div class="lang-fill" style="width:${
                          l.levelPercent || 60
                        }%"></div></div></div>
                    `
                      )
                      .join('')}
                  </div>
                `
                    : ''
                }

                ${
                  this.cvData.skills && this.cvData.skills.length
                    ? `
                  <div>
                    <div class="left-heading"><h4>Skills</h4></div>
                    <div class="left-hr"></div>
                    <div class="skills-grid">
                      ${this.cvData.skills
                        .map((s: any) => `<div class="skill-tag">${s}</div>`)
                        .join('')}
                    </div>
                  </div>
                `
                    : ''
                }
              </div>
            </aside>

            <main class="riga-right">
              ${
                this.cvData.professionalSummary
                  ? `<div><div class="section-title">Profile</div><p style="color:#4b5563">${this.cvData.professionalSummary}</p></div>`
                  : ''
              }

              ${
                this.cvData.experiences && this.cvData.experiences.length
                  ? `
                <div>
                  <div class="section-title">Work Experience</div>
                  ${this.cvData.experiences
                    .map(
                      (e: any) => `
                    <div class="job"><h3>${
                      e.jobTitle
                    }</h3><div class="company">${e.company} ${
                        e.location ? ' • ' + e.location : ''
                      }</div>${
                        e.responsibilities && e.responsibilities.length
                          ? `<p>${e.responsibilities
                              .map((r: any) => `• ${r}`)
                              .join('<br>')}</p>`
                          : ''
                      }</div>
                  `
                    )
                    .join('')}
                </div>
              `
                  : ''
              }

              ${
                this.cvData.skills && this.cvData.skills.length
                  ? `
                <div>
                  <div class="section-title">Skills & Tools</div>
                  <div>
                    ${this.cvData.skills
                      .map(
                        (s: any) => `
                      <div class="skill-row"><div class="skill-name">${s}</div><div class="skill-meter"><div class="fill" style="width:70%"></div></div></div>
                    `
                      )
                      .join('')}
                  </div>
                </div>
              `
                  : ''
              }

              ${
                this.cvData.projects && this.cvData.projects.length
                  ? `
                <div>
                  <div class="section-title">Projects</div>
                  ${this.cvData.projects
                    .map(
                      (p: any) =>
                        `<div style="margin-bottom:10px;"><div style="font-weight:700">${
                          p.name
                        }</div><div style="color:#6b7280">${
                          p.description || ''
                        }</div></div>`
                    )
                    .join('')}
                </div>
              `
                  : ''
              }
            </main>
          </div>
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
        'https://fonts.googleapis.com/css2?family=Playfair+Display&wght@400;700&display=swap',
      Merriweather:
        'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap',
    };
    const url = map[fontFamily];
    return url ? `@import url('${url}');` : '';
  }
}
