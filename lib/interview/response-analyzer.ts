import { aiJSON } from '@/lib/ai/client';

export interface ResponseAnalysis {
    score: number; // 0-100
    feedback: string;
    isStrong: boolean;
    improvementTip?: string;
}

export async function analyzeResponse(
    question: string,
    answer: string,
    interviewType: string,
    language: 'en' | 'tr' = 'en'
): Promise<ResponseAnalysis> {

    // Mock Mode
    if (process.env.MOCK_AI === 'true') {
        await new Promise(r => setTimeout(r, 500));
        const score = Math.floor(Math.random() * 35) + 55;
        const isStrong = score >= 70;
        return {
            score,
            feedback: isStrong
                ? (language === 'tr' ? "Güçlü bir cevap, açık ifadeler içeriyor." : "Good answer with clear examples.")
                : (language === 'tr' ? "Cevap daha spesifik örneklerle güçlendirilebilir." : "Answer could be more specific."),
            isStrong,
            improvementTip: language === 'tr' ? "STAR yöntemini deneyin." : "Try the STAR method."
        };
    }

    const prompt = `Analyze the candidate's response to the interview question.
IMPORTANT: Generate your evaluation entirely in the language corresponding to language code '${language}'.
    
Interview Type: ${interviewType}
Question: "${question}"
Candidate Answer: "${answer}"

Evaluate: Relevance, Clarity, ${interviewType === 'hr_behavioral' ? 'STAR method usage' : 'Technical accuracy'}

Return valid JSON in this exact structure, with the string values written in language code '${language}':
{"score": <number 0-100>, "feedback": "<Short feedback sentence>", "isStrong": <boolean>, "improvementTip": "<One brief tip>"}`;

    try {
        return await aiJSON<ResponseAnalysis>(
            prompt,
            'You are an interview evaluation expert. Always respond with valid JSON.',
            { maxTokens: 400 }
        );
    } catch (error) {
        console.error('Response Analysis Error:', error);
        return {
            score: 50,
            feedback: language === 'tr' ? "Cevap analiz edilemedi." : "Could not analyze response.",
            isStrong: true,
        };
    }
}
