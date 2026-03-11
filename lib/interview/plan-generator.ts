import { aiJSON } from '@/lib/ai/client';

export interface InterviewPlan {
    focus_skills: string[];
    matching_skills: string[];
    missing_skills: string[];
    experience_match_score: number;       // 0–100
    technical_questions: string[];        // 3–4 questions
    behavioral_questions: string[];       // 2–3 questions
    cv_based_questions: string[];         // 1–2 questions from CV
    gap_questions: string[];              // 1–2 questions about missing skills
    stages: InterviewStage[];
}

export interface InterviewStage {
    stage_number: number;
    name: 'greeting' | 'background' | 'technical' | 'follow_up' | 'behavioral' | 'candidate_questions' | 'closing';
    label: string;
    question_count: number;
}

// The 7-stage interview structure per Intervio spec
const INTERVIEW_STAGES: InterviewStage[] = [
    { stage_number: 1, name: 'greeting', label: 'Karşılama', question_count: 1 },
    { stage_number: 2, name: 'background', label: 'Geçmiş', question_count: 2 },
    { stage_number: 3, name: 'technical', label: 'Teknik', question_count: 3 },
    { stage_number: 4, name: 'follow_up', label: 'Derinleştirme', question_count: 1 },
    { stage_number: 5, name: 'behavioral', label: 'Davranışsal', question_count: 2 },
    { stage_number: 6, name: 'candidate_questions', label: 'Aday Soruları', question_count: 0 },
    { stage_number: 7, name: 'closing', label: 'Kapanış', question_count: 1 },
];

export async function generateInterviewPlan(params: {
    jobTitle: string;
    jobDescription: string;
    requiredSkills?: string[];
    cvData: any;
    language: 'en' | 'tr';
}): Promise<InterviewPlan> {
    const { jobTitle, jobDescription, requiredSkills, cvData, language } = params;

    if (process.env.MOCK_AI === 'true') {
        return {
            focus_skills: ['React', 'TypeScript'],
            matching_skills: ['React', 'Node.js'],
            missing_skills: ['GraphQL'],
            experience_match_score: 72,
            technical_questions: [
                'How do you optimize React performance?',
                'Explain TypeScript generics.',
                'How would you design a REST API?'
            ],
            behavioral_questions: [
                'Tell me about a challenging project.',
                'How do you handle tight deadlines?'
            ],
            cv_based_questions: ['You worked at X — what was your biggest achievement there?'],
            gap_questions: ['You don\'t list GraphQL. How quickly could you learn it?'],
            stages: INTERVIEW_STAGES,
        };
    }

    const cvSummary = JSON.stringify(cvData || {}).slice(0, 1500);
    const jobSlice = jobDescription?.slice(0, 2000) || '';
    const langNote = language === 'tr'
        ? 'All question strings MUST be in Turkish.'
        : 'All question strings MUST be in English.';

    const prompt = `You are a senior recruiter preparing an interview for the role: "${jobTitle}".

JOB DESCRIPTION:
${jobSlice}

CANDIDATE CV DATA:
${cvSummary}

REQUIRED SKILLS (from job posting):
${(requiredSkills || []).join(', ') || 'Not specified'}

${langNote}

Analyze the CV against the job requirements and create a structured interview plan.

Return ONLY valid JSON matching this exact structure:
{
  "focus_skills": ["skill1", "skill2"],
  "matching_skills": ["skill1"],
  "missing_skills": ["skill2"],
  "experience_match_score": <number 0-100>,
  "technical_questions": ["question1", "question2", "question3"],
  "behavioral_questions": ["question1", "question2"],
  "cv_based_questions": ["question1"],
  "gap_questions": ["question1"]
}

Rules:
- technical_questions: 3–4 questions focused on job-required technical skills
- behavioral_questions: 2–3 "Tell me about a time..." questions
- cv_based_questions: 1–2 questions specifically referencing the candidate's past (projects, roles, achievements)
- gap_questions: 1–2 questions about skills the candidate LACKS from the job requirements
- All questions must be specific to THIS job and THIS candidate, not generic
- experience_match_score: score 0-100 based on how well the CV matches the job requirements`;

    try {
        const plan = await aiJSON<Omit<InterviewPlan, 'stages'>>(
            prompt,
            'You are an expert recruiter creating structured interview plans. Return valid JSON only.',
            { maxTokens: 800 }
        );
        return { ...plan, stages: INTERVIEW_STAGES };
    } catch (error) {
        console.error('Interview Plan Generation Error:', error);
        // Fallback plan
        return {
            focus_skills: requiredSkills?.slice(0, 3) || [],
            matching_skills: [],
            missing_skills: [],
            experience_match_score: 60,
            technical_questions: [
                language === 'tr'
                    ? `${jobTitle} pozisyonu için teknik yetkinliklerinizi anlatın.`
                    : `Describe your technical skills relevant to the ${jobTitle} role.`
            ],
            behavioral_questions: [
                language === 'tr'
                    ? 'Zorlu bir proje deneyiminizden bahsedin.'
                    : 'Tell me about a challenging project experience.'
            ],
            cv_based_questions: [],
            gap_questions: [],
            stages: INTERVIEW_STAGES,
        };
    }
}

// Determine which stage a turn belongs to (based on turn number)
export function getTurnStage(turnNumber: number): InterviewStage['name'] {
    if (turnNumber === 1) return 'greeting';
    if (turnNumber <= 3) return 'background';
    if (turnNumber <= 6) return 'technical';
    if (turnNumber === 7) return 'follow_up';
    if (turnNumber <= 9) return 'behavioral';
    if (turnNumber === 10) return 'closing';
    return 'follow_up';
}

// Get the question to ask from the plan based on turn stage
export function getNextQuestionFromPlan(plan: InterviewPlan, turnNumber: number): string | null {
    const stage = getTurnStage(turnNumber);

    switch (stage) {
        case 'technical':
            return plan.technical_questions[(turnNumber - 4) % plan.technical_questions.length] || null;
        case 'behavioral':
            return plan.behavioral_questions[(turnNumber - 8) % plan.behavioral_questions.length] || null;
        case 'follow_up':
            return plan.gap_questions[0] || plan.cv_based_questions[0] || null;
        default:
            return null;
    }
}
