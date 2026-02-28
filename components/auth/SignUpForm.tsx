"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    full_name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
})

export function SignUpForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        console.log("Attempting signup for:", values.email);

        try {
            // 1. Try to sign up
            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.full_name,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                console.error("Signup error:", error);
                throw error
            }

            console.log("Signup returned data:", data);

            // 2. Check if user is created but session is null (Email confirmation required)
            if (data.user && !data.session) {
                toast.success("Account created successfully! Please check your email to verify your account.");
                // Optionally redirect to a specific 'verify-email' landing page
                return;
            }

            // 3. User created AND session exists (Email confirmation disabled or auto-confirmed)
            if (data.user && data.session) {
                toast.success("Welcome aboard!");
                router.push("/dashboard");
                return;
            }

            // Fallback
            toast.info("Please check your email for a verification link.");

        } catch (error: any) {
            console.error("Catch block error:", error);

            // Better error messages
            if (error.message.includes("User already registered")) {
                toast.error("This email is already registered. Please log in.");
            } else if (error.message.includes("rate limit")) {
                toast.error("Too many attempts. Please try again later.");
            } else {
                toast.error(error.message || "Failed to create account. Please try again.");
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-white/30" />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-white/30" />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-white/30" />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </form>
        </Form>
    )
}
