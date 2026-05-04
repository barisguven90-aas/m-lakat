"use client";

import { useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, User, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type DemoState = "IDLE" | "ANSWERING" | "LOADING_FEEDBACK" | "FEEDBACK_SHOWN";

export function DemoSection() {
    const { t, language } = useLanguageStore();
    const router = useRouter();
    const [state, setState] = useState<DemoState>("IDLE");
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");

    const questionEn = "Can you tell me about a time you had to deal with an unhappy customer?";
    const questionTr = "Mutsuz bir müşteriyle ilgilenmek zorunda kaldığınız bir zamanı anlatır mısınız?";
    const currentQuestion = language === 'tr' ? questionTr : questionEn;

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setState("LOADING_FEEDBACK");
        
        try {
            // Send to a specialized demo endpoint or simply simulate for now to keep it lightweight.
            // Since we need real AI feedback, we can call the groq or openAI API endpoint here.
            // For the sake of the demo, we will create a lightweight api endpoint if it doesn't exist,
            // or we simulate the API call. Let's create an API call to a new endpoint `/api/demo`.
            const res = await fetch("/api/interview/demo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: currentQuestion, answer, language })
            });

            if (!res.ok) throw new Error("Demo failed");
            
            const data = await res.json();
            setFeedback(data.feedback);
        } catch (err) {
            console.error(err);
            setFeedback(language === 'tr' ? 'Cevabınız fena değil ama daha fazla detaya ve STAR metoduna ihtiyacınız var.' : 'Your answer is okay, but you need more detail and the STAR method.');
        } finally {
            setState("FEEDBACK_SHOWN");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-6 flex flex-col items-center">
            {state === "IDLE" && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    <Button asChild size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-blue-600 hover:bg-blue-500 text-white rounded-full w-full sm:w-auto shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95">
                        <a href="/signup">
                            {t("start_interview")}
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </a>
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base rounded-full w-full sm:w-auto bg-neutral-900/50 border-neutral-700 hover:bg-neutral-800 text-white transition-all"
                        onClick={() => setState("ANSWERING")}
                    >
                        {t("try_demo")}
                    </Button>
                </div>
            )}

            {state === "ANSWERING" && (
                <div className="w-full bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-6 animate-fade-in-up text-left">
                    <div className="flex items-center gap-3 mb-4 text-blue-400">
                        <Bot className="w-5 h-5" />
                        <span className="font-medium text-sm">{language === 'tr' ? 'Yapay Zeka Soruyor:' : 'AI Interviewer:'}</span>
                    </div>
                    <p className="text-lg font-medium text-white mb-6">{currentQuestion}</p>
                    
                    <textarea 
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={language === 'tr' ? 'Cevabınızı buraya yazın...' : 'Type your answer here...'}
                        className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none mb-4"
                    />
                    
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setState("IDLE")}>
                            {language === 'tr' ? 'İptal' : 'Cancel'}
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full" onClick={handleSubmit} disabled={!answer.trim()}>
                            {t("demo_submit")}
                        </Button>
                    </div>
                </div>
            )}

            {state === "LOADING_FEEDBACK" && (
                <div className="w-full bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center animate-fade-in-up">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-neutral-400">{t("demo_answering")} / Analyzing...</p>
                </div>
            )}

            {state === "FEEDBACK_SHOWN" && (
                <div className="w-full bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-6 animate-fade-in-up text-left">
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                        <Bot className="w-5 h-5" />
                        <span className="font-bold">{t("demo_feedback_title")}</span>
                    </div>
                    <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-4 mb-6">
                        <p className="text-neutral-200 text-sm leading-relaxed">{feedback}</p>
                    </div>

                    {/* Funnel to Full Interview */}
                    <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
                        <p className="text-lg font-medium mb-2 text-white">
                            {t('demo_feedback_msg')}
                        </p>
                        <p className="text-sm text-neutral-400 mb-6">
                            {t('upload_cv_msg')}
                        </p>
                        <Button size="lg" className="h-12 sm:h-14 px-8 text-sm sm:text-base bg-blue-600 hover:bg-blue-500 text-white rounded-full w-full shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105" onClick={() => router.push('/signup')}>
                            {t('start_full_interview')}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
