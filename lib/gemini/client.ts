import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default genAI;

/**
 * Helper to call Gemini and get text response
 */
export async function geminiChat(
    prompt: string,
    systemInstruction?: string,
    options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
        ...(systemInstruction ? { systemInstruction } : {}),
        generationConfig: {
            maxOutputTokens: options?.maxTokens || 2000,
            temperature: options?.temperature || 0.7,
        },
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
}

/**
 * Helper to call Gemini and get JSON response
 */
export async function geminiJSON<T = any>(
    prompt: string,
    systemInstruction?: string,
    options?: { maxTokens?: number }
): Promise<T> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
        ...(systemInstruction ? { systemInstruction } : {}),
        generationConfig: {
            maxOutputTokens: options?.maxTokens || 4000,
            temperature: 0.3,
            responseMimeType: 'application/json',
        },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
}
