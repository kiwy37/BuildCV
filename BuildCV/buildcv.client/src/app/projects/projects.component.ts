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
    return this.fb.group({
      name: [project?.name || '', Validators.required],
      description: [project?.description || '', Validators.required],
      link: [project?.link || ''],
      technologies: this.fb.array(
        project?.technologies?.map(t => this.fb.control(t)) || [this.fb.control('')]
      )
    });
  }

  getTechnologies(projectIndex: number): FormArray {
    return this.projects.at(projectIndex).get('technologies') as FormArray;
  }

  addProject(): void {
    this.projects.push(this.createProjectGroup());
  }

  removeProject(index: number): void {
    this.projects.removeAt(index);
    this.saveProjects();
  }

  addTechnology(projectIndex: number): void {
    this.getTechnologies(projectIndex).push(this.fb.control(''));
  }

  removeTechnology(projectIndex: number, techIndex: number): void {
    this.getTechnologies(projectIndex).removeAt(techIndex);
    this.saveProjects();
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
    const projects = this.projects.value.map((proj: any) => ({
      ...proj,
      technologies: proj.technologies.filter((t: string) => t.trim() !== '')
    }));
    
    this.cvService.updateCVData({ projects });
  }
}