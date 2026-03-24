"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Send, Loader2, User, Bot, Mic, Volume2, Square, Video, VideoOff,
    UserCircle, PhoneOff, Clock, MessageSquare, TrendingUp, TrendingDown,
    Minus, CheckCircle, AlertCircle, Bell, ArrowDown, ChevronDown, Lightbulb, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AudioVisualizer } from './AudioVisualizer';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
    role: 'assistant' | 'user';
    content: string;
    score?: number;
    feedback?: string;
    isStrong?: boolean;
}

const MAX_QUESTIONS = 5;

function ScoreBadge({ score, feedback, isStrong }: { score: number; feedback: string; isStrong: boolean }) {
    const color = score >= 75 ? 'text-green-400 border-green-500/30 bg-green-500/10'
        : score >= 55 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
            : 'text-red-400 border-red-500/30 bg-red-500/10';
    const Icon = score >= 75 ? TrendingUp : score >= 55 ? Minus : TrendingDown;

    return (
        <div className={cn("mt-2 flex items-start gap-2 p-2.5 rounded-xl border text-xs w-full", color)}>
            <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <div>
                <span className="font-bold">{score}/100</span>
                {feedback && <span className="ml-1.5 opacity-80">{feedback}</span>}
            </div>
        </div>
    );
}

