import { Component, Input } from '@angular/core';
import { CVData } from '../../cv-data.model';

export interface CustomizationSettings {
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
  borderColor?: string;
  headingColor?: string;
  sectionBgColor?: string;
  headingFontSize: number;
  sectionSpacing: number;
  fontFamily: string;
}

@Component({
  selector: 'app-lima-template',
  template: '',
})
export class LimaTemplateComponent {
  @Input() cvData!: CVData;
  @Input() customization!: CustomizationSettings;

  generateTemplate(): string {
    const c = this.customization;
    const pi = this.cvData.personalInfo || ({} as any);
    return `
      <div class="cv-lima-container" style="${this.applyContainerStyles()}">
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
          .cv-lima-container { font-family: ${this.getFontStack(
            c.fontFamily
          )}; color: ${c.textColor}; }
          .lima-wrap { display: flex; width: 100%; min-height: 1100px; }
          .lima-sidebar { width: 33%; background: #1a2a3a; color: #ffffff; padding: 40px 28px; box-sizing: border-box; display: flex; flex-direction: column; gap: 18px; }
          .lima-profile { display: flex; flex-direction: column; align-items: center; gap: 10px; }
          .lima-avatar { width: 130px; height: 130px; border-radius: 50%; overflow: hidden; background: #e5e7eb; border: 4px solid #ffffff; box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
          .lima-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
          /* Sidebar name uses primary color so it updates with customization */
          .lima-name { color: ${
            c.primaryColor
          }; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-size: 20px; }
          .lima-title { color: ${
            c.textColor
          }; margin-top: 2px; font-size: 13px; }

          .sidebar-section { margin-top: 12px; }
          /* Use primaryColor for small section headings in sidebar, and textColor for content */
          .sidebar-section h4 { color: ${
            c.primaryColor
          }; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom:8px; }
          .sidebar-text { color: ${c.textColor}; font-size: ${
      c.fontSize - 1
    }px; line-height: ${c.lineHeight}; }

          .contact-row { display:flex; flex-direction:column; gap:8px; margin-top:4px; }
          .contact-item { display:flex; gap:10px; align-items:center; color: #d1d5db; font-size: ${
            c.fontSize - 1
          }px; }
          .contact-icon { width:18px; height:18px; display:inline-block; flex-shrink:0; opacity:0.95; }

          .lima-main { width: 67%; padding: 48px 44px; box-sizing: border-box; display: flex; flex-direction: column; background: #ffffff; }
          .lm-header { display:flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
          .lm-title { color: ${c.textColor}; }
          /* Main name/title use primary color */
          .lm-title h1 { color: ${c.primaryColor}; margin: 0; font-size: ${
      c.headingFontSize * 1.4
    }px; letter-spacing: 1px; text-transform: uppercase; font-weight:800; }
          .lm-title h2 { margin: 8px 0 0 0; color: ${
            c.primaryColor
          }; font-size: ${
      c.headingFontSize - 4
    }px; font-weight:700; text-transform: none; }
          .lm-contact { text-align: right; color: ${
            c.textColor
          }; opacity: 0.8; font-size: ${c.fontSize}px; }

          .lm-body { margin-top: 22px; display: flex; flex-direction: column; gap: 22px; }
          /* Section titles should use primary color */
          .section-title { text-transform: uppercase; font-weight:700; letter-spacing: 1px; color: ${
            c.primaryColor
          }; margin-bottom:8px; padding-bottom:6px; border-bottom:2px solid ${
      c.primaryColor
    }; }

          /* Experience two-column layout with subtle divider */
          .experience-item { display: grid; grid-template-columns: 24% 1fr; gap: 18px; align-items: start; padding: 14px 0; border-top: 1px solid #f1f5f9; }
          .exp-left { color: ${c.textColor}; opacity: 0.75; font-size: ${
      c.fontSize - 1
    }px; }
          .exp-right h3 { margin: 0; font-size: ${
            c.fontSize * 1.05
          }px; color: ${c.textColor}; font-weight:700; }
          .exp-right ul { margin: 8px 0 0 0; padding-left: 18px; }

          .education-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

          /* Skills as progress bars */
          .skill-row { display:flex; flex-direction:column; gap:6px; }
          .skill-name { font-weight:700; color:#374151; font-size: ${
            c.fontSize - 1
          }px; }
          /* keep skill fill color fixed (do not change with primaryColor) */
          .skill-fill { height:8px; background: #b88c3a; width:60%; }

          .hobby-list { display:flex; gap:8px; flex-wrap:wrap; }
          .hobby { background:#f3f4f6; padding:6px 10px; border-radius:999px; font-size:0.85rem; color:#374151; }

          .lm-body p, .lm-body li { color: ${c.textColor}; font-size: ${
      c.fontSize
    }px; line-height: ${c.lineHeight}; }
        </style>

        <div class="cv-page">
        <div class="lima-wrap">
          <aside class="lima-sidebar">
            <div class="lima-profile">
              <div class="lima-avatar">
                ${
                  pi.photoUrl
                    ? `<img src="${pi.photoUrl}" alt="avatar">`
                    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#2c3e50,#3b5566);"></div>`
                }
              </div>
              <div class="lima-name">${(
                pi.fullName || 'Your Name'
              ).toUpperCase()}</div>
              <div class="lima-title">${pi.title || pi.profession || ''}</div>
            </div>

