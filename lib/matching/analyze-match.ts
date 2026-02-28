import { aiJSON } from '@/lib/ai/client';
import { LinkedInJobData } from '@/lib/apify/types';
import { ParsedCVData } from '@/lib/cv-parser/parse-structure';

export interface MatchAnalysisResult {
  match_score: number;
  strengths: { title: string; description: string; relevance: 'high' | 'medium' | 'low'; }[];
  gaps: { title: string; description: string; severity: 'critical' | 'moderate' | 'minor'; suggestion: string; }[];
  risks: string[];
  summary: string;
  ai_job_review: {
    overview: string;
    company_culture_hints: string[];
    role_expectations: string[];
    salary_range_hint?: string;
  };
  interview_tips: { title: string; description: string; priority: 'must' | 'should' | 'nice'; }[];
  candidate_profile_highlights: {
    total_experience_years: number;
    key_skills: string[];
    notable_achievements: string[];
    education_summary: string;
    career_trajectory: string;
  };
}

export async function analyzeJobCVMatch(
  jobData: LinkedInJobData,
  cvData: ParsedCVData,
): Promise<MatchAnalysisResult> {

  const prompt = `Analyze the match between this Job Description and Candidate Profile in detail.

JOB DESCRIPTION:
Title: ${jobData.title}
Company: ${jobData.companyName}
Location: ${jobData.location || 'N/A'}
Employment Type: ${jobData.employmentType || 'N/A'}
Seniority: ${jobData.seniorityLevel || 'N/A'}
Description: ${jobData.description.slice(0, 12000)}

CANDIDATE:
${JSON.stringify(cvData, null, 2)}

Return JSON:
{
  "match_score": 0-100,
  "strengths": [{"title":"..","description":"..","relevance":"high|medium|low"}],
  "gaps": [{"title":"..","description":"..","severity":"critical|moderate|minor","suggestion":".."}],
  "risks": [".."],
  "summary": "3-4 sentences",
  "ai_job_review": {"overview":"..","company_culture_hints":[".."],"role_expectations":[".."],"salary_range_hint":".."},
  "interview_tips": [{"title":"..","description":"..","priority":"must|should|nice"}],
  "candidate_profile_highlights": {"total_experience_years":0,"key_skills":[".."],"notable_achievements":[".."],"education_summary":"..","career_trajectory":".."}
}

Provide 3-5 strengths, 3-5 gaps, 5-7 interview tips. Be specific to this candidate and role.`;

  try {
    return await aiJSON<MatchAnalysisResult>(
      prompt,
      'You are a senior career coach and HR consultant. Always respond with valid JSON.',
      { maxTokens: 4000 }
    );
  } catch (error) {
    console.error('Error analyzing match:', error);
    throw new Error('Failed to analyze job match');
  }
}
