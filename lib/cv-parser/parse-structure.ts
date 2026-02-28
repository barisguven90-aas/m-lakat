import { aiJSON } from '@/lib/ai/client';

export interface ParsedCVData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin_url?: string;
  };
  experience: {
    company: string;
    title: string;
    start_date: string;
    end_date: string;
    description: string;
    achievements: string[];
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    start_date: string;
    end_date: string;
  }[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
}

export async function parseCVStructure(cvText: string): Promise<ParsedCVData> {
  const prompt = `You are an expert CV parser. Extract structured data from the following CV text.
    
CV TEXT:
${cvText.slice(0, 50000)}

Return JSON with this exact structure:
{
  "personal": { "name": "", "email": "", "phone": "", "location": "", "linkedin_url": "" },
  "experience": [{ "company": "", "title": "", "start_date": "YYYY-MM", "end_date": "YYYY-MM or Present", "description": "", "achievements": [""] }],
  "education": [{ "school": "", "degree": "", "field": "", "start_date": "", "end_date": "" }],
  "skills": { "technical": [""], "soft": [""], "languages": [""] },
  "projects": [{ "name": "", "description": "", "technologies": [""] }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }]
}`;

  try {
    return await aiJSON<ParsedCVData>(
      prompt,
      'You are an expert CV parser. Always respond with valid JSON.',
      { maxTokens: 4000 }
    );
  } catch (error) {
    console.error('Error parsing CV structure:', error);
    throw new Error('Failed to parse CV structure');
  }
}
