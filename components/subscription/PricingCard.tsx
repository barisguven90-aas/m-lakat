"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PricingCard() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/stripe/create-checkout', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to start checkout');
            const { url } = await res.json();
            window.location.href = url;
        } catch (e) {
            toast.error("Could not initiate checkout");
            console.error(e);
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm mx-auto border-blue-500 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                Best Value
            </div>
            <CardHeader>
                <CardTitle className="text-2xl">Pro Plan</CardTitle>
                <CardDescription>Unlock unlimited AI interviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$79</span>
                    <span className="text-muted-foreground">/year</span>
                </div>
                <div className="text-sm text-green-600 font-medium bg-green-50 p-2 rounded-md text-center">
                    7-Day Free Trial Included
                </div>
                <ul className="space-y-2 pt-4">
                    {[
                        "Unlimited Applications",
                        "Advanced AI Match Analysis",
                        "Real-time Interview Coaching",
                        "Detailed Feedback Reports",
                        "Exclusive 21st.dev UI Access"
                    ].map(feature => (
                        <li key={feature} className="flex gap-2 items-center">
                            <Check className="h-4 w-4 text-primary" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSubscribe} disabled={isLoading}>
                    {isLoading ? "Redirecting..." : "Start 7-Day Free Trial"}
                </Button>
            </CardFooter>
        </Card>
    );
}
