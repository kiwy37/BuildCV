import { Component } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

interface TextItem {
  text: string;
  x1: number;
  x2: number;
  y: number;
  bold: boolean;
  newLine: boolean;
}

interface Line {
  items: TextItem[];
  y: number;
}

interface Section {
  title: string;
  lines: Line[];
}

interface ResumeData {
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
    url: string;
    summary: string;
  };
  education: Array<{
    school: string;
    degree: string;
    gpa: string;
    date: string;
    descriptions: string[];
  }>;
  workExperience: Array<{
    company: string;
    jobTitle: string;
    date: string;
    descriptions: string[];
  }>;
  projects: Array<{
    name: string;
    date: string;
    descriptions: string[];
  }>;
  skills: string[];
}

@Component({
  selector: 'app-cv-upload',
  templateUrl: './cv-upload.component.html',
  styleUrls: ['./cv-upload.component.css']
})
export class CvUploadComponent {
  selectedFile: File | null = null;
  parsedResume: ResumeData | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.error = null;
      this.parseResume(file);
    } else {
      this.error = 'Please select a valid PDF file';
    }
  }

  async parseResume(file: File): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      // Step 1: Extract text items from PDF
      const textItems = await this.extractTextItems(file);
      
      // Step 2: Group text items into lines
      const lines = this.groupTextItemsIntoLines(textItems);
      
      // Step 3: Group lines into sections
      const sections = this.groupLinesIntoSections(lines);
      
      // Step 4: Extract information from sections
      this.parsedResume = this.extractResumeFromSections(sections);
      
    } catch (err) {
      this.error = 'Error parsing CV: ' + (err as Error).message;
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  // STEP 1: Extract text items from PDF
  private async extractTextItems(file: File): Promise<TextItem[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textItems: TextItem[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      let prevItem: any = null;

      textContent.items.forEach((item: any) => {
        const transform = item.transform;
        const x1 = transform[4];
        const y = transform[5];
        const width = item.width;
        const x2 = x1 + width;
        
        // Detect if it's bold (font name contains "Bold")
        const bold = item.fontName?.includes('Bold') || false;
        
        // Detect newline (if Y coordinate changed significantly)
        const newLine = prevItem ? Math.abs(y - prevItem.y) > 5 : true;

        textItems.push({
          text: item.str,
          x1,
          x2,
          y,
          bold,
          newLine
        });

        prevItem = { y };
      });
    }

    return textItems;
  }

  // STEP 2: Group text items into lines
  private groupTextItemsIntoLines(textItems: TextItem[]): Line[] {
    if (textItems.length === 0) return [];

    // Calculate average character width
    const totalWidth = textItems.reduce((sum, item) => sum + (item.x2 - item.x1), 0);
    const totalChars = textItems.reduce((sum, item) => sum + item.text.length, 0);
    const avgCharWidth = totalWidth / totalChars;

    // Merge nearby text items
    const mergedItems: TextItem[] = [];
    let currentItem = { ...textItems[0] };

    for (let i = 1; i < textItems.length; i++) {
      const item = textItems[i];
      const distance = item.x1 - currentItem.x2;

      // If distance is small and they're on the same line, merge them
      if (distance < avgCharWidth && Math.abs(item.y - currentItem.y) < 2) {
        currentItem.text += item.text;
        currentItem.x2 = item.x2;
      } else {
        mergedItems.push(currentItem);
        currentItem = { ...item };
      }
    }
    mergedItems.push(currentItem);

    // Group items into lines based on Y coordinate
    const lines: Line[] = [];
    let currentLine: TextItem[] = [];
    let currentY = mergedItems[0].y;

    mergedItems.forEach(item => {
      if (Math.abs(item.y - currentY) < 5) {
        currentLine.push(item);
      } else {
        if (currentLine.length > 0) {
          lines.push({ items: currentLine, y: currentY });
        }
        currentLine = [item];
        currentY = item.y;
      }
    });

    if (currentLine.length > 0) {
      lines.push({ items: currentLine, y: currentY });
    }

    // Sort lines from top to bottom
    return lines.sort((a, b) => b.y - a.y);
  }

  // STEP 3: Group lines into sections
  private groupLinesIntoSections(lines: Line[]): Section[] {
    const sections: Section[] = [];
    const sectionKeywords = [
      'WORK EXPERIENCE', 'EXPERIENCE', 'EMPLOYMENT',
      'EDUCATION', 'ACADEMIC',
      'SKILLS', 'TECHNICAL SKILLS',
      'PROJECTS', 'PROJECT',
      'CERTIFICATIONS', 'CERTIFICATES'
    ];

    // First section is always PROFILE
    let currentSection: Section = { title: 'PROFILE', lines: [] };
    
    lines.forEach(line => {
      const lineText = line.items.map(i => i.text).join('').trim();
      
      // Check if it's a section title
      const isSectionTitle = this.isSectionTitle(line, lineText, sectionKeywords);
      
      if (isSectionTitle) {
        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { title: lineText, lines: [] };
      } else {
        currentSection.lines.push(line);
      }
    });

    if (currentSection.lines.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }

  private isSectionTitle(line: Line, text: string, keywords: string[]): boolean {
    // Main heuristic: single item, bold, uppercase
    if (line.items.length === 1 && 
        line.items[0].bold && 
        text === text.toUpperCase() &&
        text.length > 2) {
      return true;
    }

    // Fallback: keyword matching
    return keywords.some(keyword => text.toUpperCase().includes(keyword));
  }

  // STEP 4: Extract resume data from sections
  private extractResumeFromSections(sections: Section[]): ResumeData {
    const resume: ResumeData = {
      profile: {
        name: '',
        email: '',
        phone: '',
        location: '',
        url: '',
        summary: ''
      },
      education: [],
      workExperience: [],
      projects: [],
      skills: []
    };

    sections.forEach(section => {
      const title = section.title.toUpperCase();

      if (title === 'PROFILE' || sections.indexOf(section) === 0) {
        resume.profile = this.extractProfile(section);
      } else if (title.includes('EDUCATION')) {
        resume.education = this.extractEducation(section);
      } else if (title.includes('WORK') || title.includes('EXPERIENCE') || title.includes('EMPLOYMENT')) {
        resume.workExperience = this.extractWorkExperience(section);
      } else if (title.includes('PROJECT')) {
        resume.projects = this.extractProjects(section);
      } else if (title.includes('SKILL')) {
        resume.skills = this.extractSkills(section);
      }
    });

    return resume;
  }

  private extractProfile(section: Section): any {
    const allItems = section.lines.flatMap(line => line.items);
    
    return {
      name: this.findBestMatch(allItems, this.nameFeatures.bind(this)),
      email: this.findBestMatch(allItems, this.emailFeatures.bind(this)),
      phone: this.findBestMatch(allItems, this.phoneFeatures.bind(this)),
      location: this.findBestMatch(allItems, this.locationFeatures.bind(this)),
      url: this.findBestMatch(allItems, this.urlFeatures.bind(this)),
      summary: this.findBestMatch(allItems, this.summaryFeatures.bind(this))
    };
  }

  private findBestMatch(items: TextItem[], featureFunc: (text: string, item: TextItem) => number): string {
    let bestScore = -Infinity;
    let bestText = '';

    items.forEach(item => {
      const score = featureFunc(item.text, item);
      if (score > bestScore) {
        bestScore = score;
        bestText = item.text;
      }
    });

    return bestText;
  }

  // Feature scoring functions
  private nameFeatures(text: string, item: TextItem): number {
    let score = 0;
    if (/^[a-zA-Z\s\.]+$/.test(text)) score += 3;
    if (item.bold) score += 2;
    if (text === text.toUpperCase() && text.length > 3) score += 2;
    if (text.includes('@')) score -= 4;
    if (/\d/.test(text)) score -= 4;
    if (text.includes(',')) score -= 4;
    if (text.includes('/')) score -= 4;
    if (text.length < 5 || text.length > 50) score -= 2;
    return score;
  }

  private emailFeatures(text: string, item: TextItem): number {
    let score = 0;
    if (/\S+@\S+\.\S+/.test(text)) score += 4;
    if (text.includes('@')) score += 2;
    if (item.bold) score -= 1;
    return score;
  }

  private phoneFeatures(text: string, item: TextItem): number {
    let score = 0;
    if (/\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/.test(text)) score += 4;
    if (/\d{10,}/.test(text.replace(/\D/g, ''))) score += 2;
    return score;
  }

  private locationFeatures(text: string, item: TextItem): number {
    let score = 0;
    if (/[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/.test(text)) score += 4;
    if (text.includes(',')) score += 1;
    if (text.includes('@') || text.includes('/')) score -= 4;
    return score;
  }

  private urlFeatures(text: string, item: TextItem): number {
    let score = 0;
    if (/\S+\.[a-z]+\/\S+/.test(text)) score += 4;
    if (text.includes('/')) score += 2;
    if (text.includes('.com') || text.includes('.org')) score += 1;
    return score;
  }

  private summaryFeatures(text: string, item: TextItem): number {
    let score = 0;
    if (text.length > 50 && text.length < 300) score += 3;
    if (!item.bold) score += 1;
    if (text.includes('@') || text.includes('/') || /\d{3}/.test(text)) score -= 4;
    return score;
  }

  private extractEducation(section: Section): any[] {
    const subsections = this.splitIntoSubsections(section.lines);
    return subsections.map(subsection => {
      const items = subsection.flatMap(line => line.items);
      const descriptions = this.extractDescriptions(subsection);
      
      return {
        school: this.findBestMatch(items, this.schoolFeatures.bind(this)),
        degree: this.findBestMatch(items, this.degreeFeatures.bind(this)),
        gpa: this.findBestMatch(items, this.gpaFeatures.bind(this)),
        date: this.findBestMatch(items, this.dateFeatures.bind(this)),
        descriptions
      };
    });
  }

  private extractWorkExperience(section: Section): any[] {
    const subsections = this.splitIntoSubsections(section.lines);
    return subsections.map(subsection => {
      const items = subsection.flatMap(line => line.items);
      const descriptions = this.extractDescriptions(subsection);
      
      return {
        company: this.findBestMatch(items, this.companyFeatures.bind(this)),
        jobTitle: this.findBestMatch(items, this.jobTitleFeatures.bind(this)),
        date: this.findBestMatch(items, this.dateFeatures.bind(this)),
        descriptions
      };
    });
  }

  private extractProjects(section: Section): any[] {
    const subsections = this.splitIntoSubsections(section.lines);
    return subsections.map(subsection => {
      const items = subsection.flatMap(line => line.items);
      const descriptions = this.extractDescriptions(subsection);
      
      return {
        name: this.findBestMatch(items, this.projectFeatures.bind(this)),
        date: this.findBestMatch(items, this.dateFeatures.bind(this)),
        descriptions
      };
    });
  }

  private extractSkills(section: Section): string[] {
    const skills: string[] = [];
    section.lines.forEach(line => {
      line.items.forEach(item => {
        if (item.text.trim() && !item.text.includes('•')) {
          skills.push(item.text.trim());
        }
      });
    });
    return skills;
  }

  private splitIntoSubsections(lines: Line[]): Line[][] {
    const subsections: Line[][] = [];
    let currentSubsection: Line[] = [];
    
    // Calculate typical line gap
    const gaps: number[] = [];
    for (let i = 1; i < lines.length; i++) {
      gaps.push(lines[i - 1].y - lines[i].y);
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const threshold = avgGap * 1.4;

    lines.forEach((line, index) => {
      if (index > 0) {
        const gap = lines[index - 1].y - line.y;
        const hasBoldItem = line.items.some(item => item.bold);
        
        if (gap > threshold || hasBoldItem) {
          if (currentSubsection.length > 0) {
            subsections.push(currentSubsection);
          }
          currentSubsection = [];
        }
      }
      currentSubsection.push(line);
    });

    if (currentSubsection.length > 0) {
      subsections.push(currentSubsection);
    }

    return subsections;
  }

  private extractDescriptions(lines: Line[]): string[] {
    const descriptions: string[] = [];
    lines.forEach(line => {
      const text = line.items.map(i => i.text).join(' ').trim();
      if (text.startsWith('•') || text.startsWith('-')) {
        descriptions.push(text);
      }
    });
    return descriptions;
  }

  // Additional feature functions
  private schoolFeatures(text: string, item: TextItem): number {
    let score = 0;
    const keywords = ['University', 'College', 'School', 'Institute'];
    if (keywords.some(k => text.includes(k))) score += 3;
    if (item.bold) score += 2;
    return score;
  }

  private degreeFeatures(text: string, item: TextItem): number {
    let score = 0;
    const keywords = ['Bachelor', 'Master', 'PhD', 'Associate', 'Degree', 'Science', 'Arts'];
    if (keywords.some(k => text.includes(k))) score += 3;
    if (text.includes('GPA')) score += 1;
    return score;
  }

  private gpaFeatures(text: string, item: TextItem): number {
    let score = 0;
    if (/[0-4]\.\d{1,2}/.test(text)) score += 4;
    if (text.toUpperCase().includes('GPA')) score += 2;
    return score;
  }

  private dateFeatures(text: string, item: TextItem): number {
    let score = 0;
    if (/(?:19|20)\d{2}/.test(text)) score += 3;
    if (/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(text)) score += 2;
    if (/Spring|Summer|Fall|Winter/.test(text)) score += 2;
    if (text.includes('Present')) score += 2;
    if (text.includes('-')) score += 1;
    return score;
  }

  private jobTitleFeatures(text: string, item: TextItem): number {
    let score = 0;
    const keywords = ['Engineer', 'Developer', 'Manager', 'Analyst', 'Designer', 
                     'Intern', 'Assistant', 'Coordinator', 'Specialist'];
    if (keywords.some(k => text.includes(k))) score += 3;
    if (!item.bold) score += 1;
    if (/(?:19|20)\d{2}/.test(text)) score -= 3;
    return score;
  }

  private companyFeatures(text: string, item: TextItem): number {
    let score = 0;
    if (item.bold) score += 2;
    if (text.length > 3 && text.length < 50) score += 1;
    if (/(?:19|20)\d{2}/.test(text)) score -= 3;
    const jobKeywords = ['Engineer', 'Developer', 'Manager', 'Intern'];
    if (jobKeywords.some(k => text.includes(k))) score -= 2;
    return score;
  }

  private projectFeatures(text: string, item: TextItem): number {
    let score = 0;
    if (item.bold) score += 2;
    if (text.length > 3 && text.length < 50) score += 1;
    if (/(?:19|20)\d{2}/.test(text)) score -= 3;
    return score;
  }
}