import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CvService } from '../cv.service';
import { SkillEntry } from '../cv-data.model';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  skillsForm!: FormGroup;
  skills: SkillEntry[] = [];
  currentSkill: string = '';
  currentSkillLevel = 3;
  
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
    this.skills = (cvData.skills || []).map(s => {
      if (typeof s === 'string') {
        return { name: s, level: 3 };
      }
      const legacySkill = (s as { skill?: string }).skill;
      return { name: s.name || legacySkill || '', level: s.level ?? 3 };
    });
  }

  private normalizeSkillNames(raw: string, allowSplit: boolean): string[] {
    const parts = allowSplit ? raw.split(/[;,]/) : [raw];
    return parts
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => (p.length > 60 ? `${p.slice(0, 57)}...` : p));
  }

  onSkillInput(event: any): void {
    const value = event.target.value.toLowerCase();
    if (value) {
      this.filteredSuggestions = this.skillSuggestions
        .filter(skill => 
          skill.toLowerCase().includes(value) && 
          !this.skills.some(s => s.name.toLowerCase() === skill.toLowerCase())
        )
        .slice(0, 5);
    } else {
      this.filteredSuggestions = [];
    }
  }

  addSkill(skill?: string): void {
    const skillToAdd = (skill || this.currentSkill).trim();
    if (!skillToAdd) return;

    const entries = this.normalizeSkillNames(skillToAdd, !skill);
    let addedAny = false;

    entries.forEach(entry => {
      const exists = this.skills.some(s => s.name.toLowerCase() === entry.toLowerCase());
      if (!exists) {
        this.skills.push({ name: entry, level: this.currentSkillLevel });
        addedAny = true;
      }
    });

    if (addedAny) {
      this.saveSkills();
    }

    this.currentSkill = '';
    this.currentSkillLevel = 3;
    this.filteredSuggestions = [];
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

  isSkillPresent(skill: string): boolean {
    return this.skills.some(s => s.name.toLowerCase() === skill.toLowerCase());
  }

  updateSkillLevel(index: number, level: number): void {
    this.skills[index].level = level;
    this.saveSkills();
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