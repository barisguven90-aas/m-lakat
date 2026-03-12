"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, User, Zap, Sun, Moon, Bell, CheckCheck, Info, Trophy, AlertTriangle, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { LanguageToggle } from "./LanguageToggle"

interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'achievement'
    read: boolean
    link?: string
    created_at: string
}

export function DashboardHeader() {
    const supabase = createClient()
    const router = useRouter()
    const [userInitial, setUserInitial] = useState("?")
    const [userName, setUserName] = useState("")
    const [isPro, setIsPro] = useState(false)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifOpen, setNotifOpen] = useState(false)

    useEffect(() => { setMounted(true) }, [])

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

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const res = await fetch('/api/notifications')
                if (res.ok) {
                    const data = await res.json()
                    setNotifications(data.notifications || [])
                    setUnreadCount(data.unreadCount || 0)
                }
            } catch { /* silent fail if table doesn't exist yet */ }
        }
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000) // refresh every minute
        return () => clearInterval(interval)
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true })
            })
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch { /* ignore */ }
    }

    const getNotifIcon = (type: string) => {
        switch (type) {
            case 'success': return <Trophy className="h-4 w-4 text-emerald-500" />
            case 'achievement': return <Sparkles className="h-4 w-4 text-amber-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <div className="flex items-center gap-3 ml-auto">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Dark Mode Toggle */}
            {mounted && (
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-400"
                    aria-label="Toggle dark mode"
                >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
            )}

            {/* Notifications */}
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                <DropdownMenuTrigger className="focus:outline-none">
                    <div className="relative h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-400 cursor-pointer">
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-sm">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
                    <div className="flex items-center justify-between px-3 py-2">
                        <DropdownMenuLabel className="p-0 text-sm">Notifications</DropdownMenuLabel>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <CheckCheck className="h-3 w-3" /> Mark all read
                            </button>
                        )}
                    </div>
                    <DropdownMenuSeparator />
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center">
                            <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.slice(0, 10).map(notif => (
                            <DropdownMenuItem
                                key={notif.id}
                                className={`flex items-start gap-3 p-3 cursor-pointer ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                onClick={() => {
                                    if (notif.link) router.push(notif.link)
                                }}
                            >
                                <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {notif.title}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                                {!notif.read && (
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Upgrade / Pro Badge */}
            {isPro ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold uppercase tracking-wider">
                    PRO
                </div>
            ) : (
                <Link href="/pricing" className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-blue-600 px-4 py-1.5 font-medium text-white transition duration-300 ease-out hover:scale-105 active:scale-95">
                    <span className="absolute inset-0 z-0 h-full w-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 opacity-100 transition-opacity duration-500 group-hover:opacity-80 border-b-2 border-blue-700" />
                    <span className="absolute -left-[100%] top-0 z-10 h-[200%] w-[50%] -rotate-45 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-1000 group-hover:left-[200%]" />
                    <span className="relative z-20 flex items-center gap-1.5 text-sm font-semibold tracking-wide drop-shadow-sm">
                        Upgrade <Zap className="h-4 w-4 fill-white/80" />
                    </span>
                </Link>
            )}

            {/* Profile Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2.5 px-1 py-1 pr-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
                        <div className="h-8 w-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-600">
                            {userInitial}
                        </div>
                        {userName && <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{userName}</span>}
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
