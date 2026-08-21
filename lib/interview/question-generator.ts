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
    difficulty?: 'easy' | 'medium' | 'hard';
}

const COMPANY_STYLE_PROMPTS: Record<string, string> = {
    standard: 'Use a standard, professional interview style.',
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
    tr: { instruction: 'IMPORTANT: Mülakatı tamamen Türkçe (Turkish) olarak yürüt. Hiçbir şekilde İngilizce kelime veya cümle kullanma. Samimi ama profesyonel bir dil kullan.', initial: 'Aday odaya girdi. Mülakata başla — kısa bir karşılama yap ve kendisini tanıtmasını iste.', fallback: 'Geçmişiniz hakkında biraz daha bilgi verebilir misiniz?' },
};

// ─── TYPE-SPECIFIC SYSTEM PROMPTS ───

const TYPE_PROMPTS: Record<string, (jobTitle: string, jobReq: string, cvSummary: string, difficulty: string) => string> = {
    technical: (jobTitle, jobReq, cvSummary, difficulty) => `
INTERVIEW TYPE: TECHNICAL INTERVIEW
DIFFICULTY: ${difficulty.toUpperCase()}

You are a Senior Engineering Manager / Tech Lead conducting a TECHNICAL interview.

YOUR FOCUS AREAS (ask questions ONLY from these categories):
1. **System Design** — Ask the candidate to design a system, API, or architecture relevant to the job.
   Examples: "How would you design the backend for a real-time messaging system?", "Walk me through the architecture of a scalable e-commerce platform."
2. **Problem Solving & Algorithms** — Present a coding/logic problem and ask them to walk through their approach.
   Examples: "How would you find the most frequent element in a large dataset?", "Explain how you'd optimize a slow database query."
3. **Technical Depth** — Probe their knowledge of specific technologies, frameworks, or tools mentioned in the job description.
   Based on job requirements: ${jobReq.slice(0, 1500)}
4. **Code Review & Best Practices** — Ask about design patterns, testing strategies, CI/CD, code quality.
5. **Past Technical Challenges** — Ask about real technical problems they've solved, focusing on the HOW.

${difficulty === 'hard' ? 'Ask SENIOR-level questions. Expect deep system design, trade-off analysis, and production-level thinking.' : ''}
${difficulty === 'easy' ? 'Ask JUNIOR-level questions. Focus on fundamentals, basic data structures, and simple system design.' : ''}

RULES:
- Do NOT ask behavioral/HR questions like "tell me about a time you had a conflict" — this is a TECHNICAL interview.
- Do NOT ask about soft skills, cultural fit, or motivation.
- Every question must test technical knowledge, problem-solving, or engineering judgment.
- If the candidate's CV mentions specific technologies, ask about those: ${cvSummary.slice(0, 800)}
`,

    language: (jobTitle, jobReq, cvSummary, difficulty) => `
INTERVIEW TYPE: LANGUAGE PROFICIENCY ASSESSMENT
DIFFICULTY: ${difficulty.toUpperCase()}

You are a professional Language Proficiency Assessor. Your ONLY goal is to evaluate the candidate's language skills.

YOUR FOCUS AREAS:
1. **Vocabulary Range** — Use progressively complex vocabulary. Ask them to explain concepts in their own words, use synonyms, or define terms.
2. **Grammar Accuracy** — Pay attention to tense usage, subject-verb agreement, article usage. Ask questions that require complex sentence structures.
3. **Fluency & Coherence** — Ask open-ended questions that require extended speaking. Assess how smoothly they connect ideas.
4. **Professional Communication** — Ask them to role-play professional scenarios: giving a presentation summary, explaining a project to a non-technical person, writing a professional email description.
5. **Comprehension** — Ask follow-up questions to test if they understood your previous statements.

${difficulty === 'hard' ? 'Use advanced vocabulary, complex sentences, and expect near-native fluency. Ask about abstract topics, debates, and nuanced opinions.' : ''}
${difficulty === 'easy' ? 'Use simple, clear language. Ask about daily life, hobbies, straightforward work topics. Be patient and encouraging.' : ''}

RULES:
- Do NOT ask technical questions about the job — this is a LANGUAGE assessment.
- Do NOT evaluate their job-specific knowledge.
- Every question must test language ability: vocabulary, grammar, fluency, or communication.
- Gently correct major language errors and note them for the assessment.
- Mix question types: opinion questions, descriptive questions, situational scenarios.
`,

    hr_behavioral: (jobTitle, jobReq, cvSummary, difficulty) => `
INTERVIEW TYPE: BEHAVIORAL / HR INTERVIEW
DIFFICULTY: ${difficulty.toUpperCase()}

You are a Senior Talent Acquisition Partner conducting a BEHAVIORAL interview.

YOUR FOCUS AREAS:
1. **STAR Method Questions** — Ask situation-based questions: "Tell me about a time when..." "Describe a situation where..."
2. **Cultural Fit** — Assess alignment with company values, teamwork style, communication approach.
3. **Soft Skills** — Leadership, conflict resolution, time management, adaptability, resilience.
4. **Motivation & Career Goals** — Why this role? Why this company? Where do they see themselves in 5 years?
5. **Problem-Solving (Non-Technical)** — How they handle pressure, tight deadlines, disagreements, failure.

${difficulty === 'hard' ? 'Ask challenging behavioral questions that require deep self-reflection. Probe inconsistencies. Ask about failures and weaknesses.' : ''}
${difficulty === 'easy' ? 'Ask straightforward behavioral questions. Be warm and encouraging. Focus on strengths and positive experiences.' : ''}

RULES:
- Do NOT ask technical/coding questions — this is a BEHAVIORAL interview.
- Every question must assess behavioral competencies, soft skills, or cultural fit.
- Press for specific examples (STAR format). If they give generic answers, ask "Can you give me a specific example?"
- Based on their CV: ${cvSummary.slice(0, 800)}
`
};

