import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CvService } from '../cv.service';
import { Education } from '../cv-data.model';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {
  educationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cvService: CvService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
  }

  initializeForm(): void {
    this.educationForm = this.fb.group({
      education: this.fb.array([])
    });
  }

  get education(): FormArray {
    return this.educationForm.get('education') as FormArray;
  }

  createEducationGroup(edu?: Education): FormGroup {
    return this.fb.group({
      degree: [edu?.degree || '', Validators.required],
      institution: [edu?.institution || '', Validators.required],
      location: [edu?.location || ''],
      startDate: [edu?.startDate || '', Validators.required],
      endDate: [edu?.endDate || '', Validators.required],
      gpa: [edu?.gpa || ''],
      achievements: this.fb.array(
        edu?.achievements?.map(a => this.fb.control(a)) || []
      )
    });
  }

  getAchievements(educationIndex: number): FormArray {
    return this.education.at(educationIndex).get('achievements') as FormArray;
  }

  addEducation(): void {
    this.education.push(this.createEducationGroup());
  }

  removeEducation(index: number): void {
    this.education.removeAt(index);
    this.saveEducation();
  }

  addAchievement(educationIndex: number): void {
    this.getAchievements(educationIndex).push(this.fb.control(''));
  }

  removeAchievement(educationIndex: number, achievementIndex: number): void {
    this.getAchievements(educationIndex).removeAt(achievementIndex);
    this.saveEducation();
  }

  loadExistingData(): void {
    const cvData = this.cvService.getCVData();
    if (cvData.education && cvData.education.length > 0) {
      cvData.education.forEach(edu => {
        this.education.push(this.createEducationGroup(edu));
      });
    } else {
      this.addEducation();
    }

    this.educationForm.valueChanges.subscribe(() => {
      this.saveEducation();
    });
  }

  saveEducation(): void {
    const education = this.education.value.map((edu: any) => ({
      ...edu,
      achievements: edu.achievements.filter((a: string) => a.trim() !== '')
    }));
    
    this.cvService.updateCVData({ education });
  }

  moveEducationUp(index: number): void {
    if (index > 0) {
      const education = this.education;
      const temp = education.at(index).value;
      education.at(index).setValue(education.at(index - 1).value);
      education.at(index - 1).setValue(temp);
      this.saveEducation();
    }
  }

  moveEducationDown(index: number): void {
    if (index < this.education.length - 1) {
      const education = this.education;
      const temp = education.at(index).value;
      education.at(index).setValue(education.at(index + 1).value);
      education.at(index + 1).setValue(temp);
      this.saveEducation();
    }
  }
}