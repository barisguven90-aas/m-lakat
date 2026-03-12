"use client";

import { useState } from "react";
import { MessageSquare, BookOpen, Brain, CheckCircle, AlertTriangle, Lightbulb, ChevronDown } from "lucide-react";
import { FavoriteQuestionButton } from "@/components/interview/FavoriteQuestionButton";
import { cn } from "@/lib/utils";

export function QuestionFeedbackCard({ qf, index, language = 'en' }: { qf: any; index: number, language?: string }) {
    const [isOpen, setIsOpen] = useState(index === 0);
    const isTr = language === 'tr';
    const scoreColor = qf.score >= 75 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800/30'
        : qf.score >= 55 ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800/30'
            : 'text-red-500 bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800/30';

    return (
        <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-white dark:bg-slate-800/40 shadow-sm overflow-hidden mb-3 transition-all">
            {/* Header (Always Visible) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-md bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {index + 1}
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {isTr ? 'Soru' : 'Question'} {index + 1}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                            {qf.question}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className={`px-2 py-0.5 rounded text-xs font-bold border ${scoreColor}`}>
                        {qf.score}/100
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                </div>
            </button>

            {/* Collapsible Body */}
            {isOpen && (
                <div className="p-4 space-y-4 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-end mb-2">
                        <FavoriteQuestionButton question={qf.question} answer={qf.answer} />
                    </div>
                    {/* Q & A */}
                    <div className="space-y-3">
                        <div>
                            <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <MessageSquare className="h-3 w-3" /> {isTr ? 'Soru' : 'Question'}
                            </p>
                            <p className="text-sm text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed">&quot;{qf.question}&quot;</p>
                        </div>
                        <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-800/50">
                            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <BookOpen className="h-3 w-3" /> {isTr ? 'Senin Cevabın' : 'Your Answer'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">&quot;{qf.answer}&quot;</p>
                        </div>
                    </div>

                    {/* AI Commentary */}
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-3 border border-indigo-100/50 dark:border-indigo-800/20">
                        <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                            <Brain className="h-3 w-3" /> {isTr ? 'Yapay Zeka Analizi' : 'AI Coach Analysis'}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{qf.ai_commentary}</p>
                    </div>

                    {/* Good / Improve Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                                <CheckCircle className="h-3 w-3" /> {isTr ? 'İyi Olan Nedir' : 'What Was Good'}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{qf.what_was_good}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                                <AlertTriangle className="h-3 w-3" /> {isTr ? 'Nasıl Geliştirilir' : 'What To Improve'}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{qf.what_to_improve}</p>
                        </div>
                    </div>

                    {/* Tip */}
                    {qf.ideal_answer_hint && (
                        <div className="flex gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">{isTr ? 'Örnek Cevap:' : 'Pro Tip:'}</span>
                                {qf.ideal_answer_hint}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
