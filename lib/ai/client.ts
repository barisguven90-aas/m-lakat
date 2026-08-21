import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
});

export default groq;

/**
 * Helper to call Groq and get text response
 */
export async function aiChat(
    prompt: string,
    systemInstruction?: string,
    options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
    const messages: any[] = [];

    if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await groq.chat.completions.create({
        model: 'groq/compound',
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7,
        messages,
    });

    return response.choices[0]?.message?.content || '';
}

/**
 * Helper to call Groq and get JSON response
 */
export async function aiJSON<T = any>(
    prompt: string,
    systemInstruction?: string,
    options?: { maxTokens?: number }
): Promise<T> {
    const messages: any[] = [];

    if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction + '\n\nYou MUST respond ONLY with valid JSON. No markdown, no code blocks, no extra text.' });
    } else {
        messages.push({ role: 'system', content: 'You MUST respond ONLY with valid JSON. No markdown, no code blocks, no extra text.' });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await groq.chat.completions.create({
        model: 'groq/compound',
        max_tokens: options?.maxTokens || 4000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages,
    });

    const text = response.choices[0]?.message?.content || '{}';
    return JSON.parse(text);
}
