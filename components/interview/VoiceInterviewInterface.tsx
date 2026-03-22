"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Clock, Loader2, UserCircle, Volume2, MessageSquare, ChevronDown, Lightbulb, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AudioVisualizer } from './AudioVisualizer';
import { ResultsEmailGate } from './ResultsEmailGate';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TranscriptEntry {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface VoiceInterviewInterfaceProps {
    sessionId: string;
    applicationContext: {
        jobTitle: string;
        jobCompany: string;
        jobDescription: string;
        cvData: any;
    };
    language: string;
    companyStyle: string;
}

const MAX_QUESTIONS = 7;

export default function VoiceInterviewInterface({
    sessionId,
    applicationContext,
    language,
    companyStyle,
}: VoiceInterviewInterfaceProps) {
    const router = useRouter();

    // State
    const [phase, setPhase] = useState<'waiting' | 'countdown' | 'interview' | 'ending'>('waiting');
    const [countdown, setCountdown] = useState(3);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [turnNumber, setTurnNumber] = useState(1);
    const turnNumberRef = useRef(1);

    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showTranscript, setShowTranscript] = useState(true);
    const [currentUserText, setCurrentUserText] = useState('');
    const [activeRightTab, setActiveRightTab] = useState<'transcript' | 'tips'>('transcript');
    // Result Modal State
    const [resultModal, setResultModal] = useState<{
        isOpen: boolean;
        finalScore: number;
        hireProbability: number;
        breakdown: any;
        feedbackSummary: string;
    } | null>(null);
    const userInteractedRef = useRef(false);

    // Refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isGeneratingRef = useRef(false); // Mutex to prevent concurrent AI calls
    const transcriptRef = useRef<TranscriptEntry[]>([]); // Keep transcript in sync with ref

    const t = {
        aiSpeaking: language === 'tr' ? 'Mülakatçı konuşuyor' : 'Interviewer speaking',
        listening: language === 'tr' ? 'Sizi dinliyorum...' : 'Listening...',
        processing: '•••',
        waiting: language === 'tr' ? 'Sıra sizde' : 'Your turn',
        endInterview: language === 'tr' ? 'Mülakatı Bitir' : 'End Interview',
        question: language === 'tr' ? 'Soru' : 'Question',
    };

    // Auto-scroll transcript
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [transcript]);

    // User clicks "Start" → begin countdown
    const handleStartInterview = () => {
        userInteractedRef.current = true;

        // Web Audio API unlock: permanently unlocks audio for the page
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
        } catch { }

        setPhase('countdown');
    };

    // Countdown → Start interview
    useEffect(() => {
        if (phase !== 'countdown') return;
        if (countdown <= 0) {
            setPhase('interview');
            timerRef.current = setInterval(() => setElapsedTime(s => s + 1), 1000);
            // AI starts the interview (only once)
            if (!isGeneratingRef.current) {
                generateAIResponse([], true);
            }
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, phase]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (activeSourceRef.current) { try { activeSourceRef.current.stop(); } catch { } }
            if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => { }); }
            recognitionRef.current?.stop();
        };
    }, []);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    // ===== Google Cloud TTS with retry =====
    const speakText = async (text: string): Promise<void> => {
        if (activeSourceRef.current) {
            try { activeSourceRef.current.stop(); } catch { }
            activeSourceRef.current = null;
        }
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const attemptTTS = (attempt: number): Promise<boolean> => {
            return new Promise(async (resolve) => {
                try {
                    setIsSpeaking(true);
                    const res = await fetch('/api/tts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: text.slice(0, 1000), language, companyStyle })
                    });

                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        console.error(`Voice TTS attempt ${attempt} failed [${res.status}]:`, errData);
                        setIsSpeaking(false);
                        resolve(false);
                        return;
                    }

                    const arrayBuffer = await res.arrayBuffer();
                    if (arrayBuffer.byteLength < 100) {
                        console.error(`Voice TTS attempt ${attempt}: audio too small (${arrayBuffer.byteLength} bytes)`);
                        setIsSpeaking(false);
                        resolve(false);
                        return;
                    }

                    if (audioCtxRef.current?.state === 'suspended') {
                        await audioCtxRef.current.resume();
                    }

                    // Safari compatibility for decodeAudioData (older iOS doesn't return a Promise)
                    const audioBuffer = await new Promise<AudioBuffer>((res, rej) => {
                        try {
                            const p = audioCtxRef.current!.decodeAudioData(arrayBuffer, res, rej);
                            if (p && typeof p.catch === 'function') p.catch(rej);
                        } catch (err) { rej(err); }
                    });
                    const source = audioCtxRef.current!.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioCtxRef.current!.destination);
                    activeSourceRef.current = source;

                    source.onended = () => {
                        setIsSpeaking(false);
                        activeSourceRef.current = null;
                        // Natural pause then auto-listen
                        setTimeout(() => {
                            if (!isGeneratingRef.current) {
                                startListening();
                            }
                        }, 1200);
                        resolve(true);
                    };

                    try {
                        source.start(0);
                    } catch (err) {
                        setIsSpeaking(false);
                        activeSourceRef.current = null;
                        resolve(false);
                    }
                } catch (error) {
                    console.error(`Voice TTS attempt ${attempt} error:`, error);
                    setIsSpeaking(false);
                    resolve(false);
                }
            });
        };

        // Try with one retry
        const success = await attemptTTS(1);
        if (!success) {
            await new Promise(r => setTimeout(r, 500));
            const retrySuccess = await attemptTTS(2);
            if (!retrySuccess) {
                console.error('Voice TTS: Both Web Audio API/GoogleCloud attempts failed.');
                setIsSpeaking(false);
                toast.error(language === 'tr' ? "Yapay zeka sesi oluşturulamadı. Google Cloud API anahtarınızı kontrol edin." : "Could not generate AI voice. Please check Google Cloud API Key.");
                // Immediately allow user to speak instead of hanging
                setTimeout(() => {
                    if (!isGeneratingRef.current) startListening();
                }, 1200);
            }
        }
    };

    // ===== Speech Recognition (STT) =====
    const startListening = useCallback(() => {
        if (isSpeaking || isProcessing) return; // Don't listen while AI is talking

        // Stop any playing audio
        if (activeSourceRef.current) { try { activeSourceRef.current.stop(); } catch { } activeSourceRef.current = null; } setIsSpeaking(false);

        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { toast.error("Speech recognition not supported."); return; }

        const recognition = new SR();
        const langCodeMap: Record<string, string> = {
            en: 'en-US', tr: 'tr-TR', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', zh: 'zh-CN'
        };
        recognition.lang = langCodeMap[language] || 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;

        let finalText = '';
        let silenceTimer: NodeJS.Timeout | null = null;

        recognition.onstart = () => {
            setIsListening(true);
            setCurrentUserText('');
            finalText = '';
        };

        recognition.onresult = (event: any) => {
            let interim = '';
            let newFinal = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    newFinal += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            if (newFinal) finalText += (finalText ? ' ' : '') + newFinal;
            setCurrentUserText(finalText + (interim ? ' ' + interim : ''));

            // Reset silence timer — decreased to 4.5s for faster back-and-forth
            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                recognition.stop();
            }, 4500);
        };

        recognition.onend = () => {
            setIsListening(false);
            if (silenceTimer) clearTimeout(silenceTimer);
            const spoken = finalText.trim();
            if (spoken) {
                setCurrentUserText('');
                handleUserResponse(spoken);
            }
        };

        recognition.onerror = (e: any) => {
            setIsListening(false);
            if (e.error === 'not-allowed') toast.error("Microphone access denied.");
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isSpeaking, isProcessing, language]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    // ===== AI Response (Groq via voice chat endpoint) =====
    const generateAIResponse = async (history: TranscriptEntry[], isFirst: boolean) => {
        // Prevent concurrent calls
        if (isGeneratingRef.current) {
            console.log('[Voice] Skipping duplicate AI call — already generating');
            return;
        }
        isGeneratingRef.current = true;
        setIsProcessing(true);

        try {
            const body = {
                sessionId,
                language,
                companyStyle,
                applicationContext,
                isFirst,
                previousTurns: history.map(h => ({ role: h.role, content: h.content })),
                responseText: !isFirst ? history[history.length - 1]?.content || '' : undefined,
                turnNumber: turnNumberRef.current,
            };

            const res = await fetch('/api/interview/voice/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'AI response failed');
            }
            const data = await res.json();

            const aiText = isFirst
                ? data.question || data.firstQuestion
                : data.nextQuestion;

            if (data.isCompleted) {
                setPhase('ending');
                // Show result modal if finalScore is available (Intervio Spec)
                if (data.finalScore) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']
                    });
                    setResultModal({
                        isOpen: true,
                        finalScore: data.finalScore.final_score || 0,
                        hireProbability: data.finalScore.hire_probability || 0,
                        breakdown: data.finalScore.breakdown || { cv_match: 0, technical: 0, communication: 0, confidence: 0, behavioral: 0 },
                        feedbackSummary: data.finalScore.feedback_summary || '',
                    });
                } else {
                    toast.success(language === 'tr' ? "Mülakat tamamlandı!" : "Interview complete!");
                    router.push(`/dashboard/interview/${sessionId}/feedback`);
                }
                return;
            }

            if (aiText) {
                const newEntry: TranscriptEntry = { role: 'assistant', content: aiText, timestamp: new Date() };
                transcriptRef.current = [...transcriptRef.current, newEntry];
                setTranscript([...transcriptRef.current]);
                if (!isFirst) {
                    const nextTurn = data.turnNumber || turnNumberRef.current + 1;
                    turnNumberRef.current = nextTurn;
                    setTurnNumber(nextTurn);
                }

                // Speak the AI response (stops any previous audio first)
                await speakText(aiText);
            }
        } catch (error) {
            console.error('AI Error:', error);
            toast.error(language === 'tr' ? "AI yanıt veremedi." : "AI could not respond.");
        } finally {
            setIsProcessing(false);
            isGeneratingRef.current = false;
        }
    };

    // ===== Handle User Response =====
    const handleUserResponse = async (text: string) => {
        if (isGeneratingRef.current) return; // Skip if already processing

        const userEntry: TranscriptEntry = { role: 'user', content: text, timestamp: new Date() };
        transcriptRef.current = [...transcriptRef.current, userEntry];
        setTranscript([...transcriptRef.current]);

        // Generate AI response with full history
        await generateAIResponse(transcriptRef.current, false);
    };

    // ===== End Interview =====
    const handleEndInterview = async () => {
        setPhase('ending');
        if (activeSourceRef.current) { try { activeSourceRef.current.stop(); } catch { } activeSourceRef.current = null; }
        recognitionRef.current?.stop();
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            await fetch('/api/interview/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
            toast.success(language === 'tr' ? "Rapor hazırlanıyor..." : "Generating report...");
            router.push(`/dashboard/interview/${sessionId}/feedback`);
        } catch {
            toast.error("Could not end interview.");
        }
    };

    // ===== Waiting Screen (click to start) =====
    if (phase === 'waiting') {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-neutral-950">
                <div className="text-center space-y-6">
                    <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-2 border-blue-500/30 flex items-center justify-center mx-auto">
                        <Mic className="h-12 w-12 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {language === 'tr' ? 'Sesli Mülakat' : 'Voice Interview'}
                        </h2>
                        <p className="text-neutral-400 text-sm max-w-sm mx-auto">
                            {applicationContext.jobTitle} — {applicationContext.jobCompany}
                        </p>
                        <p className="text-neutral-500 text-xs mt-3">
                            {language === 'tr' ? 'Mikrofon ve ses izni gerekli' : 'Microphone & audio permission required'}
                        </p>
                    </div>
                    <Button
                        onClick={handleStartInterview}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 text-lg rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                    >
                        {language === 'tr' ? 'Mülakatı Başlat' : 'Start Interview'}
                    </Button>
                </div>
            </div>
        );
    }

    // ===== Countdown Screen =====
    if (phase === 'countdown') {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-neutral-950">
                <div className="text-center">
                    <div className="relative">
                        <div className="h-40 w-40 rounded-full border-4 border-blue-500/30 flex items-center justify-center mx-auto mb-8">
                            <span className="text-7xl font-bold text-blue-400 animate-pulse">{countdown}</span>
                        </div>
                        <div className="absolute inset-0 h-40 w-40 mx-auto rounded-full border-4 border-blue-500/20 animate-ping" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {language === 'tr' ? 'Mülakat Başlıyor' : 'Interview Starting'}
                    </h2>
                    <p className="text-neutral-400 text-sm">
                        {applicationContext.jobTitle} — {applicationContext.jobCompany}
                    </p>
                </div>
            </div>
        );
    }

    // ===== Interview Screen =====
    const statusText = isSpeaking ? t.aiSpeaking
        : isProcessing ? t.processing
            : isListening ? t.listening
                : t.waiting;

    const statusColor = isSpeaking ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
        : isProcessing ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
            : isListening ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-neutral-800 border-neutral-700 text-neutral-400";

    const dotColor = isSpeaking ? "bg-blue-400 animate-pulse"
        : isProcessing ? "bg-amber-400 animate-pulse"
            : isListening ? "bg-red-400 animate-pulse"
                : "bg-neutral-500";

    return (
        <div className="flex flex-col lg:flex-row bg-neutral-950 h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] w-full md:rounded-2xl md:border border-neutral-800 overflow-hidden shadow-2xl">

            {/* LEFT: AI Presence */}
            <div className={cn("flex flex-col relative transition-all duration-300", showTranscript ? "flex-1" : "w-full")}>

                {/* Top Bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 font-mono text-xs">
                            <Clock className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-blue-400 font-semibold tracking-widest">{formatTime(elapsedTime)}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-green-400 text-[10px] font-semibold">LIVE</span>
                        </div>
                        {language === 'tr' && (
                            <span className="text-[11px] text-amber-400/80 border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded-full">🇹🇷 Türkçe</span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
                                <div key={i} className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-all duration-500",
                                    i < turnNumber ? "bg-blue-500" : "bg-neutral-700"
                                )} />
                            ))}
                        </div>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={phase === 'ending'}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 gap-1.5 text-xs">
                                {phase === 'ending' ? <Loader2 className="h-3 w-3 animate-spin" /> : <PhoneOff className="h-3 w-3" />}
                                {t.endInterview}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-neutral-900 border-neutral-700 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>{language === 'tr' ? 'Mülakatı sonlandırmak istiyor musunuz?' : 'Would you like to wrap up?'}</AlertDialogTitle>
                                <AlertDialogDescription className="text-neutral-400">
                                    {language === 'tr' ? 'Şimdiye kadarki cevaplarınız ile detaylı rapor hazırlanacak.' : 'We\'ll prepare a detailed report based on your answers so far.'}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700">
                                    {language === 'tr' ? 'Devam Et' : 'Keep Going'}
                                </AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleEndInterview}>
                                    {language === 'tr' ? 'Bitir & Rapor Al' : 'End & Get Report'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* AI Presence Area */}
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 relative overflow-hidden">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: 'linear-gradient(rgba(99,179,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }} />

                    {/* Ambient glow */}
                    {isSpeaking && <div className="absolute inset-0 bg-blue-500/5 animate-pulse rounded-full blur-3xl" />}
                    {isListening && <div className="absolute inset-0 bg-red-500/5 animate-pulse rounded-full blur-3xl" />}

                    {/* Status pill */}
                    <div className="absolute top-4">
                        <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-500", statusColor)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
                            {statusText}
                        </div>
                    </div>

                    {/* Interviewer Avatar */}
                    <div className={cn(
                        "relative z-10 rounded-full p-8 transition-all duration-700",
                        isSpeaking ? "bg-blue-500/10 scale-110 shadow-[0_0_80px_rgba(59,130,246,0.12)]"
                            : isListening ? "bg-red-500/10 scale-105 shadow-[0_0_60px_rgba(239,68,68,0.08)]"
                                : "bg-neutral-800/30"
                    )}>
                        <UserCircle className={cn("h-20 w-20 transition-colors duration-500",
                            isSpeaking ? "text-blue-400" : isListening ? "text-red-400" : "text-neutral-500"
                        )} />
                        {(isSpeaking || isListening) && <span className={cn(
                            "animate-ping absolute inset-0 rounded-full opacity-[0.07]",
                            isSpeaking ? "bg-blue-400" : "bg-red-400"
                        )} />}
                    </div>

                    <div className="mt-6 h-12">
                        <AudioVisualizer isSpeaking={isSpeaking || isListening} />
                    </div>

                    {/* Current speech text */}
                    {isListening && currentUserText && (
                        <div className="mt-4 max-w-md px-4 py-2 bg-neutral-800/60 border border-neutral-700 rounded-xl text-sm text-neutral-300 text-center animate-in fade-in">
                            {currentUserText}
                        </div>
                    )}

                    {/* Replay button */}
                    {!isListening && !isProcessing && transcript.length > 0 && (
                        <button
                            onClick={() => {
                                const lastAI = [...transcript].reverse().find(t => t.role === 'assistant');
                                if (lastAI) speakText(lastAI.content);
                            }}
                            className="mt-4 text-neutral-600 hover:text-neutral-400 text-xs flex items-center gap-1.5 transition-colors"
                        >
                            <Volume2 className="h-3.5 w-3.5" />
                            {language === 'tr' ? 'Soruyu Tekrar Dinle' : 'Replay Question'}
                        </button>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-center py-6 bg-neutral-950 border-t border-neutral-800">
                    <div className="flex items-center gap-4 bg-neutral-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-neutral-700 shadow-xl">
                        <Button
                            variant={isListening ? "destructive" : "default"}
                            size="icon"
                            onClick={isListening ? stopListening : startListening}
                            disabled={isSpeaking || isProcessing || phase === 'ending'}
                            className={cn("rounded-full shadow-lg transition-all duration-200 h-14 w-14 border-0",
                                isListening ? "animate-pulse ring-4 ring-red-500/25 scale-110 bg-red-600 hover:bg-red-500"
                                    : "bg-blue-600 hover:bg-blue-500"
                            )}
                        >
                            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => setShowTranscript(!showTranscript)}
                            className={cn("rounded-full h-10 w-10 hover:bg-neutral-700",
                                showTranscript ? "text-blue-400" : "text-neutral-500"
                            )}>
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* RIGHT: Panel */}
            {showTranscript && (
                <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-900 flex flex-col max-h-[50vh] lg:max-h-none transition-all duration-300">
                    <div className="flex border-b border-neutral-800 bg-neutral-900/50 backdrop-blur">
                        <button
                            onClick={() => setActiveRightTab('transcript')}
                            className={cn(
                                "flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors border-b-2",
                                activeRightTab === 'transcript' ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-neutral-500 hover:text-neutral-300"
                            )}
                        >
                            <MessageSquare className="h-4 w-4" />
                            {language === 'tr' ? 'Transkript' : 'Transcript'}
                            <span className="text-xs bg-neutral-800 px-2 py-0.5 rounded-full ml-1">{transcript.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveRightTab('tips')}
                            className={cn(
                                "flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors border-b-2",
                                activeRightTab === 'tips' ? "border-amber-500 text-amber-400 bg-amber-500/5" : "border-transparent text-neutral-500 hover:text-neutral-300"
                            )}
                        >
                            <Lightbulb className="h-4 w-4" />
                            {language === 'tr' ? 'İpuçları' : 'Tips & Advice'}
                        </button>
                    </div>

                    <div className="flex-1 relative">
                        {activeRightTab === 'transcript' ? (
                            <div ref={chatContainerRef} className="absolute inset-0 overflow-y-auto p-4 scroll-smooth"
                                style={{ scrollbarWidth: 'thin', scrollbarColor: '#444 transparent' }}>
                                <div className="space-y-4">
                                    {transcript.map((entry, i) => (
                                        <div key={i} className={cn("flex flex-col gap-1", entry.role === 'user' ? "items-end" : "items-start")}>
                                            <div className={cn(
                                                "max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed",
                                                entry.role === 'user'
                                                    ? "bg-blue-600 text-white rounded-tr-sm"
                                                    : "bg-neutral-800 text-neutral-200 rounded-tl-sm border border-neutral-700"
                                            )}>
                                                {entry.content}
                                            </div>
                                            <span className="text-[10px] text-neutral-600 uppercase px-1">
                                                {entry.role === 'assistant'
                                                    ? (language === 'tr' ? 'Mülakatçı' : 'Interviewer')
                                                    : (language === 'tr' ? 'Siz' : 'You')}
                                            </span>
                                        </div>
                                    ))}

                                    {isProcessing && (
                                        <div className="flex items-center gap-2 text-neutral-500 text-xs pl-2">
                                            <div className="flex gap-1">
                                                {[0, 1, 2].map(i => (
                                                    <span key={i} className="h-1.5 w-1.5 bg-neutral-500 rounded-full animate-bounce"
                                                        style={{ animationDelay: `${i * 100}ms` }} />
                                                ))}
                                            </div>
                                            <span>{language === 'tr' ? 'Düşünüyor...' : 'Thinking...'}</span>
                                        </div>
                                    )}

                                    <div ref={transcriptEndRef} />
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 overflow-y-auto p-5 space-y-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#444 transparent' }}>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 mb-3">
                                        <Lightbulb className="h-4 w-4 text-amber-400" />
                                        {language === 'tr' ? "STAR Formatını Kullanın" : "Use the STAR Method"}
                                    </h3>
                                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                                        {language === 'tr'
                                            ? "Davranışsal sorularda (behavioral) cevaplarınızı yapılandırırken her zaman STAR metoduna başvurun. Bu, cevabınızın akıcı ve net olmasını sağlar."
                                            : "Always frame your answers to behavioral questions using the STAR framework. It guarantees clarity and completeness."}
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/50 hover:border-neutral-700 transition-colors">
                                            <span className="bg-blue-500/20 text-blue-400 font-bold w-5 h-5 flex items-center justify-center rounded text-[10px] shrink-0 mt-0.5">S</span>
                                            <div className="text-xs text-neutral-300"><strong className="text-neutral-200">Situation:</strong> {language === 'tr' ? "Olayı veya bağlamı açıklayın." : "Set the scene and provide necessary context."}</div>
                                        </div>
                                        <div className="flex items-start gap-2 bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/50 hover:border-neutral-700 transition-colors">
                                            <span className="bg-purple-500/20 text-purple-400 font-bold w-5 h-5 flex items-center justify-center rounded text-[10px] shrink-0 mt-0.5">T</span>
                                            <div className="text-xs text-neutral-300"><strong className="text-neutral-200">Task:</strong> {language === 'tr' ? "Sizin sorumluluğunuz neydi?" : "What was your specific responsibility or challenge?"}</div>
                                        </div>
                                        <div className="flex items-start gap-2 bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/50 hover:border-neutral-700 transition-colors">
                                            <span className="bg-amber-500/20 text-amber-400 font-bold w-5 h-5 flex items-center justify-center rounded text-[10px] shrink-0 mt-0.5">A</span>
                                            <div className="text-xs text-neutral-300"><strong className="text-neutral-200">Action:</strong> {language === 'tr' ? "Nasıl bir aksiyon aldınız?" : "What concrete steps did you take?"}</div>
                                        </div>
                                        <div className="flex items-start gap-2 bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/50 hover:border-neutral-700 transition-colors">
                                            <span className="bg-green-500/20 text-green-400 font-bold w-5 h-5 flex items-center justify-center rounded text-[10px] shrink-0 mt-0.5">R</span>
                                            <div className="text-xs text-neutral-300"><strong className="text-neutral-200">Result:</strong> {language === 'tr' ? "Sonuç ne oldu? (Sayısal veri verin)" : "What was the measurable outcome?"}</div>
                                        </div>
                                    </div>
                                </div>
                                <hr className="border-neutral-800" />
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 mb-3">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        {language === 'tr' ? "Neyi Görmek İstiyorlar?" : "What They Are Looking For"}
                                    </h3>
                                    <ul className="list-disc pl-5 text-xs text-neutral-400 space-y-2 marker:text-neutral-600">
                                        <li>{language === 'tr' ? "Net, hedefe yönelik ve kendinizden emin bir iletişim." : "Clear, confident, and goal-oriented communication."}</li>
                                        {companyStyle === 'google' && <li>{language === 'tr' ? "Büyük ölçekte düşünme ve çoklu çözümler sunma (Googliness)." : "Thinking at scale and showing Googliness."}</li>}
                                        {companyStyle === 'amazon' && <li>{language === 'tr' ? "Liderlik prensipleriyle (LPs) süslenmiş somut kanıtlar." : "Solid evidence mapped to Amazon Leadership Principles."}</li>}
                                        {companyStyle === 'startup' && <li>{language === 'tr' ? "Pratik olma, iş bitiricilik ve hız." : "Hackiness, speed, and getting things done fast."}</li>}
                                        <li>{language === 'tr' ? "'Biz' değil, 'Ben' demeniz; gruptan izole şekilde sizin katkınız." : "Focus on 'I' instead of 'We'. Highlighting your specific contribution."}</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Intervio Email Gate Result Modal */}
            {resultModal?.isOpen && (
                <div className="fixed inset-0 z-[100] bg-[#0a0f1e]">
                    <ResultsEmailGate
                        sessionId={sessionId}
                        finalScore={resultModal.finalScore}
                        hireProbability={resultModal.hireProbability}
                        breakdown={resultModal.breakdown}
                        feedbackSummary={resultModal.feedbackSummary}
                        jobTitle={applicationContext.jobTitle}
                        language={language}
                    />
                </div>
            )}
        </div>
    );
}
