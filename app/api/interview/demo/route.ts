import { NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai/client';

export async function POST(request: Request) {
    try {
        const { question, answer, language = 'en' } = await request.json();
        
        if (!answer) {
            return NextResponse.json({ error: 'Answer is required' }, { status: 400 });
        }

        const prompt = `You are an AI interview coach. 
The user was asked this interview question: "${question}"
The user answered: "${answer}"

Provide a very short, professional feedback (max 2 sentences) evaluating their answer.
If their answer was too short, tell them to use the STAR method.
Respond ENTIRELY in ${language === 'tr' ? 'Turkish' : 'English'}.`;

        const feedback = await aiChat(prompt, 'You are a professional AI interview coach.', { maxTokens: 150 });
        
        return NextResponse.json({ feedback });
    } catch (error: any) {
        console.error('Demo API Error:', error);
        const fallbackFeedback = language === 'tr' 
            ? 'Cevabınız temel olarak anlaşıldı ancak gerçek mülakatlar için STAR metodunu kullanarak daha spesifik örnekler vermeniz gerekir.' 
            : 'Your answer gives a basic idea, but for a real interview, you should use the STAR method to provide a more specific example.';
            
        return NextResponse.json({ feedback: fallbackFeedback });
    }
}
