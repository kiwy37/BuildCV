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
    // Only allow going to completed steps or the next step
    if (step <= this.currentStep || this.canProceedToStep(step)) {
      this.cvService.setCurrentStep(step);
    }
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps && this.validateCurrentStep()) {
      this.cvService.nextStep();
    } else if (!this.validateCurrentStep()) {
      this.showValidationError();
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

  validateCurrentStep(): boolean {
    const cvData = this.cvService.getCVData();

    switch (this.currentStep) {
      case 1: // Personal Info
        return this.validatePersonalInfo(cvData);
      case 2: // Experience
        return this.validateExperience(cvData);
      case 3: // Education
        return this.validateEducation(cvData);
      case 4: // Skills
        return cvData.skills && cvData.skills.length > 0;
      case 5: // Projects (optional)
        return true;
      case 6: // Additional (optional)
        return true;
      case 7: // Preview
        return true;
      default:
        return true;
    }
  }

  private validatePersonalInfo(cvData: any): boolean {
    const pi = cvData.personalInfo;
    return !!(
      pi.fullName && 
      pi.fullName.trim() !== '' &&
      pi.email && 
      pi.email.trim() !== '' &&
      this.isValidEmail(pi.email)
    );
  }

  private validateExperience(cvData: any): boolean {
    if (!cvData.experiences || cvData.experiences.length === 0) {
      return false;
    }

    return cvData.experiences.every((exp: any) => {
      return !!(
        exp.jobTitle && 
        exp.jobTitle.trim() !== '' &&
        exp.company && 
        exp.company.trim() !== '' &&
        exp.startDate &&
        (exp.isCurrent || exp.endDate)
      );
    });
  }

  private validateEducation(cvData: any): boolean {
    if (!cvData.education || cvData.education.length === 0) {
      return false;
    }

    return cvData.education.every((edu: any) => {
      return !!(
        edu.degree && 
        edu.degree.trim() !== '' &&
        edu.institution && 
        edu.institution.trim() !== '' &&
        edu.startDate &&
        edu.endDate
      );
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private canProceedToStep(targetStep: number): boolean {
    // Check if all previous steps are valid
    for (let i = 1; i < targetStep; i++) {
      const originalStep = this.currentStep;
      this.currentStep = i;
      const isValid = this.validateCurrentStep();
      this.currentStep = originalStep;
      
      if (!isValid) {
        return false;
      }
    }
    return true;
  }

  private showValidationError(): void {
    let message = '';
    
    switch (this.currentStep) {
      case 1:
        message = 'Please fill in all required fields: Full Name and valid Email address.';
        break;
      case 2:
        message = 'Please add at least one work experience with all required fields filled in.';
        break;
      case 3:
        message = 'Please add at least one education entry with all required fields filled in.';
        break;
      case 4:
        message = 'Please add at least one skill.';
        break;
      default:
        message = 'Please complete all required fields.';
    }

    alert(message);
  }
}