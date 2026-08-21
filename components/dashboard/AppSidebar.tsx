"use client"

import {
    Home, FileText, User, Settings, LogOut, BrainCircuit, CreditCard, MonitorSmartphone, Shield
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import Link from "next/link"
import { DesktopAppModal } from "./DesktopAppModal"
import { useLanguageStore } from "@/store/useLanguageStore"

const navItems = [
    { titleKey: "nav_dashboard", url: "/dashboard", icon: Home },
    { titleKey: "nav_applications", url: "/dashboard/applications", icon: FileText },
    { titleKey: "nav_interviews", url: "/dashboard/interviews", icon: User },
    { titleKey: "nav_billing", url: "/pricing", icon: CreditCard },
    { titleKey: "nav_settings", url: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const { t } = useLanguageStore()
    const [userInitial, setUserInitial] = useState("?")
    const [userName, setUserName] = useState("")
    const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
                const fullName = profile?.full_name || user.user_metadata?.full_name || user.email || ""
                setUserName(fullName.split(" ")[0] || fullName)
                setUserInitial((fullName[0] || "?").toUpperCase())
                
                // Admin link visibility check
                const adminEmails = ['barisguven90@gmail.com'];
                if (user.email && adminEmails.includes(user.email)) {
                    setIsAdmin(true)
                }
            }
        }
        fetchUser()
    }, [])

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error("Error signing out")
        } else {
            router.push("/login")
        }
    }

    const isActive = (url: string) =>
        url === "/dashboard" ? pathname === url : pathname.startsWith(url)

    return (
        <>
            <Sidebar collapsible="icon">
                <SidebarHeader className="p-4 border-b border-sidebar-border">
                    <div className="flex items-center gap-2.5 font-bold text-lg">
                        <div className="flex items-center justify-center">
                            <img src="/logo.png" alt="Intervio Logo" className="h-8 w-8 object-contain rounded shadow-sm" />
                        </div>
                        <span translate="no" className="notranslate font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">Intervio</span>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>{t('nav_navigation') as string}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(item.url)}
                                            tooltip={t(item.titleKey as any) as string}
                                        >
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{t(item.titleKey as any) as string}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                                {isAdmin && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive('/dashboard/admin')} tooltip={t('nav_admin_panel') as string}>
                                            <Link href="/dashboard/admin">
                                                <Shield className="text-amber-500" />
                                                <span className="text-amber-500 font-medium">{t('nav_admin_panel') as string}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="p-3 border-t border-sidebar-border space-y-1">
                    {/* Note: Profile has been moved to top-right DashboardHeader */}
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => setIsDesktopModalOpen(true)}
                                tooltip={t('nav_desktop_app') as string}
                                className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors"
                            >
                                <MonitorSmartphone />
                                <span>{t('nav_desktop_app') as string}</span>
                                <div className="ml-auto text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">{t('nav_new') as string}</div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={handleSignOut}
                                tooltip={t('nav_sign_out') as string}
                                className="text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut />
                                <span>{t('nav_sign_out') as string}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <DesktopAppModal isOpen={isDesktopModalOpen} onClose={() => setIsDesktopModalOpen(false)} />
        </>
    )
}
