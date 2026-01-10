// ats-template.component.ts
import { Component, Input } from '@angular/core';
import { CVData } from '../../../cv-data.model';
import { CustomizationSettings } from '../lima-template/lima-template.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ats-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ats-template.component.clean.html',
  styleUrls: ['./ats-template.component.css'],
})
export class ATSTemplateComponent {
  @Input() cvData!: CVData;
  @Input() customization!: CustomizationSettings;

  get personalInfo() {
    return this.cvData?.personalInfo || {};
  }

  get headline(): string {
    const pi: any = this.personalInfo;
    const parts = [pi.title, pi.profession]
      .map((v: any) => (typeof v === 'string' ? v.trim() : ''))
      .filter((v: string) => v.length > 0);
    return parts.join(' • ');
  }

  get allLinks(): string[] {
    const pi: any = this.personalInfo;
    const raw: string[] = [];

    const add = (value: any) => {
      if (typeof value !== 'string') return;
      const trimmed = value.trim();
      if (!trimmed) return;
      raw.push(trimmed);
    };

    add(pi.website);
    add(pi.linkedIn);

    if (Array.isArray(pi.links)) {
      pi.links.forEach(add);
    }

    return Array.from(new Set(raw));
  }

  formatDateRange(start?: string, end?: string, isCurrent?: boolean): string {
    const startValue = (start || '').trim();
    const endValue = (end || '').trim();
    if (!startValue && !endValue && !isCurrent) return '';
    if (startValue && (isCurrent || !endValue)) return `${startValue} – Present`;
    if (startValue && endValue) return `${startValue} – ${endValue}`;
    return startValue || endValue;
  }

  getSkillName(skill: any): string {
    if (typeof skill === 'string') return skill;
    return skill.name || skill.skill || '';
  }

  private toLevelNumber(level: any): number | null {
    const n = typeof level === 'string' ? Number(level.trim()) : Number(level);
    if (!isFinite(n)) return null;
    const rounded = Math.round(n);
    if (rounded <= 0) return null;
    return rounded;
  }

  getSkillLevelLabel(skill: any): string {
    const level = this.toLevelNumber(skill?.level);
    if (!level) return '';
    // Keep it ATS-friendly: short, common words.
    switch (level) {
      case 1:
        return 'Beginner';
      case 2:
        return 'Basic';
      case 3:
        return 'Intermediate';
      case 4:
        return 'Advanced';
      case 5:
        return 'Expert';
      default:
        // For values outside 1-5, still show something meaningful.
        return level >= 6 ? 'Expert' : '';
    }
  }

  getLanguageName(lang: any): string {
    return typeof lang === 'string' ? lang : lang.name || '';
  }

  getLanguageLevelLabel(lang: any): string {
    const level = this.toLevelNumber(lang?.level);
    if (!level) return '';
    switch (level) {
      case 1:
        return 'Basic';
      case 2:
        return 'Conversational';
      case 3:
        return 'Professional';
      case 4:
        return 'Fluent';
      case 5:
        return 'Native';
      default:
        return level >= 6 ? 'Native' : '';
    }
  }

  getContainerStyles(): any {
    const c = this.customization;
    return {
      'box-sizing': 'border-box',
      'font-family': this.getFontFamily(),
      color: c.textColor,
      'font-size': `${c.fontSize}px`,
      'line-height': `${c.lineHeight}`,
      /* Apply page margins as padding so DOM preview matches generated PDF spacing */
      'padding-top': `${c.marginTop ?? 0}px`,
      'padding-bottom': `${c.marginTop ?? 0}px`,
      'padding-left': `${c.marginLeft ?? 0}px`,
      'padding-right': `${c.marginLeft ?? 0}px`,
    };
  }

  getHeaderNameStyles(): any {
    return {
      margin: '0',
      'font-size': `${this.customization.headingFontSize * 1.6}px`,
      'font-weight': '700',
      'letter-spacing': '2px',
      color: this.customization.primaryColor,
    };
  }

  getSectionTitleStyles(): any {
    const c = this.customization;
    const titleFontSize = Math.max(12, Math.round(c.headingFontSize * 0.55));
    const themeBg = c.atsThemeColor || c.sectionBgColor || 'transparent';

    return {
      background: themeBg,
      color: c.primaryColor,
      padding: themeBg !== 'transparent' ? '6px 10px' : '0 0 6px 0',
      'border-radius': themeBg !== 'transparent' ? '6px' : '0',
      'font-weight': '800',
      'text-align': 'left',
      'letter-spacing': '0.08em',
      'text-transform': 'uppercase',
      'font-size': `${titleFontSize}px`,
      'border-bottom': themeBg !== 'transparent'
        ? `1px solid ${c.borderColor || '#e5e7eb'}`
        : `2px solid ${c.primaryColor}`,
    };
  }

  getFontFamily(): string {
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
    return fonts[this.customization.fontFamily] || fonts['Roboto'];
  }

  getGoogleFontUrl(): string {
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
    return map[this.customization.fontFamily] || map['Roboto'];
  }
}
