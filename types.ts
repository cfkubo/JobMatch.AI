
export interface JobSearchParams {
  jobTitle: string;
  company: string; // Manual override
  location: string;
  targetCompanies: string[]; // List of specific companies to target
  useTargetedSearch: boolean; // Toggle for strategy
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  matchScore: number; // 0 to 100
  matchReasoning: string;
  applyLink?: string;
  isDirectLink?: boolean; // True if it's a verified direct URL, false if it's a fallback search
  salary?: string;
  postedDate?: string;
}

export interface ResumeData {
  summary: string;
  skills: string[];
  suggestedJobTitle: string; 
  candidateLocation: string; // Extracted from resume contact info
  pastCompanies: string[]; // Extracted from resume
  suggestedTargetCompanies: string[]; // AI recommended similar companies
  rawText?: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  SEARCH = 'SEARCH',
}