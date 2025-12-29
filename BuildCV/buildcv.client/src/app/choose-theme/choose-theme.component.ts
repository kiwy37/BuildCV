// BuildCV/buildcv.client/src/app/choose-theme/choose-theme.component.ts
import { Component, OnInit } from '@angular/core';
import { CvService } from '../cv.service';

interface Theme {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
}

@Component({
  selector: 'app-choose-theme',
  templateUrl: './choose-theme.component.html',
  styleUrls: ['./choose-theme.component.css']
})
export class ChooseThemeComponent implements OnInit {
  themes: Theme[] = [
    {
      id: 'lima',
      name: 'Lima',
      description: 'Professional two-column layout',
      imageUrl: 'https://storage.googleapis.com/resume-images/resume/en/lima.jpg',
      category: 'Professional'
    },
    {
      id: 'rotterdam',
      name: 'Rotterdam',
      description: 'Modern minimalist design',
      imageUrl: 'https://storage.googleapis.com/rd-assets/resumes/rotterdam.jpg',
      category: 'Modern'
    },
    {
      id: 'riga',
      name: 'Riga',
      description: 'Creative sidebar layout',
      imageUrl: 'https://storage.googleapis.com/rd-assets/resumes/riga.jpg',
      category: 'Creative'
    },
    {
      id: 'ats',
      name: 'ATS Friendly',
      description: 'Optimized for applicant tracking systems',
      imageUrl: 'https://storage.googleapis.com/resume-images/resume/en/ATS.jpg',
      category: 'ATS Optimized'
    }
  ];

  selectedTheme: string | null = null;

  constructor(private cvService: CvService) {}

  ngOnInit(): void {
    // Check if theme was already selected
    const cvData = this.cvService.getCVData();
    if ((cvData as any).selectedTheme) {
      this.selectedTheme = (cvData as any).selectedTheme;
    }
  }

  selectTheme(themeId: string): void {
    this.selectedTheme = themeId;
    // Save selected theme
    this.cvService.updateCVData({ selectedTheme: themeId } as any);
  }

  goToPreview(): void {
    if (this.selectedTheme) {
      this.cvService.nextStep();
    }
  }

  isSelected(themeId: string): boolean {
    return this.selectedTheme === themeId;
  }
}