export async function generateQuestion(context: QuestionContext) {
    const {
        interviewType, jobTitle, companyName, jobRequirements, cvData, previousTurns,
        language = 'en',
        companyStyle = 'standard',
        difficulty = 'medium'
    } = context;

    const langLabel = language === 'tr' ? 'Türkçe' : 'English';
    const companyStyleGuide = COMPANY_STYLE_PROMPTS[companyStyle] || COMPANY_STYLE_PROMPTS.standard;
    const langConfig = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

    const jobReqStr = typeof jobRequirements === 'string' ? jobRequirements : JSON.stringify(jobRequirements || {});
    const cvStr = typeof cvData === 'string' ? cvData : JSON.stringify(cvData || {});

    // Get the type-specific prompt
    const typePromptFn = TYPE_PROMPTS[interviewType] || TYPE_PROMPTS.hr_behavioral;
    const typeSpecificInstructions = typePromptFn(jobTitle, jobReqStr, cvStr, difficulty);

    const systemPrompt = `You are a professional job interviewer.
IMPORTANT: You MUST conduct the entire interview ENTIRELY in ${langLabel}. Do NOT use any other language.
If ${langLabel} is Türkçe, you must not use a single English word.

Ask realistic interview questions based on the user's CV and job description.
Be concise and professional.

COMPANY STYLE: ${companyStyleGuide}

${typeSpecificInstructions}

INTERVIEW STYLE & TONE:
1. **Use the candidate's first name**: Extract their name from the CV data and use it in your greeting and occasionally during the conversation. This makes it personal.
2. **Natural, human reactions**: ALWAYS react to their previous answer before asking the next question. Use 1 sentence like:
   - "That's a great example." / "I see, that's interesting."
   - "That makes sense, though I'd love to dig deeper on one aspect."  
   - If their answer was weak: "I'd love to hear more specifics on that." / "Could you elaborate a bit more?"
   Do NOT just jump to the next question without reacting — that feels robotic.
3. **Conversational warmth**: Speak as a real human interviewer would in a professional setting. Be warm but professional.
4. **Probing depth**: Follow up on interesting points. If they mention a project, ask about it specifically.
5. **One question at a time**: Ask ONE clear question. Never ask multi-part questions.
6. **Reference their background**: Mention specific things from their CV or the job listing naturally during conversation.

CONTEXT:
- Job: ${jobTitle} at ${companyName}
- Job Description: ${jobReqStr.slice(0, 2000)}
- Candidate CV Summary: ${cvStr.slice(0, 1500)}

OUTPUT RULES:
- Generate ONLY the spoken text. No "Interviewer:" prefix, no meta-text, no actions like *smiles*.
- If this is the start, Welcome them by name (from CV), mention the company and position, and ask an opening question appropriate to the interview type.
- Keep responses under 3 sentences to feel natural in speech.`;

    const recentHistory = previousTurns.slice(-10);

    // Mock Mode
    if (process.env.MOCK_AI === 'true') {
        await new Promise(r => setTimeout(r, 1500));
        const mockByType: Record<string, string[]> = {
            technical: [
                "Can you walk me through how you'd design a caching layer for a high-traffic API?",
                "What's your approach to optimizing database queries in a production system?",
                "Explain the trade-offs between SQL and NoSQL databases for this use case."
            ],
            language: [
                "Can you describe your ideal work environment using as much detail as possible?",
                "Would you mind explaining the concept of teamwork in your own words?",
                "If you had to describe your career journey to a stranger, how would you summarize it?"
            ],
            hr_behavioral: [
                "Tell me about a time you had to handle a difficult conflict with a colleague.",
                "Describe a situation where you had to meet a tight deadline. How did you manage?",
                "What would you say is your greatest professional weakness, and what are you doing to improve it?"
            ]
        };
        const questions = mockByType[interviewType] || mockByType.hr_behavioral;
        return questions[Math.floor(Math.random() * questions.length)];
    }

    try {
        const historyText = recentHistory.length > 0
            ? recentHistory.map(t => `${t.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${t.content}`).join('\n\n')
            : '';

        const prompt = historyText
            ? `Previous conversation:\n${historyText}\n\n(Candidate finished speaking. React and ask the next question. Remember: this is a ${interviewType.replace('_', ' ')} interview — stay strictly within that category.)`
            : langConfig.initial;

        const response = await aiChat(prompt, systemPrompt, { maxTokens: 400 });
        return response || langConfig.fallback;
    } catch (error: any) {
        console.error('Question Generation Error:', error);
        return `(AI Error: ${error.message || 'Unknown error'}) ${langConfig.fallback}`;
    }
}
