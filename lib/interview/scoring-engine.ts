import { aiJSON } from '@/lib/ai/client';

// ─── Scoring Weights (Intervio Spec) ───
export const SCORE_WEIGHTS = {
    cv_match: 0.25,
    technical: 0.30,
    communication: 0.15,
    confidence: 0.10,
    behavioral: 0.20,
};

export interface ScoreBreakdown {
    cv_match: number;        // 0–100
    technical: number;       // 0–100
    communication: number;   // 0–100
    confidence: number;      // 0–100
    behavioral: number;      // 0–100
}

export interface InterviewScore {
    final_score: number;              // 0–100 weighted
    hire_probability: number;         // 0–100 percent
    breakdown: ScoreBreakdown;
    feedback_summary: string;
}

// ─── Hire Probability Formula (Intervio Spec) ───
export function calcHireProbability(score: number): number {
    if (score >= 85) return Math.round(score * 0.92);
    if (score >= 70) return Math.round(score * 0.85);
    if (score >= 50) return Math.round(score * 0.75);
    return Math.round(score * 0.60);
}

// ─── Weighted Final Score ───
export function calcFinalScore(breakdown: ScoreBreakdown): number {
    return Math.round(
        breakdown.cv_match * SCORE_WEIGHTS.cv_match +
        breakdown.technical * SCORE_WEIGHTS.technical +
        breakdown.communication * SCORE_WEIGHTS.communication +
        breakdown.confidence * SCORE_WEIGHTS.confidence +
        breakdown.behavioral * SCORE_WEIGHTS.behavioral
    );
}

// ─── Per-turn quick score (used during interview) ───
export interface TurnScore {
    score: number;       // 0–100
    feedback: string;
    isStrong: boolean;
    technical_score?: number;
    communication_score?: number;
    behavioral_score?: number;
    confidence_score?: number;
}

export async function scoreTurn(
    question: string,
    answer: string,
    questionType: 'opening' | 'technical' | 'behavioral' | 'follow_up' | 'closing',
    jobTitle: string,
    language: 'en' | 'tr' = 'en'
): Promise<TurnScore> {
    if (process.env.MOCK_AI === 'true') {
        const s = Math.floor(Math.random() * 35) + 55;
        return { score: s, feedback: 'Good answer.', isStrong: s >= 70, technical_score: s, communication_score: s, behavioral_score: s, confidence_score: s };
    }

    const langNote = language === 'tr' ? 'IMPORTANT: You MUST respond ENTIRELY in Turkish. Do not use any English. Bütün geri bildirimleri %100 Türkçe yaz.' : 'IMPORTANT: You MUST respond ENTIRELY in English. Do not use any Turkish.';

    const prompt = `You are an expert interview evaluator for the role: "${jobTitle}".
Evaluate the candidate's answer to the interview question below.
${langNote}

Question Type: ${questionType}
Question: "${question}"
Candidate Answer: "${answer}"

Score each dimension 0–100 based on the answer quality:
- technical_score: Technical accuracy, depth, use of correct concepts (if not a technical question, score based on role relevance)
- communication_score: Clarity, structure, conciseness of the response
- behavioral_score: Evidence of past experience, STAR method, problem-solving mindset
- confidence_score: Assertiveness, certainty, avoiding excessive hedging

Return ONLY valid JSON:
{
  "score": <overall 0-100>,
  "feedback": "<2-sentence feedback strictly in ${language === 'tr' ? 'Turkish (Türkçe)' : 'English'}>",
  "isStrong": <true if score >= 70>,
  "technical_score": <0-100>,
  "communication_score": <0-100>,
  "behavioral_score": <0-100>,
  "confidence_score": <0-100>
}`;

    try {
        return await aiJSON<TurnScore>(prompt, 'Interview evaluator. Return valid JSON only.', { maxTokens: 300 });
    } catch {
        return { score: 50, feedback: language === 'tr' ? 'Cevap analiz edilemedi.' : 'Could not analyze.', isStrong: false };
    }
}

// ─── Final comprehensive scoring (called at interview end) ───
export async function computeFinalScore(params: {
    turns: Array<{ question: string; answer: string; question_type: string; analysis?: any }>;
    cvMatchScore: number;          // 0–100, from matching module
    jobTitle: string;
    language: 'en' | 'tr';
}): Promise<InterviewScore> {
    const { turns, cvMatchScore, jobTitle, language } = params;

    // Aggregate turn scores
    const validTurns = turns.filter(t => t.analysis?.score);
    const avg = (key: string) => {
        const vals = validTurns.map(t => t.analysis?.[key] || t.analysis?.score || 50).filter(Boolean);
        return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 60;
    };

    const breakdown: ScoreBreakdown = {
        cv_match: Math.min(100, Math.max(0, cvMatchScore)),
        technical: avg('technical_score'),
        communication: avg('communication_score'),
        confidence: avg('confidence_score'),
        behavioral: avg('behavioral_score'),
    };

    const final_score = calcFinalScore(breakdown);
    const hire_probability = calcHireProbability(final_score);

    // Generate AI feedback summary
    let feedback_summary = '';
    try {
        const langNote = language === 'tr' 
            ? 'IMPORTANT: You MUST respond ENTIRELY in Turkish (Türkçe). No English headers, no English words. Bütün raporu %100 Türkçe yaz.' 
            : 'IMPORTANT: You MUST respond ENTIRELY in English. No Turkish words.';
        const summaryPrompt = `Based on this interview performance for "${jobTitle}":
CV Match: ${breakdown.cv_match}/100
Technical: ${breakdown.technical}/100
Communication: ${breakdown.communication}/100
Confidence: ${breakdown.confidence}/100
Behavioral: ${breakdown.behavioral}/100
Final Score: ${final_score}/100
Hire Probability: ${hire_probability}%

${langNote} Write a 2-3 sentence professional feedback summary highlighting strengths and what to improve. Be specific and encouraging.`;

        feedback_summary = await aiJSON<string>(
            summaryPrompt,
            `Return ONLY a JSON string: {"summary": "<feedback text>"}`,
            { maxTokens: 200 }
        ).then((r: any) => r?.summary || '').catch(() => '');
    } catch { /* non-critical */ }

    if (!feedback_summary) {
        feedback_summary = language === 'tr'
            ? `Mülakat puanınız ${final_score}/100 olarak hesaplandı. İşe alınma ihtimaliniz yaklaşık %${hire_probability} olarak tahmin edilmektedir.`
            : `Your interview score is ${final_score}/100. Estimated hire probability is ${hire_probability}%.`;
    }

    return { final_score, hire_probability, breakdown, feedback_summary };
}
