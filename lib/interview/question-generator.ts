import { aiChat } from '@/lib/ai/client';

export interface QuestionContext {
    interviewType: 'hr_behavioral' | 'technical' | 'language';
    jobTitle: string;
    companyName: string;
    jobRequirements: any;
    cvData: any;
    previousTurns: { role: 'assistant' | 'user'; content: string }[];
    language?: string;
    companyStyle?: 'standard' | 'google' | 'amazon' | 'startup' | 'corporate';
}

const COMPANY_STYLE_PROMPTS: Record<string, string> = {
    standard: 'Use a standard, professional interview style with a mix of behavioral and situational questions.',
    google: `Use Google's interview style: Focus on system design thinking, scalability, and algorithmic problem-solving. 
    Ask "Tell me about a time..." questions that reveal data-driven decision making. 
    Probe for depth with "Why?" and "What would you do differently?". Googliness and leadership matters.`,
    amazon: `Use Amazon's Leadership Principles interview style. Reference these principles explicitly: 
    Customer Obsession, Ownership, Invent & Simplify, Bias for Action, Earn Trust, Deliver Results.
    Ask for specific past examples (STAR format). Press for data and metrics.`,
    startup: `Use a startup interview style: Fast-paced, entrepreneurial mindset focus.
    Ask about wearing multiple hats, dealing with ambiguity, MVPs, and "what would you do on day 1?".
    Assess hustle, adaptability, and passion for the mission.`,
    corporate: `Use a structured corporate interview style: Formal, process-oriented, compliance-aware.
    Ask about working in cross-functional teams, stakeholder management, and project documentation.`
};

const LANGUAGE_INSTRUCTIONS: Record<string, { instruction: string; initial: string; fallback: string }> = {
    en: { instruction: 'Conduct the entire interview strictly in English.', initial: 'Candidate has entered the room. Welcome them and ask them to introduce themselves.', fallback: 'Could you tell me more about your background?' },
    tr: { instruction: 'Mülakatı tamamen Türkçe olarak yürüt. Samimi ama profesyonel bir dil kullan.', initial: 'Aday odaya girdi. Mülakata başla — kısa bir karşılama yap ve kendisini tanıtmasını iste.', fallback: 'Geçmişiniz hakkında biraz daha bilgi verebilir misiniz?' },
    es: { instruction: 'Conduct the entire interview strictly in Spanish (Español).', initial: 'Candidate has entered the room. Welcome them and ask them to introduce themselves in Spanish.', fallback: '¿Podrías contarme más sobre tu experiencia?' },
    fr: { instruction: 'Conduct the entire interview strictly in French (Français).', initial: 'Candidate has entered the room. Welcome them and ask them to introduce themselves in French.', fallback: 'Pourriez-vous m\'en dire plus sur votre parcours ?' },
    de: { instruction: 'Conduct the entire interview strictly in German (Deutsch).', initial: 'Candidate has entered the room. Welcome them and ask them to introduce themselves in German.', fallback: 'Können Sie mir mehr über Ihren Werdegang erzählen?' },
    zh: { instruction: 'Conduct the entire interview strictly in Mandarin Chinese (中文).', initial: 'Candidate has entered the room. Welcome them and ask them to introduce themselves in Mandarin Chinese.', fallback: '你能多谈谈你的背景吗？' }
};

export async function generateQuestion(context: QuestionContext) {
    const {
        interviewType, jobTitle, companyName, jobRequirements, cvData, previousTurns,
        language = 'en',
        companyStyle = 'standard'
    } = context;

    const langLabel = language === 'tr' ? 'Türkçe' : language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : language === 'zh' ? 'Chinese' : 'Language';

    const roleDescription = interviewType === 'technical'
        ? 'Senior Engineering Manager or Tech Lead'
        : interviewType === 'language'
            ? `${langLabel} Language Proficiency Assessor`
            : 'Senior Talent Acquisition Partner';

    const companyStyleGuide = COMPANY_STYLE_PROMPTS[companyStyle] || COMPANY_STYLE_PROMPTS.standard;
    const langConfig = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;
    const languageInstruction = langConfig.instruction;

    const systemPrompt = `You are acting as a ${roleDescription} at ${companyName}.
You are currently interviewing a candidate for the ${jobTitle} position.

LANGUAGE: ${languageInstruction}
COMPANY INTERVIEW STYLE: ${companyStyleGuide}

YOUR GOAL: Conduct a realistic, high-quality interview. Your questions should be challenging but fair.

INTERVIEW STYLE & TONE:
1. Conversational & Human: Speak like a real human interviewer. Act natural, warm, and professional.
2. Reactive & Contextual: If the candidate gives a short or uninformative answer (like "let's start" or "I don't know"), react naturally—gently ask them to elaborate or rephrase the question instead of ignoring their statement.
3. Probing: If an answer is vague, follow up to dig deeper. If they gave a strong answer, sincerely compliment a specific part of it before moving on.
4. Concise: Ask ONE main question at a time. Do not overwhelm them with multi-part questions.
${interviewType === 'language' ? `5. Assess their ${langLabel} vocabulary range, grammar accuracy, fluency, and professional communication.` : ''}

CONTEXT:
- Job Description: ${JSON.stringify(jobRequirements).slice(0, 3000)}
- Candidate Resume Summary: ${JSON.stringify(cvData).slice(0, 2000)}

INSTRUCTIONS:
- Generate ONLY the spoken response. No "Interviewer:" prefixes, no meta-text, no inner thoughts.
- If this is the start, welcome the candidate warmly, mention the company name, and ask them to briefly introduce themselves.
- Focus on: ${interviewType === 'technical' ? 'Technical depth, system design, problem-solving.' : interviewType === 'language' ? 'Language fluency, vocabulary, grammar.' : 'Behavioral fit, STAR method, cultural alignment, soft skills.'}`;

    const recentHistory = previousTurns.slice(-10);

    // Mock Mode
    if (process.env.MOCK_AI === 'true') {
        await new Promise(r => setTimeout(r, 1500));
        const mockQuestions = language === 'tr' ? [
            "Harika bir başlangıç! Peki, şimdiye kadar karşılaştığın en zorlu proje ne oldu ve bu zorlukla nasıl başa çıktın?",
            "Anladım. Bir ekip içinde çalışırken yaşadığın en büyük çatışma neydi ve nasıl çözdün?",
            "İlginç bir bakış açısı. Sence en büyük güçlü yönün nedir ve bu pozisyona nasıl katkı sağlar?",
        ] : [
            "That's interesting. Can you tell me about a specific challenge you faced in that role and how you overcame it?",
            "Great. How do you handle disagreements with your team lead?",
            "I see. What would you say is your greatest weakness, and what are you doing to improve it?",
        ];
        return mockQuestions[Math.floor(Math.random() * mockQuestions.length)];
    }

    try {
        // Build conversation history as text
        const historyText = recentHistory.length > 0
            ? recentHistory.map(t => `${t.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${t.content}`).join('\n\n')
            : '';

        const prompt = historyText
            ? `Previous conversation:\n${historyText}\n\n(Candidate finished speaking. React and ask the next question.)`
            : langConfig.initial;

        const response = await aiChat(prompt, systemPrompt, { maxTokens: 350 });
        return response || langConfig.fallback;
    } catch (error: any) {
        console.error('Question Generation Error:', error);
        return `(AI Error: ${error.message || 'Unknown error'}) ${langConfig.fallback}`;
    }
}
