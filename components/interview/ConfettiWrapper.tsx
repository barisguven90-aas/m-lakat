"use client";

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiWrapperProps {
  score: number;
  delay?: number;
}

export function ConfettiWrapper({ score, delay = 1000 }: ConfettiWrapperProps) {
  useEffect(() => {
    if (score >= 50) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']
        });
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [score, delay]);

  return null;
}
