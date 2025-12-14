import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CvService } from '../cv.service';
import { PersonalInfo } from '../cv-data.model';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {
  personalInfoForm!: FormGroup;
  professionalSummaryForm!: FormGroup;
  showSummary: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cvService: CvService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadExistingData();
  }

  initializeForms(): void {
    this.personalInfoForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      linkedIn: [''],
      website: ['']
    });

    this.professionalSummaryForm = this.fb.group({
      professionalSummary: ['', Validators.maxLength(500)]
    });

    // Auto-save on changes
    this.personalInfoForm.valueChanges.subscribe(value => {
      this.savePersonalInfo();
    });

    this.professionalSummaryForm.valueChanges.subscribe(value => {
      this.saveProfessionalSummary();
    });
  }

  loadExistingData(): void {
    const cvData = this.cvService.getCVData();
    this.personalInfoForm.patchValue(cvData.personalInfo);
    this.professionalSummaryForm.patchValue({
      professionalSummary: cvData.professionalSummary
    });
    this.showSummary = !!cvData.professionalSummary;
  }

  savePersonalInfo(): void {
    if (this.personalInfoForm.valid) {
      this.cvService.updatePersonalInfo(this.personalInfoForm.value);
    }
  }

  saveProfessionalSummary(): void {
    const summary = this.professionalSummaryForm.get('professionalSummary')?.value;
    this.cvService.updateCVData({ professionalSummary: summary });
  }

  toggleSummary(): void {
    this.showSummary = !this.showSummary;
  }

  getCharacterCount(): number {
    return this.professionalSummaryForm.get('professionalSummary')?.value?.length || 0;
  }
}