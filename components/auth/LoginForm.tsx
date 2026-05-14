"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useLanguageStore } from "@/store/useLanguageStore"

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

const getFormSchema = (lang: string) => z.object({
    email: z.string().email({
        message: lang === 'tr' ? "Lütfen geçerli bir e-posta adresi girin." : "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: lang === 'tr' ? "Şifre en az 6 karakter olmalıdır." : "Password must be at least 6 characters.",
    }),
})

type FormValues = z.infer<ReturnType<typeof getFormSchema>>

export function LoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const supabase = createClient()
    const { language } = useLanguageStore()
    
    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => setIsMounted(true), [])

    const formSchema = React.useMemo(() => getFormSchema(language), [language])

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        console.log("Attempting login for:", values.email);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            })

            if (error) {
                console.error("Login Error Details:", error);
                throw error
            }

            toast.success("Welcome back!")
            router.push("/dashboard")
            router.refresh()
        } catch (error: any) {
            console.error("Catch login error:", error);
            if (error.message.includes("Invalid login credentials")) {
                toast.error(language === 'tr' ? "E-posta veya şifre hatalı." : "Incorrect email or password.");
            } else if (error.message.includes("Email not confirmed")) {
                toast.warning(language === 'tr' ? "Giriş yapmadan önce lütfen e-posta adresinizi onaylayın. Gelen kutunuzu kontrol edin." : "Please confirm your email address before logging in. Check your inbox.");
            } else {
                toast.error(error.message || (language === 'tr' ? "Giriş yapılamadı. Lütfen tekrar deneyin." : "Failed to login. Please try again."))
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
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">{language === 'tr' ? 'E-posta' : 'Email'}</FormLabel>
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
                            <FormLabel className="text-white">{language === 'tr' ? 'Şifre' : 'Password'}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-white/30" />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isMounted && language === 'tr' ? 'Giriş Yap' : 'Sign In'}
                </Button>
            </form>
        </Form>
    )
}
