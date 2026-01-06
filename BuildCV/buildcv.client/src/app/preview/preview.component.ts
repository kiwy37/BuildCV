// preview.component.ts
import { Component, OnInit } from '@angular/core';
import { CvService } from '../cv.service';
import { CVData } from '../cv-data.model';
import { CustomizationSettings } from './templates/lima-template/lima-template.component';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
  cvData!: CVData;
  selectedTheme = 'lima';
  isLoading = false;
  showCustomizationPanel = true;

  zoom = 1; // 1 = 100%

  customization: CustomizationSettings = {
    fontSize: 14,
    lineHeight: 1.6,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 32,
    paddingRight: 32,
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    textColor: '#2D3748',
    backgroundColor: '#FFFFFF',
    borderColor: '#dcdfe4',
    headingColor: '#2a303c',
    sectionBgColor: '#f9fafb',
    headingFontSize: 24,
    sectionSpacing: 20,
    fontFamily: 'Roboto'
  };

  constructor(private cvService: CvService) {}

  ngOnInit(): void {
    this.cvData = this.cvService.getCVData();
    this.selectedTheme = (this.cvData as any).selectedTheme || 'lima';

    const saved = localStorage.getItem('cvCustomization');
    if (saved) {
      this.customization = JSON.parse(saved);
    }
  }

  toggleCustomizationPanel(): void {
    this.showCustomizationPanel = !this.showCustomizationPanel;
  }

  setZoom(value: string | number): void {
    const v = Number(value);
    if (!isNaN(v)) {
      this.zoom = Math.max(0.5, Math.min(2, v / 100));
    }
  }

  onCustomizationChange(): void {
    localStorage.setItem('cvCustomization', JSON.stringify(this.customization));
  }

  resetCustomization(): void {
    localStorage.removeItem('cvCustomization');
    this.ngOnInit();
  }

  downloadPDF(): void {
    window.print();
  }

  backToThemeSelection(): void {
    this.cvService.setCurrentStep(8);
  }

  getPreviewStyles(): any {
    return {
      'transform': `scale(${this.zoom})`,
      'transform-origin': 'top center',
      'transition': 'transform 0.2s ease'
    };
  }
}