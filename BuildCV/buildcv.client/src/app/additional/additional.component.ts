import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CvService } from '../cv.service';
import { Certification, LanguageEntry } from '../cv-data.model';

@Component({
  selector: 'app-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.css']
})
export class AdditionalComponent implements OnInit {
  certificationsForm!: FormGroup;
  languages: LanguageEntry[] = [];
  currentLanguage: string = '';
  currentLanguageLevel = 3;

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
    if (!lang) return;
    const exists = this.languages.some(l => l.name.toLowerCase() === lang.toLowerCase());
    if (exists) return;
    this.languages.push({ name: lang, level: this.currentLanguageLevel });
    this.currentLanguage = '';
    this.currentLanguageLevel = 3;
    this.saveLanguages();
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

    this.languages = (cvData.languages || []).map(l => {
      const entry: any = l as any;
      if (typeof l === 'string') {
        return { name: l, level: 3 };
      }
      return { name: entry.name || entry.language || '', level: entry.level ?? 3 };
    });

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

  updateLanguageLevel(index: number, level: number): void {
    this.languages[index].level = level;
    this.saveLanguages();
  }
}