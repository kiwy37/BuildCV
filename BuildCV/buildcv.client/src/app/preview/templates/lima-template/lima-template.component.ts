// lima-template.component.ts
import { Component, Input } from '@angular/core';
import { CVData } from '../../../cv-data.model';
import { CommonModule } from '@angular/common';

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
  templateUrl: './lima-template.component.html',
  styleUrls: ['./lima-template.component.css'],
})
export class LimaTemplateComponent {
  @Input() cvData!: CVData;
  @Input() customization!: CustomizationSettings;

  get personalInfo() {
    return this.cvData?.personalInfo || {};
  }

  get hasContactInfo(): boolean {
    const pi = this.personalInfo;
    return !!(pi.email || pi.phone || pi.location || pi.linkedIn || pi.website);
  }

  get fullNameUppercase(): string {
    return (this.personalInfo.fullName || 'Your Name').toUpperCase();
  }

  getSkillLevel(skill: any): number {
    if (typeof skill === 'object') {
      return skill.levelPercent || skill.level || 60;
    }
    return 60;
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
      'box-sizing': 'border-box',
      'font-family': this.getFontFamily(),
      color: c.textColor,
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
