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

    const prompt = `You are a world-class interview coach analyzing a mock interview session.

INTERVIEW CONTEXT:
Type: ${interviewType}
Job: ${jobData?.job_title || 'Unknown'} at ${jobData?.job_company || 'Unknown'}
Job Description: ${jobData?.job_description?.slice(0, 3000) || 'N/A'}

CANDIDATE:
${JSON.stringify(cvData?.personal || {}, null, 2)}
Skills: ${JSON.stringify(cvData?.skills || [])}
Experience: ${JSON.stringify(cvData?.experience?.slice(0, 3) || [])}

TRANSCRIPT (${turns.length} questions):
${turns.map((t: any, i: number) => `Q${i + 1}: "${t.question_text}"\nA${i + 1}: "${t.response_text}"`).join('\n\n')}

TONE & STYLE:
- Be extremely constructive, empathetic, and professional. 
- Avoid being overly harsh or robotic. Write like a supportive human mentor.
- If the candidate gave a short or joke answer, gently and constructively explain why a real interview requires more detail, rather than just stating "failed to provide an answer." Highlight any potential they showed.
- Keep "what_was_good" genuinely positive (find something good, even if it's just their confidence or brevity), and "what_to_improve" actionable and encouraging.

Return JSON with:
{
  "job_match_score": 0-100, "star_methodology_score": 0-100, "clarity_score": 0-100,
  "confidence_score": 0-100, "relevance_score": 0-100,
  "question_feedbacks": [{"question":"..","answer":"..","score":0-100,"ai_commentary":"..","what_was_good":"..","what_to_improve":"..","ideal_answer_hint":".."}],
  "detailed_strengths": [{"title":"..","description":"..","evidence":".."}],
  "detailed_weaknesses": [{"title":"..","description":"..","suggestion":"..","severity":"critical|moderate|minor"}],
  "strengths": [".."], "weaknesses": [".."], "high_risk_areas": [".."],
  "improvement_actions": [".."], "ai_coach_commentary": "4-6 sentences, starting with an encouraging human greeting.",
  "practice_recommendations": [".."], "summary_text": "3-4 sentences, professional and encouraging."
}

LANGUAGE: Write ALL text in the same language the candidate used in their answers.
Provide ${turns.length} question_feedbacks, 3-5 strengths/weaknesses. Be specific to THIS candidate.`;

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
