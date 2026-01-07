import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CvService } from '../cv.service';
import { Experience } from '../cv-data.model';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})
export class ExperienceComponent implements OnInit {
  experienceForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cvService: CvService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
  }

  initializeForm(): void {
    this.experienceForm = this.fb.group({
      experiences: this.fb.array([])
    });
  }

  get experiences(): FormArray {
    return this.experienceForm.get('experiences') as FormArray;
  }

  createExperienceGroup(experience?: Experience): FormGroup {
    return this.fb.group({
      jobTitle: [experience?.jobTitle || '', Validators.required],
      company: [experience?.company || '', Validators.required],
      location: [experience?.location || ''],
      startDate: [experience?.startDate || '', Validators.required],
      endDate: [experience?.endDate || ''],
      isCurrent: [experience?.isCurrent || false],
      responsibilities: this.fb.array(
        experience?.responsibilities?.map(r => this.fb.control(r)) || [this.fb.control('')]
      )
    });
  }

  getResponsibilities(experienceIndex: number): FormArray {
    return this.experiences.at(experienceIndex).get('responsibilities') as FormArray;
  }

  addExperience(): void {
    this.experiences.push(this.createExperienceGroup());
  }

  removeExperience(index: number): void {
    this.experiences.removeAt(index);
    this.saveExperiences();
  }

  addResponsibility(experienceIndex: number): void {
    this.getResponsibilities(experienceIndex).push(this.fb.control(''));
  }

  removeResponsibility(experienceIndex: number, responsibilityIndex: number): void {
    this.getResponsibilities(experienceIndex).removeAt(responsibilityIndex);
    this.saveExperiences();
  }

  onCurrentJobChange(experienceIndex: number): void {
    const experience = this.experiences.at(experienceIndex);
    const isCurrent = experience.get('isCurrent')?.value;
    
    if (isCurrent) {
      experience.get('endDate')?.setValue('');
      experience.get('endDate')?.disable();
    } else {
      experience.get('endDate')?.enable();
    }
    
    this.saveExperiences();
  }

  loadExistingData(): void {
    const cvData = this.cvService.getCVData();
    if (cvData.experiences && cvData.experiences.length > 0) {
      cvData.experiences.forEach(exp => {
        this.experiences.push(this.createExperienceGroup(exp));
      });
    } else {
      this.addExperience();
    }

    this.experienceForm.valueChanges.subscribe(() => {
      this.saveExperiences();
    });
  }

  saveExperiences(): void {
    const experiences = this.experiences.value.map((exp: any) => ({
      ...exp,
      responsibilities: exp.responsibilities.filter((r: string) => r.trim() !== '')
    }));
    
    this.cvService.updateCVData({ experiences });
  }

  moveExperienceUp(index: number): void {
    if (index > 0) {
      const currentControl = this.experiences.at(index);
      const previousControl = this.experiences.at(index - 1);
      
      // Salvăm valorile
      const currentValue = currentControl.value;
      const previousValue = previousControl.value;
      
      // Recreăm controalele pentru a menține starea corectă
      this.experiences.removeAt(index);
      this.experiences.removeAt(index - 1);
      
      // Inserăm în ordine inversă
      this.experiences.insert(index - 1, this.createExperienceGroup(currentValue));
      this.experiences.insert(index, this.createExperienceGroup(previousValue));
      
      this.saveExperiences();
    }
  }

  moveExperienceDown(index: number): void {
    if (index < this.experiences.length - 1) {
      const currentControl = this.experiences.at(index);
      const nextControl = this.experiences.at(index + 1);
      
      // Salvăm valorile
      const currentValue = currentControl.value;
      const nextValue = nextControl.value;
      
      // Recreăm controalele pentru a menține starea corectă
      this.experiences.removeAt(index + 1);
      this.experiences.removeAt(index);
      
      // Inserăm în ordine inversă
      this.experiences.insert(index, this.createExperienceGroup(nextValue));
      this.experiences.insert(index + 1, this.createExperienceGroup(currentValue));
      
      this.saveExperiences();
    }
  }
}