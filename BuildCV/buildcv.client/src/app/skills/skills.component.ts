import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CvService } from '../cv.service';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  skillsForm!: FormGroup;
  skills: string[] = [];
  currentSkill: string = '';
  
  skillSuggestions: string[] = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'React', 'Angular',
    'Vue.js', 'Node.js', '.NET', 'Spring Boot', 'SQL', 'MongoDB', 'AWS', 'Azure',
    'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum', 'Project Management',
    'Communication', 'Leadership', 'Problem Solving', 'Team Collaboration'
  ];

  filteredSuggestions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private cvService: CvService
  ) {}

  ngOnInit(): void {
    this.loadExistingData();
  }

  loadExistingData(): void {
    const cvData = this.cvService.getCVData();
    this.skills = cvData.skills || [];
  }

  onSkillInput(event: any): void {
    const value = event.target.value.toLowerCase();
    if (value) {
      this.filteredSuggestions = this.skillSuggestions
        .filter(skill => 
          skill.toLowerCase().includes(value) && 
          !this.skills.includes(skill)
        )
        .slice(0, 5);
    } else {
      this.filteredSuggestions = [];
    }
  }

  addSkill(skill?: string): void {
    const skillToAdd = skill || this.currentSkill.trim();
    
    if (skillToAdd && !this.skills.includes(skillToAdd)) {
      this.skills.push(skillToAdd);
      this.currentSkill = '';
      this.filteredSuggestions = [];
      this.saveSkills();
    }
  }

  removeSkill(index: number): void {
    this.skills.splice(index, 1);
    this.saveSkills();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSkill();
    }
  }

  selectSuggestion(skill: string): void {
    this.addSkill(skill);
  }

  saveSkills(): void {
    this.cvService.updateCVData({ skills: this.skills });
  }

  moveSkillUp(index: number): void {
    if (index > 0) {
      [this.skills[index], this.skills[index - 1]] = [this.skills[index - 1], this.skills[index]];
      this.saveSkills();
    }
  }

  moveSkillDown(index: number): void {
    if (index < this.skills.length - 1) {
      [this.skills[index], this.skills[index + 1]] = [this.skills[index + 1], this.skills[index]];
      this.saveSkills();
    }
  }
}