// riga-template.component.ts
import { Component, Input } from '@angular/core';
import { CVData } from '../../../cv-data.model';
import { CustomizationSettings } from '../lima-template/lima-template.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-riga-template',
  templateUrl: './riga-template.component.html',
  styleUrls: ['./riga-template.component.css'],
})
export class RigaTemplateComponent {
  @Input() cvData!: CVData;
  @Input() customization!: CustomizationSettings;

  get personalInfo() {
    return this.cvData?.personalInfo || {};
  }

  get fullNameUppercase(): string {
    return (this.personalInfo.fullName || 'Your Name').toUpperCase();
  }

  getSkillName(skill: any): string {
    if (typeof skill === 'string') return skill;
    return skill.name || skill.skill || '';
  }

  getLanguageName(lang: any): string {
    return typeof lang === 'string' ? lang : lang.name || '';
  }

  getLanguageLevel(lang: any): number {
    if (typeof lang === 'object') {
      return lang.levelPercent || lang.level || 60;
    }
    return 60;
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
      'color': c.textColor
    };
  }

  getTopBandStyles(): any {
    return {
      'background': '#1f2937',
      'color': '#fff',
      'padding': '34px 24px 28px 24px',
      'text-align': 'center'
    };
  }

  getNameStyles(): any {
    return {
      'margin': '6px 0',
      'font-size': `${this.customization.headingFontSize * 2}px`,
      'letter-spacing': '6px',
      'text-transform': 'uppercase',
      'color': this.customization.primaryColor
    };
  }

  getSectionTitleStyles(): any {
    return {
      'color': this.customization.primaryColor
    };
  }

  getLeftHeadingStyles(): any {
    return {
      'color': this.customization.primaryColor
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
      Roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap',
      Lato: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
      Montserrat: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap',
      'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&display=swap',
      Raleway: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;700&display=swap',
      Caladea: 'https://fonts.googleapis.com/css2?family=Caladea&display=swap',
      Lora: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
      'Roboto Slab': 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;700&display=swap',
      'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
      Merriweather: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap',
    };
    return map[this.customization.fontFamily] || map['Roboto'];
  }
}