import { Component, OnInit, OnDestroy } from '@angular/core';
import { CvService } from '../cv.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cv-builder',
  templateUrl: './cv-builder.component.html',
  styleUrls: ['./cv-builder.component.css']
})
export class CvBuilderComponent implements OnInit, OnDestroy {
  currentStep: number = 1;
  totalSteps: number = 9;

  private stepSub?: Subscription;
  private originalBodyOverflow: string | null = null;

  steps = [
    { number: 1, title: 'Upload CV', subtitle: 'Import from PDF/Word', icon: 'upload' },
    { number: 2, title: 'Personal Info', subtitle: 'Basic information', icon: 'user' },
    { number: 3, title: 'Experience', subtitle: 'Work history', icon: 'briefcase' },
    { number: 4, title: 'Education', subtitle: 'Academic background', icon: 'graduation-cap' },
    { number: 5, title: 'Skills', subtitle: 'Technical & soft skills', icon: 'code' },
    { number: 6, title: 'Projects', subtitle: 'Portfolio projects', icon: 'folder' },
    { number: 7, title: 'Additional', subtitle: 'Certifications & awards', icon: 'trophy' },
    { number: 8, title: 'Choose Theme', subtitle: 'Select template', icon: 'eye' },
    { number: 9, title: 'Preview', subtitle: 'Review & customize', icon: 'sliders' }
  ];

  constructor(private cvService: CvService) {}

  ngOnInit(): void {
    this.stepSub = this.cvService.currentStep$.subscribe(step => {
      this.currentStep = step;
      this.updateBodyScrollLock();
    });
    // Ensure initial lock state matches currentStep
    this.updateBodyScrollLock();
  }

  ngOnDestroy(): void {
    if (this.stepSub) {
      this.stepSub.unsubscribe();
    }
    // restore body overflow if we changed it
    if (typeof document !== 'undefined' && this.originalBodyOverflow !== null) {
      document.body.style.overflow = this.originalBodyOverflow;
      this.originalBodyOverflow = null;
    }
  }

  private updateBodyScrollLock(): void {
    if (typeof document === 'undefined') return;

    // Stop locking body scroll for the Choose Theme step so the internal container can scroll.
    if (this.originalBodyOverflow !== null) {
      document.body.style.overflow = this.originalBodyOverflow;
      this.originalBodyOverflow = null;
    } else {
      document.body.style.overflow = '';
    }
  }

  goToStep(step: number): void {
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
      case 1: // Upload CV
        // optional; allow users to skip upload
        return true;
      case 2: // Personal Info
        return this.validatePersonalInfo(cvData);
      case 3: // Experience
        return this.validateExperience(cvData);
      case 4: // Education
        return this.validateEducation(cvData);
      case 5: // Skills
        return cvData.skills && cvData.skills.length > 0;
      case 6: // Projects (optional)
        return true;
      case 7: // Additional (optional)
        return true;
      case 8: // Choose Theme
        return !!(cvData as any).selectedTheme;
      case 9: // Preview
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
      case 7:
        message = 'Please select a theme before continuing.';
        break;
      default:
        message = 'Please complete all required fields.';
    }

    alert(message);
  }
}