export interface CVData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  experiences: Experience[];
  education: Education[];
  skills: SkillEntry[];
  projects: Project[];
  certifications: Certification[];
  languages: LanguageEntry[];
  hobbies?: string[];
  references?: Reference[];
  selectedTheme?: string;
  photoUrl?: string; 
}

export interface SkillEntry {
  name: string;
  level?: number; // 1-5 scale
  levelPercent?: number; // legacy support
}

export interface LanguageEntry {
  name: string;
  level?: number; // 1-5 scale
  levelPercent?: number; // legacy support
}

export interface Reference { 
  name: string;
  position: string;
  phone: string;
  email?: string;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  website: string;
  photoUrl?: string;
  title?: string;
  profession?: string;
  links?: string[];
}

export interface Experience {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  isCurrent?: boolean;  // Added isCurrent property
  achievements?: string[];
}

export interface Project {
  name: string;
  description: string;
  link: string;
  technologies: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  previewImage: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}