import { Component } from '@angular/core';
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
export class ChooseThemeComponent {
  themes: Theme[] = [
    {
      id: 'lima',
      name: 'Lima',
      description: 'Professional two-column layout with elegant styling',
      imageUrl: 'https://storage.googleapis.com/resume-images/resume/en/lima.jpg',
      category: 'Professional'
    },
    {
      id: 'rotterdam',
      name: 'Rotterdam',
      description: 'Modern minimalist design with clean lines',
      imageUrl: 'https://storage.googleapis.com/rd-assets/resumes/rotterdam.jpg',
      category: 'Modern'
    },
    {
      id: 'riga',
      name: 'Riga',
      description: 'Creative sidebar layout with bold colors',
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

  selectedThemeId?: string;

  constructor(private cvService: CvService) {
    // Initialize selectedThemeId from stored CV data if present
    const cvData = this.cvService.getCVData() as any;
    if (cvData && cvData.selectedTheme) {
      this.selectedThemeId = cvData.selectedTheme;
    }
  }

  selectTheme(theme: Theme): void {
    this.selectedThemeId = theme.id;

    // Immediately save the selected theme and navigate to Preview (step 9)
    this.cvService.updateCVData({ selectedTheme: theme.id } as any);
    this.cvService.setCurrentStep(9);
  }
  
}