export function InterviewInterface({ sessionId, initialQuestion, initialLanguage, initialCompanyStyle }: { sessionId: string; initialQuestion: string; initialLanguage?: string; initialCompanyStyle?: string }) {
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: initialQuestion }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [turnNumber, setTurnNumber] = useState(1);
    const [showTranscript, setShowTranscript] = useState(true);
    const [activeRightTab, setActiveRightTab] = useState<'transcript' | 'tips'>('transcript');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isEndingEarly, setIsEndingEarly] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [isInterviewEnded, setIsInterviewEnded] = useState(false);

    // Language & Style (from server props > sessionStorage fallback)
    const [language, setLanguage] = useState<'en' | 'tr'>((initialLanguage as 'en' | 'tr') || 'en');
    const [companyStyle, setCompanyStyle] = useState(initialCompanyStyle || 'standard');

    // Voice States
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const isSpeakingRef = useRef(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Camera State
    const [isCameraOn, setIsCameraOn] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const scrollEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    // UI copy based on language
    const t = {
        waitingForAnswer: language === 'tr' ? 'Sıra sizde' : 'Your turn',
        aiSpeaking: language === 'tr' ? 'Mülakatçı konuşuyor' : 'Interviewer speaking',
        aiThinking: '•••',
        typeAnswer: language === 'tr' ? 'Cevabınızı yazın veya mikrofonu kullanın...' : 'Type your answer or use the mic...',
        listening: language === 'tr' ? 'Dinliyor...' : 'Listening...',
        transcript: language === 'tr' ? 'Transkript' : 'Transcript',
        endInterview: language === 'tr' ? 'Mülakatı Bitir' : 'End Interview',
        endEarlyTitle: language === 'tr' ? 'Mülakatı sonlandırmak istiyor musunuz?' : 'Would you like to wrap up?',
        endEarlyDesc: language === 'tr'
            ? `Şimdiye kadarki yanıtlarınız ile detaylı bir performans raporu hazırlayacağız.`
            : `We'll prepare a detailed performance report based on your answers so far.`,
        keepGoing: language === 'tr' ? 'Devam Et' : 'Keep Going',
        yesEnd: language === 'tr' ? 'Bitir ve Raporu Al' : 'End & Get Report',
        question: language === 'tr' ? 'Soru' : 'Question',
        aiInterviewer: language === 'tr' ? 'Mülakatçı' : 'Interviewer',
        you: language === 'tr' ? 'Siz' : 'You',
        recording: language === 'tr' ? 'Kaydediliyor...' : 'Recording...',
        approxTime: language === 'tr' ? 'Yaklaşık 10-15 dk • 5 soru' : 'Approx. 10-15 min • 5 questions'
    };


    // 1. Initialize (NO auto-speak — wait for user gesture)
    useEffect(() => {
        // Fallback: Load session config from sessionStorage only if no server props
        if (!initialLanguage || !initialCompanyStyle) {
            try {
                const stored = sessionStorage.getItem(`interview_${sessionId}`);
                if (stored) {
                    const config = JSON.parse(stored);
                    if (!initialLanguage && config.language) setLanguage(config.language);
                    if (!initialCompanyStyle && config.companyStyle) setCompanyStyle(config.companyStyle);
                }
            } catch { }
        }

        // Timer
        timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);

        // Request notification permission
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission().then(p => setNotificationsEnabled(p === 'granted'));
        } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            setNotificationsEnabled(true);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (activeSourceRef.current) {
                try { activeSourceRef.current.stop(); } catch { }
            }
            if (audioCtxRef.current) {
                audioCtxRef.current.close().catch(() => { });
            }
        };
    }, []);

    // User clicks "Play" to hear first question — unlocks Chrome audio
    const handleFirstPlay = () => {
        setHasUserInteracted(true);

        // Web Audio API unlock: permanently unlocks audio for the page
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
        } catch { }

        // Now call speakText — audio.play() will work even from async code
        speakText(initialQuestion);
    };

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = useCallback((smooth = true) => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'instant'
            });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Track scroll position to show/hide scroll-to-bottom button
    const handleChatScroll = useCallback(() => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollBtn(!isNearBottom);
        }
    }, []);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    // Camera Toggle
    const toggleCamera = async () => {
        if (isCameraOn) {
            const src = videoRef.current?.srcObject as MediaStream;
            src?.getTracks().forEach(t => t.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
            setIsCameraOn(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
                setIsCameraOn(true);
            } catch {
                toast.error("Camera access denied. Check browser permissions.");
            }
        }
    };

    // Speech Recognition (STT)
    const startListening = () => {
        if (typeof window === 'undefined') return;
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { toast.error("Speech recognition not supported in this browser."); return; }

        const recognition = new SR();
        const langCodeMap: Record<string, string> = {
            en: 'en-US', tr: 'tr-TR', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', zh: 'zh-CN'
        };
        recognition.lang = langCodeMap[language] || 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
            }
            if (final) setInputText(p => p + (p ? ' ' : '') + final);
        };
        recognition.onerror = (e: any) => {
            setIsListening(false);
            if (e.error === 'not-allowed') toast.error("Microphone access denied.");
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => recognitionRef.current?.stop();

    // TTS — Google Cloud only (natural voice, no browser fallback)
    const speakText = async (text: string) => {
        console.log('[TTS] speakText called, text length:', text.length, 'isSpeakingRef:', isSpeakingRef.current);

        // Stop any currently playing audio first
        if (activeSourceRef.current) {
            try { activeSourceRef.current.stop(); } catch { }
            activeSourceRef.current = null;
        }

        // Ensure AudioContext exists (fallback if they didn't click first somehow)
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // If already speaking, stop and re-speak with new text
        if (isSpeakingRef.current) {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
        }

        const attemptTTS = async (attempt: number): Promise<boolean> => {
            try {
                isSpeakingRef.current = true;
                setIsSpeaking(true);
                console.log(`[TTS] Attempt ${attempt}: calling /api/tts`);
                const res = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: text.slice(0, 1000), language, companyStyle })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    console.error(`[TTS] Attempt ${attempt} failed [${res.status}]:`, errData);
                    return false;
                }

                const arrayBuffer = await res.arrayBuffer();
                console.log(`[TTS] Attempt ${attempt}: got audio buffer, size:`, arrayBuffer.byteLength);
                if (arrayBuffer.byteLength < 100) {
                    console.error(`[TTS] Attempt ${attempt}: audio too small (${arrayBuffer.byteLength} bytes)`);
                    return false;
                }

                // Make sure context is running
                if (audioCtxRef.current?.state === 'suspended') {
                    await audioCtxRef.current.resume();
                }

                // Decode and play via Web Audio API (with Safari Promise fallback)
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

                return new Promise<boolean>((resolve) => {
                    source.onended = () => {
                        isSpeakingRef.current = false;
                        setIsSpeaking(false);
                        activeSourceRef.current = null;
                        console.log('[TTS] Audio playback ended successfully');
                        resolve(true);
                    };

                    try {
                        source.start(0);
                    } catch (err) {
                        isSpeakingRef.current = false;
                        setIsSpeaking(false);
                        activeSourceRef.current = null;
                        console.error('[TTS] source.start() failed:', err);
                        resolve(false);
                    }
                });
            } catch (error) {
                console.error(`[TTS] Attempt ${attempt} error:`, error);
                return false;
            }
        };

        // Try Google Cloud with one retry
        const success = await attemptTTS(1);
        if (!success) {
            // Wait a moment and retry once
            await new Promise(r => setTimeout(r, 500));
            const retrySuccess = await attemptTTS(2);
            if (!retrySuccess) {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                console.error('[TTS] Both Google Cloud attempts failed.');
                toast.error(language === 'tr' ? "Yapay zeka sesi oluşturulamadı. Google Cloud API anahtarınızı kontrol edin." : "Could not generate AI voice. Please check your Google Cloud API Key.");
            }
        }
    };

    // Send a browser notification
    const sendNotification = (title: string, body: string) => {
        if (!notificationsEnabled || typeof Notification === 'undefined') return;
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
        }
    };

    const handleEndInterviewEarly = async () => {
        setIsEndingEarly(true);
        try {
            await fetch('/api/interview/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
            if (activeSourceRef.current) { try { activeSourceRef.current.stop(); } catch { } }
            if (timerRef.current) clearInterval(timerRef.current);
            toast.success(language === 'tr' ? "Mülakat bitti. Raporunuz hazırlanıyor..." : "Interview ended. Generating your feedback...");
            sendNotification("Interview Ended", "Your feedback report is being generated.");
            router.push(`/dashboard/interview/${sessionId}/feedback`);
        } catch {
            toast.error("Could not end interview. Please try again.");
            setIsEndingEarly(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;
        const userMsg = inputText;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInputText('');
        setIsLoading(true);
        if (activeSourceRef.current) { try { activeSourceRef.current.stop(); } catch { } }
        isSpeakingRef.current = false;
        setIsSpeaking(false);

        try {
            const res = await fetch('/api/interview/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, responseText: userMsg, turnNumber, language, companyStyle })
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();

            // Update the last user message with score data
            if (data.analysis) {
                setMessages(prev => {
                    const updated = [...prev];
                    const lastUserIdx = [...updated].reverse().findIndex(m => m.role === 'user');
                    if (lastUserIdx !== -1) {
                        const actualIdx = updated.length - 1 - lastUserIdx;
                        updated[actualIdx] = {
                            ...updated[actualIdx],
                            score: data.analysis.score,
                            feedback: data.analysis.feedback,
                            isStrong: data.analysis.isStrong
                        };
                    }
                    return updated;
                });
            }

            if (data.isCompleted) {
                setIsInterviewEnded(true);
                if (activeSourceRef.current) { try { activeSourceRef.current.stop(); } catch { } }
                if (timerRef.current) clearInterval(timerRef.current);
                toast.success(language === 'tr' ? "Mülakat tamamlandı! Raporunuz hazırlanıyor..." : "Interview Complete! Generating your report...");
                sendNotification("🎉 Interview Complete!", "Your personalized feedback report is ready. Click to view.");
                router.push(`/dashboard/interview/${sessionId}/feedback`);
                return;
            }

            const nextQ = data.nextQuestion;
            if (nextQ) {
                setMessages(prev => [...prev, { role: 'assistant', content: nextQ }]);
                setTurnNumber(data.turnNumber);
                setTimeout(() => speakText(nextQ), 300);
            }

        } catch {
            toast.error(language === 'tr' ? "Bir hata oluştu. Lütfen tekrar deneyin." : "Communication error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const avgScore = messages.filter(m => m.score !== undefined).reduce((sum, m, _, arr) =>
        sum + (m.score! / arr.length), 0);

    return (
        <div className="flex flex-col lg:flex-row bg-neutral-950 h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] w-full rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">

            {/* LEFT: AI Video Area */}
            <div className={cn("flex flex-col relative transition-all duration-300", showTranscript ? "h-[40vh] shrink-0 lg:h-auto lg:flex-1" : "w-full")}>

                {/* Top Bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 font-mono text-xs">
                            <Clock className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-blue-400 font-semibold tracking-widest">{formatTime(elapsedSeconds)}</span>
                        </div>
                        {language === 'tr' && (
                            <span className="text-[11px] text-amber-400/80 border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded-full">🇹🇷 Türkçe</span>
                        )}
                        {companyStyle !== 'standard' && (
                            <span className="text-[11px] text-purple-400/80 border border-purple-500/20 bg-purple-500/5 px-2 py-0.5 rounded-full capitalize">✨ {companyStyle}</span>
                        )}
                    </div>

                    {/* Question Progress — subtle dots only */}
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
                                <div key={i} className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-all duration-500",
                                    i < turnNumber ? "bg-blue-500" : "bg-neutral-700"
                                )} />
                            ))}
                        </div>
                    </div>

                    {/* End Interview */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={isEndingEarly}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 gap-1.5 text-xs">
                                {isEndingEarly ? <Loader2 className="h-3 w-3 animate-spin" /> : <PhoneOff className="h-3 w-3" />}
                                {t.endInterview}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-neutral-900 border-neutral-700 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t.endEarlyTitle}</AlertDialogTitle>
                                <AlertDialogDescription className="text-neutral-400">{t.endEarlyDesc}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700">{t.keepGoing}</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleEndInterviewEarly}>{t.yesEnd}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* AI Presence */}
                <div className="flex-[2] flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 relative border-b border-neutral-800 overflow-hidden">
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: 'linear-gradient(rgba(99,179,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }} />

                    {/* Ambient glow */}
                    {isSpeaking && <div className="absolute inset-0 bg-blue-500/5 animate-pulse rounded-full blur-3xl" />}

                    {/* Status pill */}
                    <div className="absolute top-4">
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-500",
                            isSpeaking ? "bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/10"
                                : isLoading ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                    : "bg-neutral-800 border-neutral-700 text-neutral-400"
                        )}>
                            <span className={cn("h-1.5 w-1.5 rounded-full",
                                isSpeaking ? "bg-blue-400 animate-pulse" : isLoading ? "bg-amber-400 animate-pulse" : "bg-neutral-500")} />
                            {isSpeaking ? t.aiSpeaking : isLoading ? t.aiThinking : t.waitingForAnswer}
                        </div>
                    </div>

                    {/* First-play overlay — unlocks Chrome audio */}
                    {!hasUserInteracted && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm">
                            <button
                                onClick={handleFirstPlay}
                                className="flex flex-col items-center gap-4 group"
                            >
                                <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                                    <Volume2 className="h-10 w-10 text-white" />
                                </div>
                                <span className="text-blue-300 text-sm font-medium">
                                    {language === 'tr' ? '▶ Soruyu Dinle' : '▶ Play Question'}
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Interviewer Avatar */}
                    <div className={cn(
                        "relative z-10 rounded-full p-8 transition-all duration-700",
                        isSpeaking ? "bg-blue-500/10 scale-110 shadow-[0_0_80px_rgba(59,130,246,0.12)]" : "bg-neutral-800/30"
                    )}>
                        <UserCircle className={cn("h-20 w-20 transition-colors duration-500", isSpeaking ? "text-blue-400" : "text-neutral-500")} />
                        {isSpeaking && <span className="animate-ping absolute inset-0 rounded-full bg-blue-400 opacity-[0.07]" />}
                    </div>

                    <div className="mt-6 h-12">
                        <AudioVisualizer isSpeaking={isSpeaking} />
                    </div>

                    {/* Re-read button — made more visible */}
                    {!isLoading && hasUserInteracted && messages.some(m => m.role === 'assistant') && (
                        <button
                            onClick={() => {
                                const lastAI = [...messages].reverse().find(m => m.role === 'assistant');
                                if (lastAI) speakText(lastAI.content);
                            }}
                            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/60 border border-neutral-700 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs transition-all"
                        >
                            <Volume2 className="h-4 w-4" />
                            {language === 'tr' ? 'Soruyu Tekrar Dinle' : 'Replay Question'}
                        </button>
                    )}
                </div>

                {/* User Camera */}
                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden min-h-[160px]">
                    {isCameraOn ? (
                        <video ref={videoRef} autoPlay muted playsInline
                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                    ) : (
                        <div className="text-center space-y-2">
                            <div className="h-14 w-14 bg-neutral-800 rounded-full flex items-center justify-center mx-auto border border-neutral-700">
                                <User className="h-7 w-7 text-neutral-500" />
                            </div>
                            <p className="text-neutral-600 text-xs">{language === 'tr' ? 'Kamera Kapalı' : 'Camera Off'}</p>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-neutral-900/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-neutral-700 shadow-xl z-20">
                        <Button variant="ghost" size="icon" onClick={toggleCamera}
                            className={cn("rounded-full h-10 w-10 hover:bg-neutral-700", isCameraOn ? "text-white" : "text-red-400/80")}
                            title="Toggle Camera">
                            {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>

                        <Button
                            variant={isListening ? "destructive" : "default"}
                            size="icon"
                            onClick={isListening ? stopListening : startListening}
                            className={cn("rounded-full shadow-lg transition-all duration-200 h-12 w-12 border-0",
                                isListening ? "animate-pulse ring-4 ring-red-500/25 scale-110 bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500")}
                            disabled={isLoading}
                            title={isListening ? "Stop" : "Start voice input"}>
                            {isListening ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => setShowTranscript(!showTranscript)}
                            className={cn("rounded-full h-10 w-10 hover:bg-neutral-700", showTranscript ? "text-blue-400" : "text-neutral-500")}
                            title="Toggle Transcript">
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                    </div>

                    {isListening && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full z-20">
                            <span className="h-2 w-2 bg-red-400 rounded-full animate-pulse" />
                            <span className="text-red-300 text-xs font-medium">{t.recording}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Panel */}
            {showTranscript && (
                <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-900 flex flex-col flex-1 lg:max-h-none transition-all duration-300">
                    <div className="flex border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-10">
                        <button
                            onClick={() => setActiveRightTab('transcript')}
                            className={cn(
                                "flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors border-b-2",
                                activeRightTab === 'transcript' ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-neutral-500 hover:text-neutral-300"
                            )}
                        >
                            <MessageSquare className="h-4 w-4" />
                            {language === 'tr' ? 'Transkript' : 'Transcript'}
                            <span className="text-xs bg-neutral-800 px-2 py-0.5 rounded-full ml-1">{messages.length}</span>
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
                            <>
                                <div
                                    ref={chatContainerRef}
                                    onScroll={handleChatScroll}
                                    className="absolute inset-0 overflow-y-auto p-4 scroll-smooth"
                                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#444 transparent' }}
                                >
                                    <div className="space-y-4">
                                        {messages.map((m, i) => (
                                            <div key={i} className={cn("flex flex-col gap-1", m.role === 'user' ? "items-end" : "items-start")}>
                                                <div className={cn(
                                                    "max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed",
                                                    m.role === 'user'
                                                        ? "bg-blue-600 text-white rounded-tr-sm"
                                                        : "bg-neutral-800 text-neutral-200 rounded-tl-sm border border-neutral-700"
                                                )}>
                                                    {m.content}
                                                </div>

                                                {/* Score badge — only show after interview is ended */}
                                                {isInterviewEnded && m.role === 'user' && m.score !== undefined && (
                                                    <div className="w-[90%]">
                                                        <ScoreBadge score={m.score} feedback={m.feedback || ''} isStrong={m.isStrong || false} />
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1 px-1">
                                                    {m.role === 'assistant' ? <Bot className="h-3 w-3 text-neutral-600" /> : <User className="h-3 w-3 text-neutral-600" />}
                                                    <span className="text-[10px] text-neutral-600 uppercase">{m.role === 'assistant' ? t.aiInterviewer : t.you}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {isLoading && (
                                            <div className="flex items-center gap-2 text-neutral-500 text-xs pl-2">
                                                <div className="flex gap-1">
                                                    {[0, 1, 2].map(i => (
                                                        <span key={i} className="h-1.5 w-1.5 bg-neutral-500 rounded-full animate-bounce"
                                                            style={{ animationDelay: `${i * 100}ms` }} />
                                                    ))}
                                                </div>
                                                <span>{language === 'tr' ? 'Koç düşünüyor...' : 'Coach thinking...'}</span>
                                            </div>
                                        )}
                                        <div ref={scrollEndRef} />
                                    </div>
                                </div>

                                {/* Scroll to bottom button */}
                                {showScrollBtn && (
                                    <button
                                        onClick={() => scrollToBottom()}
                                        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-medium shadow-lg shadow-blue-900/40 backdrop-blur-sm border border-blue-500/30 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                                    >
                                        <ChevronDown className="h-3.5 w-3.5" />
                                        {language === 'tr' ? 'Aşağı Kaydır' : 'Scroll Down'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="absolute inset-0 overflow-y-auto p-5 space-y-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#444 transparent' }}>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 mb-3">
                                        <Lightbulb className="h-4 w-4 text-amber-400" />
                                        {language === 'tr' ? "STAR Formatını Kullanın" : "Use the STAR Method"}
                                    </h3>
                                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                                        {language === 'tr'
                                            ? "Davranışsal sorularda cevaplarınızı yapılandırırken her zaman STAR metoduna başvurun. Bu, cevabınızın akıcı ve net olmasını sağlar."
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
                                        {companyStyle === 'google' && <li>{language === 'tr' ? "Büyük ölçekte düşünme ve çoklu çözümler sunma." : "Thinking at scale and showing Googliness."}</li>}
                                        {companyStyle === 'amazon' && <li>{language === 'tr' ? "Liderlik prensipleriyle (LPs) süslenmiş somut kanıtlar." : "Solid evidence mapped to Amazon Leadership Principles."}</li>}
                                        {companyStyle === 'startup' && <li>{language === 'tr' ? "Pratik olma, iş bitiricilik ve hız." : "Hackiness, speed, and getting things done fast."}</li>}
                                        <li>{language === 'tr' ? "'Biz' değil, 'Ben' demeniz; gruptan izole şekilde sizin katkınız." : "Focus on 'I' instead of 'We'. Highlighting your specific contribution."}</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Text Input */}
                    <div className="p-4 border-t border-neutral-800 bg-neutral-900/80">
                        {isListening && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-red-400">
                                <span className="h-1.5 w-1.5 bg-red-400 rounded-full animate-pulse" />
                                {language === 'tr' ? 'Ses girişi aktif — konuşun, sonra Gönder\'e tıklayın' : 'Voice input active — speak, then click Send'}
                            </div>
                        )}
                        <div className="relative">
                            <Textarea
                                placeholder={isListening ? (language === 'tr' ? 'Dinleniyor...' : 'Listening...') : t.typeAnswer}
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                                }}
                                className="min-h-[90px] bg-neutral-950 border-neutral-800 resize-none pr-12 focus-visible:ring-blue-500/40 text-neutral-200 placeholder:text-neutral-600"
                                disabled={isLoading}
                            />
                            <Button size="icon"
                                className="absolute bottom-2 right-2 h-8 w-8 bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
                                onClick={handleSend}
                                disabled={!inputText.trim() || isLoading}>
                                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                        <p className="text-[10px] text-neutral-700 mt-2 text-center">
                            {language === 'tr' ? 'Enter: Gönder • Shift+Enter: Yeni satır' : 'Enter to send • Shift+Enter for new line'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
