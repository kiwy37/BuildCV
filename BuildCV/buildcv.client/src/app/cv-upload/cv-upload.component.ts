import { Component } from '@angular/core';
import { CvService } from '../cv.service';
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
  styleUrls: ['./cv-upload.component.css'],
})
export class CvUploadComponent {
  selectedFile: File | null = null;
  parsedResume: ResumeData | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private cvService: CvService) {
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
      const textItems = await this.extractTextItems(file);
      const lines = this.groupTextItemsIntoLines(textItems);
      const sections = this.groupLinesIntoSections(lines);
      this.parsedResume = this.extractResumeFromSections(sections);

      // NEW: Convert parsed data to CVData format and save to service
      this.saveToCvService(this.parsedResume);
    } catch (err) {
      this.error = 'Error parsing CV: ' + (err as Error).message;
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  // NEW METHOD: Convert and save parsed data to CvService
  private saveToCvService(resumeData: ResumeData): void {
    // Update Personal Info
    this.cvService.updatePersonalInfo({
      fullName: resumeData.profile.name || '',
      email: resumeData.profile.email || '',
      phone: resumeData.profile.phone || '',
      location: resumeData.profile.location || '',
      linkedIn: resumeData.profile.url?.includes('linkedin')
        ? resumeData.profile.url
        : '',
      website:
        resumeData.profile.url && !resumeData.profile.url.includes('linkedin')
          ? resumeData.profile.url
          : '',
    });

    // Update Professional Summary
    if (resumeData.profile.summary) {
      this.cvService.updateCVData({
        professionalSummary: resumeData.profile.summary,
      });
    }

    // Update Work Experience
    const experiences = resumeData.workExperience.map((exp) => ({
      jobTitle: exp.jobTitle || '',
      company: exp.company || '',
      location: '',
      startDate: this.extractStartDate(exp.date),
      endDate: this.extractEndDate(exp.date),
      isCurrent: this.isCurrentJob(exp.date),
      responsibilities: exp.descriptions.map((d) => d.trim()),
    }));
    this.cvService.updateCVData({ experiences });

    // Update Education
    const education = resumeData.education.map((edu) => ({
      degree: edu.degree || '',
      institution: edu.school || '',
      location: '',
      startDate: this.extractStartDate(edu.date),
      endDate: this.extractEndDate(edu.date),
      gpa: edu.gpa || '',
      achievements: edu.descriptions.map((d) => d.trim()),
    }));
    this.cvService.updateCVData({ education });

    // Update Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      this.cvService.updateCVData({ skills: resumeData.skills });
    }

    // Update Projects
    const projects = resumeData.projects.map((proj) => ({
      name: proj.name || '',
      description: proj.descriptions.join(' '),
      link: '',
      technologies: this.extractTechnologies(proj.descriptions),
    }));
    this.cvService.updateCVData({ projects });

    console.log('✅ CV data saved to service successfully!');
  }

  // Helper: Extract start date from date string
  private extractStartDate(dateStr: string): string {
    if (!dateStr) return '';

    // Try to match patterns like "Jan 2020 - Dec 2022" or "2020 - 2022"
    const match = dateStr.match(/(\w+\s+\d{4}|\d{4})/);
    if (match) {
      return this.formatDate(match[1]);
    }
    return '';
  }

  // Helper: Extract end date from date string
  private extractEndDate(dateStr: string): string {
    if (!dateStr) return '';

    // Check if it's current
    if (this.isCurrentJob(dateStr)) {
      return '';
    }

    // Try to match patterns like "Jan 2020 - Dec 2022"
    const match = dateStr.match(/-\s*(\w+\s+\d{4}|\d{4})/);
    if (match) {
      return this.formatDate(match[1]);
    }
    return '';
  }

  // Helper: Check if job is current
  private isCurrentJob(dateStr: string): boolean {
    return (
      dateStr.toLowerCase().includes('present') ||
      dateStr.toLowerCase().includes('current')
    );
  }

  // Helper: Format date to YYYY-MM format for month input
  private formatDate(dateStr: string): string {
    try {
      // Handle "Jan 2020" format
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      const parts = dateStr.trim().split(/\s+/);

      if (parts.length === 2) {
        // "Jan 2020" format
        const monthIndex = monthNames.findIndex((m) =>
          parts[0].toLowerCase().startsWith(m.toLowerCase())
        );
        if (monthIndex >= 0) {
          const month = String(monthIndex + 1).padStart(2, '0');
          return `${parts[1]}-${month}`;
        }
      } else if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
        // Just year "2020"
        return `${parts[0]}-01`;
      }

      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  // Helper: Extract technologies from descriptions
  private extractTechnologies(descriptions: string[]): string[] {
    const techKeywords = [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C#',
      'C++',
      'React',
      'Angular',
      'Vue',
      'Node.js',
      '.NET',
      'Spring',
      'SQL',
      'MongoDB',
      'PostgreSQL',
      'MySQL',
      'AWS',
      'Azure',
      'Docker',
      'Kubernetes',
      'Git',
    ];

    const found = new Set<string>();
    const text = descriptions.join(' ');

    techKeywords.forEach((tech) => {
      if (text.includes(tech)) {
        found.add(tech);
      }
    });

    return Array.from(found);
  }

  // [Keep all the existing parsing methods below - they remain unchanged]

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

        const bold = item.fontName?.includes('Bold') || false;
        const newLine = prevItem ? Math.abs(y - prevItem.y) > 5 : true;

        textItems.push({
          text: item.str,
          x1,
          x2,
          y,
          bold,
          newLine,
        });

        prevItem = { y };
      });
    }

    return textItems;
  }

  private groupTextItemsIntoLines(textItems: TextItem[]): Line[] {
    if (textItems.length === 0) return [];

    const totalWidth = textItems.reduce(
      (sum, item) => sum + (item.x2 - item.x1),
      0
    );
    const totalChars = textItems.reduce(
      (sum, item) => sum + item.text.length,
      0
    );
    const avgCharWidth = totalWidth / totalChars;

    const mergedItems: TextItem[] = [];
    let currentItem = { ...textItems[0] };

    for (let i = 1; i < textItems.length; i++) {
      const item = textItems[i];
      const distance = item.x1 - currentItem.x2;

      if (distance < avgCharWidth && Math.abs(item.y - currentItem.y) < 2) {
        currentItem.text += item.text;
        currentItem.x2 = item.x2;
      } else {
        mergedItems.push(currentItem);
        currentItem = { ...item };
      }
    }
    mergedItems.push(currentItem);

    const lines: Line[] = [];
    let currentLine: TextItem[] = [];
    let currentY = mergedItems[0].y;

    mergedItems.forEach((item) => {
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

    return lines.sort((a, b) => b.y - a.y);
  }

  private groupLinesIntoSections(lines: Line[]): Section[] {
    const sections: Section[] = [];
    const sectionKeywords = [
      'WORK EXPERIENCE',
      'EXPERIENCE',
      'EMPLOYMENT',
      'EDUCATION',
      'ACADEMIC',
      'SKILLS',
      'TECHNICAL SKILLS',
      'PROJECTS',
      'PROJECT',
      'CERTIFICATIONS',
      'CERTIFICATES',
    ];

    let currentSection: Section = { title: 'PROFILE', lines: [] };

    lines.forEach((line) => {
      const lineText = line.items
        .map((i) => i.text)
        .join('')
        .trim();
      const isSectionTitle = this.isSectionTitle(
        line,
        lineText,
        sectionKeywords
      );

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

  private isSectionTitle(
    line: Line,
    text: string,
    keywords: string[]
  ): boolean {
    if (
      line.items.length === 1 &&
      line.items[0].bold &&
      text === text.toUpperCase() &&
      text.length > 2
    ) {
      return true;
    }

    return keywords.some((keyword) => text.toUpperCase().includes(keyword));
  }

  private extractResumeFromSections(sections: Section[]): ResumeData {
    const resume: ResumeData = {
      profile: {
        name: '',
        email: '',
        phone: '',
        location: '',
        url: '',
        summary: '',
      },
      education: [],
      workExperience: [],
      projects: [],
      skills: [],
    };

    sections.forEach((section) => {
      const title = section.title.toUpperCase();

      if (title === 'PROFILE' || sections.indexOf(section) === 0) {
        resume.profile = this.extractProfile(section);
      } else if (title.includes('EDUCATION')) {
        resume.education = this.extractEducation(section);
      } else if (
        title.includes('WORK') ||
        title.includes('EXPERIENCE') ||
        title.includes('EMPLOYMENT')
      ) {
        resume.workExperience = this.extractWorkExperience(section);
      } else if (title.includes('PROJECT')) {
        resume.projects = this.extractProjects(section);
      } else if (title.includes('SKILL')) {
        resume.skills = this.extractSkills(section);
      }
    });

    return resume;
  }

  continueToNextStep(): void {
    this.cvService.setCurrentStep(2); // Navigate to Personal Info step
  }

  // [Keep all other existing methods: extractProfile, extractEducation,
  // extractWorkExperience, extractProjects, extractSkills, etc.]
  // These remain unchanged from your original code

  private extractProfile(section: Section): any {
    const allItems = section.lines.flatMap((line) => line.items);

    return {
      name: this.findBestMatch(allItems, this.nameFeatures.bind(this)),
      email: this.findBestMatch(allItems, this.emailFeatures.bind(this)),
      phone: this.findBestMatch(allItems, this.phoneFeatures.bind(this)),
      location: this.findBestMatch(allItems, this.locationFeatures.bind(this)),
      url: this.findBestMatch(allItems, this.urlFeatures.bind(this)),
      summary: this.findBestMatch(allItems, this.summaryFeatures.bind(this)),
    };
  }

  private findBestMatch(
    items: TextItem[],
    featureFunc: (text: string, item: TextItem) => number
  ): string {
    let bestScore = -Infinity;
    let bestText = '';

    items.forEach((item) => {
      const score = featureFunc(item.text, item);
      if (score > bestScore) {
        bestScore = score;
        bestText = item.text;
      }
    });

    return bestText;
  }

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
    if (text.includes('@') || text.includes('/') || /\d{3}/.test(text))
      score -= 4;
    return score;
  }

  private extractEducation(section: Section): any[] {
    const subsections = this.splitIntoSubsections(section.lines);
    return subsections.map((subsection) => {
      const items = subsection.flatMap((line) => line.items);
      const descriptions = this.extractDescriptions(subsection);

      return {
        school: this.findBestMatch(items, this.schoolFeatures.bind(this)),
        degree: this.findBestMatch(items, this.degreeFeatures.bind(this)),
        gpa: this.findBestMatch(items, this.gpaFeatures.bind(this)),
        date: this.findBestMatch(items, this.dateFeatures.bind(this)),
        descriptions,
      };
    });
  }

  private extractWorkExperience(section: Section): any[] {
    const subsections = this.splitIntoSubsections(section.lines);
    return subsections.map((subsection) => {
      const items = subsection.flatMap((line) => line.items);
      const descriptions = this.extractDescriptions(subsection);

      return {
        company: this.findBestMatch(items, this.companyFeatures.bind(this)),
        jobTitle: this.findBestMatch(items, this.jobTitleFeatures.bind(this)),
        date: this.findBestMatch(items, this.dateFeatures.bind(this)),
        descriptions,
      };
    });
  }

  private extractProjects(section: Section): any[] {
    const subsections = this.splitIntoSubsections(section.lines);
    return subsections.map((subsection) => {
      const items = subsection.flatMap((line) => line.items);
      const descriptions = this.extractDescriptions(subsection);

      return {
        name: this.findBestMatch(items, this.projectFeatures.bind(this)),
        date: this.findBestMatch(items, this.dateFeatures.bind(this)),
        descriptions,
      };
    });
  }

  private extractSkills(section: Section): string[] {
    const skills: string[] = [];
    section.lines.forEach((line) => {
      line.items.forEach((item) => {
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

    const gaps: number[] = [];
    for (let i = 1; i < lines.length; i++) {
      gaps.push(lines[i - 1].y - lines[i].y);
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const threshold = avgGap * 1.4;

    lines.forEach((line, index) => {
      if (index > 0) {
        const gap = lines[index - 1].y - line.y;
        const hasBoldItem = line.items.some((item) => item.bold);

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
    lines.forEach((line) => {
      const text = line.items
        .map((i) => i.text)
        .join(' ')
        .trim();
      if (text.startsWith('•') || text.startsWith('-')) {
        descriptions.push(text);
      }
    });
    return descriptions;
  }

  private schoolFeatures(text: string, item: TextItem): number {
    let score = 0;
    const keywords = ['University', 'College', 'School', 'Institute'];
    if (keywords.some((k) => text.includes(k))) score += 3;
    if (item.bold) score += 2;
    return score;
  }

  private degreeFeatures(text: string, item: TextItem): number {
    let score = 0;
    const keywords = [
      'Bachelor',
      'Master',
      'PhD',
      'Associate',
      'Degree',
      'Science',
      'Arts',
    ];
    if (keywords.some((k) => text.includes(k))) score += 3;
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
    if (/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(text))
      score += 2;
    if (/Spring|Summer|Fall|Winter/.test(text)) score += 2;
    if (text.includes('Present')) score += 2;
    if (text.includes('-')) score += 1;
    return score;
  }

  private jobTitleFeatures(text: string, item: TextItem): number {
    let score = 0;
    const keywords = [
      'Engineer',
      'Developer',
      'Manager',
      'Analyst',
      'Designer',
      'Intern',
      'Assistant',
      'Coordinator',
      'Specialist',
    ];
    if (keywords.some((k) => text.includes(k))) score += 3;
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
    if (jobKeywords.some((k) => text.includes(k))) score -= 2;
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
