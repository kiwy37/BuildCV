// BuildCV/buildcv.client/src/app/cv.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CVData, CVTemplate, ValidationResult, SkillEntry, LanguageEntry } from './cv-data.model';

@Injectable({
  providedIn: 'root'
})
export class CvService {
  private cvDataSubject = new BehaviorSubject<CVData>(this.getInitialCVData());
  public cvData$ = this.cvDataSubject.asObservable();

  private currentStepSubject = new BehaviorSubject<number>(0); // Start at 0
  public currentStep$ = this.currentStepSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load from localStorage if available
    const savedData = localStorage.getItem('cvData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      this.cvDataSubject.next(this.normalizeEntries(parsed));
    }
  }

  private getInitialCVData(): CVData {
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedIn: '',
        website: '',
        photoUrl: '',
        title: '',
        profession: '',
        links: []
      },
      professionalSummary: '',
      experiences: [],
      education: [],
      skills: [],
      hobbies: [],
      projects: [],
      certifications: [],
      languages: [],
      photoUrl: ''
    };
  }

  private normalizeEntries(data: any): CVData {
    const normalizedSkills: SkillEntry[] = (data.skills || []).map((s: any) => {
      if (typeof s === 'string') {
        return { name: s, level: 3 };
      }
      const entry: any = s;
      return {
        name: entry.name || entry.skill || '',
        level: entry.level ?? (entry.levelPercent ? Math.round((entry.levelPercent / 100) * 5) : 3),
        levelPercent: entry.levelPercent
      };
    });

    const normalizedLanguages: LanguageEntry[] = (data.languages || []).map((l: any) => {
      if (typeof l === 'string') {
        return { name: l, level: 3 };
      }
      const entry: any = l;
      return {
        name: entry.name || entry.language || '',
        level: entry.level ?? (entry.levelPercent ? Math.round((entry.levelPercent / 100) * 5) : 3),
        levelPercent: entry.levelPercent
      };
    });

    return {
      ...this.getInitialCVData(),
      ...data,
      skills: normalizedSkills,
      languages: normalizedLanguages,
    } as CVData;
  }

  getCVData(): CVData {
    return this.cvDataSubject.value;
  }

  updateCVData(data: Partial<CVData>): void {
    const currentData = this.cvDataSubject.value;
    const updatedData = { ...currentData, ...data };
    this.cvDataSubject.next(updatedData);
    localStorage.setItem('cvData', JSON.stringify(updatedData));
  }

  updatePersonalInfo(info: Partial<CVData['personalInfo']>): void {
    const currentData = this.cvDataSubject.value;
    currentData.personalInfo = { ...currentData.personalInfo, ...info };
    this.cvDataSubject.next(currentData);
    localStorage.setItem('cvData', JSON.stringify(currentData));
  }

  getCurrentStep(): number {
    return this.currentStepSubject.value;
  }

  setCurrentStep(step: number): void {
    this.currentStepSubject.next(step);
  }

  nextStep(): void {
    this.currentStepSubject.next(this.currentStepSubject.value + 1);
  }

  previousStep(): void {
    if (this.currentStepSubject.value > 0) {
      this.currentStepSubject.next(this.currentStepSubject.value - 1);
    }
  }

  getTemplates(): Observable<CVTemplate[]> {
    return this.http.get<CVTemplate[]>('/api/cv/templates');
  }

  validateCV(cvData: CVData): Observable<ValidationResult> {
    return this.http.post<ValidationResult>('/api/cv/validate', cvData);
  }

  generatePreview(cvData: CVData): Observable<{ htmlContent: string; templateId: string }> {
    return this.http.post<{ htmlContent: string; templateId: string }>('/api/cv/preview', cvData);
  }

  exportToPdf(cvData: CVData, templateId: string): Observable<Blob> {
    return this.http.post('/api/cv/export/pdf', { cvData, templateId }, {
      responseType: 'blob'
    });
  }

  resetCV(): void {
    this.cvDataSubject.next(this.getInitialCVData());
    localStorage.removeItem('cvData');
    this.currentStepSubject.next(0); // Reset to upload step
  }
}