"use client";

import { useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, User, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
        <div className="w-full mt-8 flex flex-col">
            {state === "IDLE" && (
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
                    <Button asChild size="lg" className="h-14 px-8 text-base bg-primary hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-105 font-bold">
                        <a href="/signup">
                            {t("start_interview")}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </a>
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="h-14 px-8 text-base rounded-full bg-white border-slate-200 hover:bg-slate-50 text-slate-700 transition-all font-semibold shadow-sm"
                        onClick={() => setState("ANSWERING")}
                    >
                        {t("try_demo")}
                    </Button>
                </div>
            )}

            {state === "ANSWERING" && (
                <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-xl text-left animate-fade-in-up relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
                    <div className="flex items-center gap-3 mb-4 text-blue-600">
                        <Image src="/mascot.png" alt="Mascot" width={32} height={32} className="object-contain mix-blend-multiply" />
                        <span className="font-bold text-sm">{language === 'tr' ? 'Cappy Soruyor:' : 'Coach Cappy:'}</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">{currentQuestion}</p>
                    
                    <textarea 
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={language === 'tr' ? 'Cevabınızı buraya yazın...' : 'Type your answer here...'}
                        className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-4 shadow-inner"
                    />
                    
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setState("IDLE")} className="text-slate-500 font-medium hover:bg-slate-100 rounded-full">
                            {language === 'tr' ? 'İptal' : 'Cancel'}
                        </Button>
                        <Button className="bg-primary hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-md" onClick={handleSubmit} disabled={!answer.trim()}>
                            {t("demo_submit")}
                        </Button>
                    </div>
                </div>
            )}

            {state === "LOADING_FEEDBACK" && (
                <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center animate-fade-in-up shadow-xl">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-slate-600 font-semibold">{t("demo_answering")} / Analyzing...</p>
                </div>
            )}

            {state === "FEEDBACK_SHOWN" && (
                <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 animate-fade-in-up text-left shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                    <div className="flex items-center gap-3 mb-6 text-emerald-600">
                        <Image src="/mascot.png" alt="Mascot" width={36} height={36} className="object-contain mix-blend-multiply" />
                        <span className="font-extrabold text-lg">{t("demo_feedback_title")}</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-8 shadow-sm">
                        <p className="text-slate-700 text-base font-medium leading-relaxed">{feedback}</p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 text-center">
                        <p className="text-xl font-bold mb-2 text-slate-800">
                            {t('demo_feedback_msg')}
                        </p>
                        <p className="text-sm font-medium text-slate-500 mb-6">
                            {t('upload_cv_msg')}
                        </p>
                        <Button size="lg" className="h-14 px-8 text-base font-bold bg-primary hover:bg-blue-700 text-white rounded-full w-full sm:w-auto shadow-lg transition-all hover:scale-105" onClick={() => router.push('/signup')}>
                            {t('start_full_interview')}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