            ${
              pi.email || pi.phone || pi.location || pi.linkedIn || pi.website
                ? `
              <div class="sidebar-section">
                <h4>Contact</h4>
                <div class="contact-row">
                  ${
                    pi.phone
                      ? `<div class="contact-item"><span class="contact-icon">📞</span><span class="sidebar-text">${pi.phone}</span></div>`
                      : ''
                  }
                  ${
                    pi.email
                      ? `<div class="contact-item"><span class="contact-icon">✉️</span><span class="sidebar-text">${pi.email}</span></div>`
                      : ''
                  }
                  ${
                    pi.location
                      ? `<div class="contact-item"><span class="contact-icon">📍</span><span class="sidebar-text">${pi.location}</span></div>`
                      : ''
                  }
                  ${
                    pi.linkedIn
                      ? `<div class="contact-item"><span class="contact-icon">🔗</span><a class="sidebar-text" href="${pi.linkedIn}" target="_blank" style="color:inherit;text-decoration:none">LinkedIn</a></div>`
                      : ''
                  }
                  ${
                    pi.website
                      ? `<div class="contact-item"><span class="contact-icon">🔗</span><a class="sidebar-text" href="${pi.website}" target="_blank" style="color:inherit;text-decoration:none">Website</a></div>`
                      : ''
                  }
                </div>
              </div>
            `
                : ''
            }

            ${
              this.cvData.professionalSummary
                ? `
              <div class="sidebar-section">
                <h4>About</h4>
                <div class="sidebar-text">${this.cvData.professionalSummary}</div>
              </div>
            `
                : ''
            }

            ${
              this.cvData.skills && this.cvData.skills.length
                ? `
              <div class="sidebar-section">
                <h4>Skills</h4>
                <div>
                  ${this.cvData.skills
                    .map((s: any) => {
                      const name =
                        typeof s === 'string' ? s : s.name || s.skill || '';
                      const pct =
                        typeof s === 'object'
                          ? s.levelPercent || s.level || 60
                          : 60;
                      return `<div style="margin-bottom:10px;"><div class="skill-name">${name}</div><div class="skill-bar"><div class="skill-fill" style="width:${pct}%; background:#b88c3a;"></div></div></div>`;
                    })
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            ${
              this.cvData.languages && this.cvData.languages.length
                ? `
              <div class="sidebar-section" style="margin-top:auto">
                <h4>Languages</h4>
                <div>
                  ${this.cvData.languages
                    .map((l: any) => {
                      const label = typeof l === 'string' ? l : l.name || '';
                      const pct =
                        typeof l === 'object'
                          ? l.levelPercent || l.level || 60
                          : 60;
                      return `<div style="margin-bottom:10px;"><div style="font-weight:700;color:#ffffff;opacity:0.95;font-size:${
                        c.fontSize - 1
                      }px">${label}</div><div style="height:8px;background:rgba(255,255,255,0.12);border-radius:999px;overflow:hidden"><div style="height:8px;background:#b88c3a;width:${pct}%"></div></div></div>`;
                    })
                    .join('')}
                </div>
              </div>
            `
                : ''
            }
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
              ${
                this.cvData.experiences && this.cvData.experiences.length
                  ? `
                <section>
                  <div class="section-title">Work Experience</div>
                  ${this.cvData.experiences
                    .map(
                      (e: any) => `
                    <div class="experience-item">
                      <div class="exp-left">
                        <div style="font-weight:700">${e.company}</div>
                        <div>${e.location || ''}</div>
                        <div style="margin-top:6px;opacity:0.8">${
                          e.startDate
                        } - ${e.isCurrent ? 'Present' : e.endDate}</div>
                      </div>
                      <div class="exp-right">
                        <h3>${e.jobTitle}</h3>
                        ${
                          e.responsibilities && e.responsibilities.length
                            ? `<ul>${e.responsibilities
                                .map((r: any) => `<li>${r}</li>`)
                                .join('')}</ul>`
                            : ''
                        }
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </section>
              `
                  : ''
              }

              ${
                this.cvData.education && this.cvData.education.length
                  ? `
                <section>
                  <div class="section-title">Education</div>
                  <div class="education-grid">
                    ${this.cvData.education
                      .map(
                        (ed: any) => `
                      <div>
                        <div style="font-weight:700">${ed.institution}</div>
                        <div style="opacity:0.8">${ed.degree} • ${ed.startDate} - ${ed.endDate}</div>
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
                this.cvData.skills && this.cvData.skills.length
                  ? `
                <section>
                  <div class="section-title">Skills</div>
                  <div>
                    ${this.cvData.skills
                      .map((s: any) => {
                        const name =
                          typeof s === 'string' ? s : s.name || s.skill || '';
                        const pct =
                          typeof s === 'object'
                            ? s.levelPercent || s.level || 60
                            : 60;
                        return `<div style="margin-bottom:12px;"><div style="font-weight:700;color:${c.textColor};margin-bottom:6px">${name}</div><div style="height:8px;background:#e6e6e6;border-radius:999px;overflow:hidden"><div style="height:8px;background:#b88c3a;width:${pct}%"></div></div></div>`;
                      })
                      .join('')}
                  </div>
                </section>
              `
                  : ''
              }

              ${
                this.cvData.hobbies && this.cvData.hobbies.length
                  ? `
                <section>
                  <div class="section-title">Hobbies</div>
                  <div class="hobby-list">
                    ${this.cvData.hobbies
                      .map((h: any) => `<div class="hobby">${h}</div>`)
                      .join('')}
                  </div>
                </section>
              `
                  : ''
              }
            </div>
          </main>
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
