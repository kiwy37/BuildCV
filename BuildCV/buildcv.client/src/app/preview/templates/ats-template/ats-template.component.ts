// ats-template.component.ts
import { Component, Input } from '@angular/core';
import { CVData } from '../../../cv-data.model';
import { CustomizationSettings } from '../lima-template/lima-template.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ats-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ats-template.component.html',
  styleUrls: ['./ats-template.component.css'],
})
export class ATSTemplateComponent {
  @Input() cvData!: CVData;
  @Input() customization!: CustomizationSettings;

  get personalInfo() {
    return this.cvData?.personalInfo || {};
  }

  getSkillName(skill: any): string {
    if (typeof skill === 'string') return skill;
    return skill.name || skill.skill || '';
  }

  getLanguageName(lang: any): string {
    return typeof lang === 'string' ? lang : lang.name || '';
  }

  getContainerStyles(): any {
    const c = this.customization;
    return {
      'padding-top': `${c.paddingTop + c.marginTop}px`,
      'padding-right': `${c.paddingRight + c.marginRight}px`,
      'padding-bottom': `${c.paddingBottom + c.marginBottom}px`,
      'padding-left': `${c.paddingLeft + c.marginLeft}px`,
      'max-width': '794px',
      'margin-left': 'auto',
      'margin-right': 'auto',
      'font-family': this.getFontFamily(),
      color: c.textColor,
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
    return {
      background: '#eef6ff',
      color: this.customization.primaryColor,
      padding: '8px 12px',
      'border-radius': '6px',
      'font-weight': '700',
      'text-align': 'center',
      'letter-spacing': '1px',
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
