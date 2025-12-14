import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CvService } from '../cv.service';
import { Certification } from '../cv-data.model';

@Component({
  selector: 'app-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.css']
})
export class AdditionalComponent implements OnInit {
  certificationsForm!: FormGroup;
  languages: string[] = [];
  currentLanguage: string = '';

  constructor(
    private fb: FormBuilder,
    private cvService: CvService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
  }

  initializeForm(): void {
    this.certificationsForm = this.fb.group({
      certifications: this.fb.array([])
    });
  }

  get certifications(): FormArray {
    return this.certificationsForm.get('certifications') as FormArray;
  }

  createCertificationGroup(cert?: Certification): FormGroup {
    return this.fb.group({
      name: [cert?.name || '', Validators.required],
      issuer: [cert?.issuer || '', Validators.required],
      date: [cert?.date || ''],
      credentialId: [cert?.credentialId || '']
    });
  }

  addCertification(): void {
    this.certifications.push(this.createCertificationGroup());
  }

  removeCertification(index: number): void {
    this.certifications.removeAt(index);
    this.saveCertifications();
  }

  addLanguage(): void {
    const lang = this.currentLanguage.trim();
    if (lang && !this.languages.includes(lang)) {
      this.languages.push(lang);
      this.currentLanguage = '';
      this.saveLanguages();
    }
  }

  removeLanguage(index: number): void {
    this.languages.splice(index, 1);
    this.saveLanguages();
  }

  onLanguageKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addLanguage();
    }
  }

  loadExistingData(): void {
    const cvData = this.cvService.getCVData();
    
    if (cvData.certifications && cvData.certifications.length > 0) {
      cvData.certifications.forEach(cert => {
        this.certifications.push(this.createCertificationGroup(cert));
      });
    }

    this.languages = cvData.languages || [];

    this.certificationsForm.valueChanges.subscribe(() => {
      this.saveCertifications();
    });
  }

  saveCertifications(): void {
    this.cvService.updateCVData({ certifications: this.certifications.value });
  }

  saveLanguages(): void {
    this.cvService.updateCVData({ languages: this.languages });
  }
}