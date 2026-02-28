"use client";

import React from 'react';
import { cn } from '@/lib/utils';

const BAR_DELAYS = [0, 0.1, 0.2, 0.15, 0.05, 0.25, 0.08, 0.18, 0.12, 0.22];
const BAR_HEIGHTS = ['30%', '60%', '90%', '70%', '45%', '80%', '55%', '95%', '65%', '40%'];

export function AudioVisualizer({ isSpeaking }: { isSpeaking: boolean }) {
    return (
        <div className="flex items-center justify-center gap-[3px] h-12" role="img" aria-label="Audio visualizer">
            {BAR_DELAYS.map((delay, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-[3px] rounded-full transition-all",
                        isSpeaking
                            ? "bg-gradient-to-t from-blue-600 to-blue-300"
                            : "bg-neutral-700 opacity-40"
                    )}
                    style={{
                        height: isSpeaking ? BAR_HEIGHTS[i] : '4px',
                        animationName: isSpeaking ? 'audioBar' : 'none',
                        animationDuration: `${0.5 + delay}s`,
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDirection: 'alternate',
                        animationDelay: `${delay}s`,
                        maxHeight: '48px',
                        minHeight: '4px',
                        transition: 'height 0.3s ease, background 0.3s ease'
                    }}
                />
            ))}

            <style jsx global>{`
                @keyframes audioBar {
                    0% { transform: scaleY(0.2); opacity: 0.5; }
                    50% { transform: scaleY(1); opacity: 1; }
                    100% { transform: scaleY(0.4); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}
