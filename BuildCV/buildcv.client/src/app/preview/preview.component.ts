import { Component, OnInit } from '@angular/core';
import { CvService } from '../cv.service';
import { CVData, CVTemplate, ValidationResult } from '../cv-data.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
  cvData!: CVData;
  templates: CVTemplate[] = [];
  selectedTemplateId: string = 'modern';
  previewHtml: SafeHtml = '';
  validationResult: ValidationResult | null = null;
  isLoading: boolean = false;

  constructor(
    private cvService: CvService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cvData = this.cvService.getCVData();
    this.loadTemplates();
    this.validateCV();
    this.generatePreview();
  }

  loadTemplates(): void {
    this.cvService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
      }
    });
  }

  selectTemplate(templateId: string): void {
    this.selectedTemplateId = templateId;
    this.generatePreview();
  }

  validateCV(): void {
    this.cvService.validateCV(this.cvData).subscribe({
      next: (result) => {
        this.validationResult = result;
      },
      error: (error) => {
        console.error('Error validating CV:', error);
      }
    });
  }

  generatePreview(): void {
    this.isLoading = true;
    this.cvService.generatePreview(this.cvData).subscribe({
      next: (response) => {
        this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(response.htmlContent);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating preview:', error);
        this.isLoading = false;
      }
    });
  }

  downloadPDF(): void {
    this.isLoading = true;
    this.cvService.exportToPdf(this.cvData, this.selectedTemplateId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error exporting PDF:', error);
        this.isLoading = false;
      }
    });
  }

  downloadWord(): void {
    // Implement Word export functionality
    alert('Word export will be implemented');
  }

  goToStep(step: number): void {
    this.cvService.setCurrentStep(step);
  }
}