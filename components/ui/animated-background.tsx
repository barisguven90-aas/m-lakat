"use client";

import { useEffect, useRef } from "react";

export function AnimatedAuthBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);

        const opts = {
            color: "rgba(59, 130, 246, 0.15)", // tailwind blue-500
            glow: "rgba(147, 197, 253, 0.4)", // tailwind blue-300
            speed: 0.0003,
            particleCount: 50,
            particleSize: 3,
            particleSpeed: 0.4,
        };

        const particles: any[] = [];
        for (let i = 0; i < opts.particleCount; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * opts.particleSpeed,
                vy: (Math.random() - 0.5) * opts.particleSpeed,
                size: Math.random() * opts.particleSize + 1,
            });
        }

        let time = 0;

        const render = () => {
            ctx.clearRect(0, 0, w, h);

            // Draw subtle gradient background
            const gradient = ctx.createLinearGradient(0, 0, w, h);
            gradient.addColorStop(0, "#09090b"); // zinc-950
            gradient.addColorStop(1, "#18181b"); // zinc-900
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            // Aurora / glow spots
            const cx = w / 2 + Math.sin(time) * 200;
            const cy = h / 2 + Math.cos(time * 0.8) * 200;

            const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 600);
            grd.addColorStop(0, opts.glow);
            grd.addColorStop(1, "transparent");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, w, h);

            // Draw Particles & Connections
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = opts.color;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 - dist / 1500})`; // connecting line opacity depends on distance
                        ctx.stroke();
                    }
                }
            }

            time += opts.speed;
            requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-zinc-950">
            <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
    );
}
