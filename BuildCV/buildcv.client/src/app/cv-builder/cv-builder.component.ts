import { Component, OnInit } from '@angular/core';
import { CvService } from '../cv.service';

@Component({
  selector: 'app-cv-builder',
  templateUrl: './cv-builder.component.html',
  styleUrls: ['./cv-builder.component.css']
})
export class CvBuilderComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 7;

  steps = [
    { number: 1, title: 'Personal Info', subtitle: 'Basic information', icon: 'user' },
    { number: 2, title: 'Experience', subtitle: 'Work history', icon: 'briefcase' },
    { number: 3, title: 'Education', subtitle: 'Academic background', icon: 'graduation-cap' },
    { number: 4, title: 'Skills', subtitle: 'Technical & soft skills', icon: 'code' },
    { number: 5, title: 'Projects', subtitle: 'Portfolio projects', icon: 'folder' },
    { number: 6, title: 'Additional', subtitle: 'Certifications & awards', icon: 'trophy' },
    { number: 7, title: 'Preview', subtitle: 'Review & download', icon: 'eye' }
  ];

  constructor(private cvService: CvService) {}

  ngOnInit(): void {
    this.cvService.currentStep$.subscribe(step => {
      this.currentStep = step;
    });
  }

  goToStep(step: number): void {
    this.cvService.setCurrentStep(step);
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.cvService.nextStep();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.cvService.previousStep();
    }
  }

  getStepClass(stepNumber: number): string {
    if (stepNumber === this.currentStep) {
      return 'active';
    } else if (stepNumber < this.currentStep) {
      return 'completed';
    }
    return '';
  }
}