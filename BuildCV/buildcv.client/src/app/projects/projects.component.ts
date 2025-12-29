import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CvService } from '../cv.service';
import { Project } from '../cv-data.model';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projectsForm!: FormGroup;
  currentTechnologies: string[] = [];

  constructor(
    private fb: FormBuilder,
    private cvService: CvService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
  }

  initializeForm(): void {
    this.projectsForm = this.fb.group({
      projects: this.fb.array([])
    });
  }

  get projects(): FormArray {
    return this.projectsForm.get('projects') as FormArray;
  }

  createProjectGroup(project?: Project): FormGroup {
    this.currentTechnologies[this.projects.length] = '';
    return this.fb.group({
      name: [project?.name || '', Validators.required],
      description: [project?.description || '', Validators.required],
      link: [project?.link || ''],
      technologies: [project?.technologies || []]
    });
  }

  addProject(): void {
    this.projects.push(this.createProjectGroup());
  }

  removeProject(index: number): void {
    this.projects.removeAt(index);
    this.currentTechnologies.splice(index, 1);
    this.saveProjects();
  }

  addTechnology(projectIndex: number): void {
    const tech = this.currentTechnologies[projectIndex]?.trim();
    if (!tech) return;

    const project = this.projects.at(projectIndex);
    const technologies = project.get('technologies')?.value || [];
    
    if (!technologies.includes(tech)) {
      technologies.push(tech);
      project.patchValue({ technologies });
      this.currentTechnologies[projectIndex] = '';
      this.saveProjects();
    }
  }

  removeTechnology(projectIndex: number, techIndex: number): void {
    const project = this.projects.at(projectIndex);
    const technologies = [...(project.get('technologies')?.value || [])];
    technologies.splice(techIndex, 1);
    project.patchValue({ technologies });
    this.saveProjects();
  }

  onTechKeyPress(event: KeyboardEvent, projectIndex: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTechnology(projectIndex);
    }
  }

  loadExistingData(): void {
    const cvData = this.cvService.getCVData();
    if (cvData.projects && cvData.projects.length > 0) {
      cvData.projects.forEach(proj => {
        this.projects.push(this.createProjectGroup(proj));
      });
    }

    this.projectsForm.valueChanges.subscribe(() => {
      this.saveProjects();
    });
  }

  saveProjects(): void {
    this.cvService.updateCVData({ projects: this.projects.value });
  }
}