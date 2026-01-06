// rotterdam-template.component.ts
import { Component, Input } from '@angular/core';
import { CVData } from '../../../cv-data.model';
import { CustomizationSettings } from '../lima-template/lima-template.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rotterdam-template',
  templateUrl: './rotterdam-template.component.html',
  styleUrls: ['./rotterdam-template.component.css'],
})
export class RotterdamTemplateComponent {
  @Input() cvData!: CVData;
  @Input() customization!: CustomizationSettings;

  readonly sidebarBg = '#d9ccc4';
  readonly headerBg = '#3a3a3a';

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
      'font-family': this.getFontFamily(),
      color: c.textColor,
      'font-size': `${c.fontSize}px`,
      'line-height': c.lineHeight,
      'text-align': 'left',
    };
  }

  getHeaderNameStyles(): any {
    return {
      'font-family': "'Playfair Display', serif",
      'font-size': `${this.customization.headingFontSize * 1.6}px`,
      margin: '0',
      'line-height': '1.1',
      color: this.customization.primaryColor,
    };
  }

  getSectionTitleStyles(): any {
    return {
      color: this.customization.primaryColor,
    };
  }

  getSidebarTitleStyles(): any {
    return {
      color: this.customization.primaryColor,
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
