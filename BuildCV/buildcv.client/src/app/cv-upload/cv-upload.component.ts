// BuildCV/buildcv.client/src/app/cv-upload/cv-upload.component.ts
import { Component } from '@angular/core';
import { CvService } from '../cv.service';
import { CVData } from '../cv-data.model';

@Component({
  selector: 'app-cv-upload',
  templateUrl: './cv-upload.component.html',
  styleUrls: ['./cv-upload.component.css']
})
export class CvUploadComponent {
  isUploading = false;
  uploadError = '';
  uploadSuccess = false;
  extractedData: Partial<CVData> | null = null;

  constructor(private cvService: CvService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadError = '';
    this.uploadSuccess = false;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      this.uploadError = 'Please upload a PDF or Word document (.pdf, .doc, .docx)';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError = 'File size must be less than 5MB';
      return;
    }

    this.uploadCV(file);
  }

  private async uploadCV(file: File): Promise<void> {
    this.isUploading = true;
    this.uploadError = '';

    try {
      // Read file as base64
      const base64Data = await this.fileToBase64(file);
      
      // In a real implementation, you would send this to your backend API
      // For now, we'll simulate the extraction with a basic parser
      const extractedText = await this.extractTextFromFile(file);
      const parsedData = this.parseCV(extractedText);

      if (parsedData) {
        this.extractedData = parsedData;
        this.uploadSuccess = true;
        
        // Show preview to user before applying
        setTimeout(() => {
          if (confirm('CV successfully parsed! Would you like to use this information?')) {
            this.applyExtractedData();
          }
        }, 500);
      }
    } catch (error) {
      this.uploadError = 'Failed to process CV. Please try again or fill the form manually.';
      console.error('Upload error:', error);
    } finally {
      this.isUploading = false;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async extractTextFromFile(file: File): Promise<string> {
    // This is a simplified version. In production, you'd use a proper PDF/DOCX parser
    // or send to backend API for processing
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.readAsText(file);
    });
  }

  private parseCV(text: string): Partial<CVData> | null {
    // Basic CV parsing logic
    // In production, this should be done on the backend with proper NLP/AI
    
    const data: Partial<CVData> = {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedIn: '',
        website: ''
      },
      professionalSummary: '',
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: []
    };

    // Extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch && data.personalInfo) {
      data.personalInfo.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch && data.personalInfo) {
      data.personalInfo.phone = phoneMatch[0];
    }

    // Extract skills (look for common keywords)
    const skillKeywords = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'React', 
                          'Angular', 'Vue', 'Node.js', '.NET', 'SQL', 'MongoDB'];
    const foundSkills = skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    if (foundSkills.length > 0) {
      data.skills = foundSkills;
    }

    return data;
  }

  public applyExtractedData(): void {
    if (this.extractedData) {
      this.cvService.updateCVData(this.extractedData as any);
      this.skipToPersonalInfo();
    }
  }

  skipToPersonalInfo(): void {
    // After successful parsing, go to Personal Info step (now step 2)
    this.cvService.setCurrentStep(2);
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('cv-file-input') as HTMLInputElement;
    fileInput?.click();
  }
}