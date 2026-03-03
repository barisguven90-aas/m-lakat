"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, User, Zap } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function DashboardHeader() {
    const supabase = createClient()
    const router = useRouter()
    const [userInitial, setUserInitial] = useState("?")
    const [userName, setUserName] = useState("")
    const [isPro, setIsPro] = useState(false)

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('full_name, subscription_status').eq('id', user.id).single()
                const fullName = profile?.full_name || user.user_metadata?.full_name || user.email || ""
                setUserName(fullName.split(" ")[0] || fullName)
                setUserInitial((fullName[0] || "?").toUpperCase())

                setIsPro(profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing')
            }
        }
        fetchUser()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <div className="flex items-center gap-4 ml-auto">
            {/* Upgrade Button / Pro Badge */}
            {isPro ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold uppercase tracking-wider">
                    PRO
                </div>
            ) : (
                <Link href="/pricing" className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-blue-600 px-4 py-1.5 font-medium text-white transition duration-300 ease-out hover:scale-105 active:scale-95">
                    <span className="absolute inset-0 z-0 h-full w-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 opacity-100 transition-opacity duration-500 group-hover:opacity-80 border-b-2 border-blue-700" />
                    {/* Shimmer effect */}
                    <span className="absolute -left-[100%] top-0 z-10 h-[200%] w-[50%] -rotate-45 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-1000 group-hover:left-[200%]" />
                    <span className="relative z-20 flex items-center gap-1.5 text-sm font-semibold tracking-wide drop-shadow-sm">
                        Upgrade <Zap className="h-4 w-4 fill-white/80" />
                    </span>
                </Link>
            )}

            {/* Profile Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2.5 px-1 py-1 pr-3 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-neutral-200">
                        <div className="h-8 w-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-600">
                            {userInitial}
                        </div>
                        {userName && <span className="text-sm font-medium text-neutral-700">{userName}</span>}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings" className="cursor-pointer flex items-center gap-2">
                            <User className="h-4 w-4 text-neutral-500" />
                            Profile Settings
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
