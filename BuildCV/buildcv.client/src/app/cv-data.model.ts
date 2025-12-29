export interface CVData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: string[];
  selectedTheme?: string;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  website: string;
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
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  achievements: string[];
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