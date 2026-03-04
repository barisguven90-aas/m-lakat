import { aiJSON } from '@/lib/ai/client';

export interface QuestionFeedback {
    question: string;
    answer: string;
    score: number;
    ai_commentary: string;
    what_was_good: string;
    what_to_improve: string;
    ideal_answer_hint: string;
}

export interface StrengthDetail {
    title: string;
    description: string;
    evidence: string;
}

export interface WeaknessDetail {
    title: string;
    description: string;
    suggestion: string;
    severity: 'critical' | 'moderate' | 'minor';
}

export interface FeedbackReport {
    job_match_score: number;
    star_methodology_score: number;
    clarity_score: number;
    confidence_score: number;
    relevance_score: number;
    strengths: string[];
    weaknesses: string[];
    high_risk_areas: string[];
    improvement_actions: string[];
    summary_text: string;
    question_feedbacks: QuestionFeedback[];
    detailed_strengths: StrengthDetail[];
    detailed_weaknesses: WeaknessDetail[];
    ai_coach_commentary: string;
    practice_recommendations: string[];
}

// ─── TYPE-SPECIFIC FEEDBACK CRITERIA ───

const TYPE_FEEDBACK_PROMPTS: Record<string, string> = {
    technical: `
INTERVIEW TYPE: TECHNICAL
EVALUATION CRITERIA (Score based on THESE, not behavioral skills):
- **job_match_score** → How well does the candidate's TECHNICAL knowledge match the job requirements? Do they know the right technologies, frameworks, and concepts?
- **star_methodology_score** → RENAME this mentally to "Problem-Solving Score". Evaluate HOW they approach problems: do they break down complex problems? Think about edge cases? Consider trade-offs?
- **clarity_score** → How clearly do they explain technical concepts? Can they communicate complex ideas simply?
- **confidence_score** → How confident are they in their technical knowledge? Do they admit when they don't know something (which is good) vs. bluffing?
- **relevance_score** → Are their technical answers relevant to the specific job and its tech stack?

WHAT TO EVALUATE IN EACH ANSWER:
- Depth of technical knowledge
- Problem-solving approach and methodology
- Understanding of trade-offs and scalability
- Code quality awareness, best practices, testing
- System design thinking
- Knowledge of specific technologies mentioned in the job description

DO NOT evaluate soft skills, teamwork, or behavioral competencies. This is a TECHNICAL assessment.`,

    language: `
INTERVIEW TYPE: LANGUAGE PROFICIENCY
EVALUATION CRITERIA (Score based on LANGUAGE ABILITY, not job knowledge):
- **job_match_score** → RENAME this mentally to "Overall Language Score". How proficient is the candidate overall in the interview language?
- **star_methodology_score** → RENAME to "Grammar & Structure Score". Evaluate grammar accuracy, sentence structure, proper tense usage, article usage.
- **clarity_score** → How clearly and coherently do they express their ideas? Is their speech/writing organized and easy to follow?
- **confidence_score** → RENAME to "Fluency Score". How smoothly do they communicate? Are there excessive pauses, filler words, or hesitations?
- **relevance_score** → RENAME to "Vocabulary Score". How rich and varied is their vocabulary? Do they use appropriate professional terms?

WHAT TO EVALUATE IN EACH ANSWER:
- Grammar accuracy (tenses, articles, prepositions)
- Vocabulary range and appropriateness
- Fluency and natural expression
- Coherence and organization of ideas
- Professional communication ability
- Pronunciation descriptions (if relevant from transcript)

DO NOT evaluate their job-specific knowledge or technical skills. This is a LANGUAGE assessment.`,

    hr_behavioral: `
INTERVIEW TYPE: BEHAVIORAL / HR
EVALUATION CRITERIA:
- **job_match_score** → How well does the candidate's experience and background match the role?
- **star_methodology_score** → Did they use the STAR method effectively? (Situation, Task, Action, Result)
- **clarity_score** → How clearly did they communicate their experiences and ideas?
- **confidence_score** → How confident and authentic did they appear? Were they honest about weaknesses?
- **relevance_score** → Were their examples and stories relevant to the questions asked?

WHAT TO EVALUATE IN EACH ANSWER:
- Use of STAR method (specific situations, not generic statements)
- Cultural fit and alignment with company values
- Soft skills: leadership, teamwork, conflict resolution, adaptability
- Self-awareness and growth mindset
- Motivation and genuine interest in the role
- Professional communication and interpersonal skills

DO NOT evaluate technical knowledge or coding ability. This is a BEHAVIORAL assessment.`
};

export async function generateComprehensiveFeedback(
    interviewType: string,
    jobData: any,
    cvData: any,
    turns: any[]
): Promise<FeedbackReport> {

    // Mock Mode
    if (process.env.MOCK_AI === 'true') {
        await new Promise(r => setTimeout(r, 1000));
        const score = () => Math.floor(Math.random() * 25) + 65;
        return {
            job_match_score: score(),
            star_methodology_score: score(),
            clarity_score: score(),
            confidence_score: score(),
            relevance_score: score(),
            strengths: ["Demonstrated clear articulation.", "Showed enthusiasm.", "Provided relevant examples."],
            weaknesses: ["Answers lacked metrics.", "Could use STAR more.", "Some hesitation."],
            high_risk_areas: ["Salary expectations not addressed.", "Gap in required tools."],
            improvement_actions: ["Prepare 3 STAR stories.", "Research company news.", "Practice 2-min answers."],
            summary_text: `Solid communication skills for the ${jobData?.job_title || 'target'} role.`,
            question_feedbacks: turns.map((t) => ({
                question: t.question_text, answer: t.response_text, score: score(),
                ai_commentary: "Mock analysis.", what_was_good: "Attempted to answer.",
                what_to_improve: "More specific examples.", ideal_answer_hint: "Use STAR method."
            })),
            detailed_strengths: [
                { title: "Communication", description: "Clear and concise.", evidence: "Well-structured answers." },
                { title: "Enthusiasm", description: "Genuine interest.", evidence: "Positive language." }
            ],
            detailed_weaknesses: [
                { title: "Specificity", description: "Needs concrete examples.", suggestion: "Prepare 3-5 STAR stories.", severity: 'moderate' },
                { title: "Metrics", description: "No quantifiable results.", suggestion: "Include numbers.", severity: 'critical' }
            ],
            ai_coach_commentary: "Promising performance with room for improvement.",
            practice_recommendations: ["Practice STAR method", "Research company", "Prepare interviewer questions"]
        };
    }

    const typeLabel = interviewType === 'technical' ? 'Technical' : interviewType === 'language' ? 'Language Proficiency' : 'Behavioral/HR';
    const typePrompt = TYPE_FEEDBACK_PROMPTS[interviewType] || TYPE_FEEDBACK_PROMPTS.hr_behavioral;

    const prompt = `You are a world-class interview coach analyzing a mock interview session.

INTERVIEW CONTEXT:
Type: ${typeLabel}
Job: ${jobData?.job_title || 'Unknown'} at ${jobData?.job_company || 'Unknown'}
Job Description: ${jobData?.job_description?.slice(0, 3000) || 'N/A'}

${typePrompt}

CANDIDATE:
${JSON.stringify(cvData?.personal || {}, null, 2)}
Skills: ${JSON.stringify(cvData?.skills || [])}
Experience: ${JSON.stringify(cvData?.experience?.slice(0, 3) || [])}

TRANSCRIPT (${turns.length} questions):
${turns.map((t: any, i: number) => `Q${i + 1}: "${t.question_text}"\nA${i + 1}: "${t.response_text}"`).join('\n\n')}

TONE & STYLE:
- Be extremely constructive, empathetic, and professional. 
- Write like a supportive human mentor, not a robot.
- If the candidate gave a weak answer, gently explain why and what a better answer looks like.
- Keep "what_was_good" genuinely positive. Keep "what_to_improve" actionable and encouraging.
- The "ideal_answer_hint" should be a DETAILED 2-3 sentence model answer that specifically addresses the question.

IMPORTANT: Your evaluation must be SPECIFIC to the interview type (${typeLabel}). 
${interviewType === 'technical' ? 'Evaluate ONLY technical competency. Ignore soft skills.' : ''}
${interviewType === 'language' ? 'Evaluate ONLY language proficiency. Ignore job-specific knowledge.' : ''}
${interviewType === 'hr_behavioral' ? 'Evaluate ONLY behavioral competencies and soft skills.' : ''}

Return JSON with:
{
  "job_match_score": 0-100, "star_methodology_score": 0-100, "clarity_score": 0-100,
  "confidence_score": 0-100, "relevance_score": 0-100,
  "question_feedbacks": [{"question":"..","answer":"..","score":0-100,"ai_commentary":"..","what_was_good":"..","what_to_improve":"..","ideal_answer_hint":".."}],
  "detailed_strengths": [{"title":"..","description":"..","evidence":".."}],
  "detailed_weaknesses": [{"title":"..","description":"..","suggestion":"..","severity":"critical|moderate|minor"}],
  "strengths": [".."], "weaknesses": [".."], "high_risk_areas": [".."],
  "improvement_actions": [".."], "ai_coach_commentary": "4-6 sentences, start with encouraging greeting.",
  "practice_recommendations": [".."], "summary_text": "3-4 sentences, professional and encouraging."
}

LANGUAGE: Write ALL text in the same language the candidate used in their answers.
Provide ${turns.length} question_feedbacks, 3-5 strengths/weaknesses. Be specific to THIS candidate and THIS interview type.`;

    try {
        return await aiJSON<FeedbackReport>(
            prompt,
            'You are an expert interview coach. Always respond with valid JSON.',
            { maxTokens: 6000 }
        );
    } catch (error) {
        console.error('Feedback Generation Error:', error);
        throw new Error('Failed to generate feedback report');
    }
}
