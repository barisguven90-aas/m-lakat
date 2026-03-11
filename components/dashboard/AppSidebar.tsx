"use client"

import {
    Home, FileText, User, Settings, LogOut, BrainCircuit, CreditCard
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

const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Applications", url: "/dashboard/applications", icon: FileText },
    { title: "Interviews", url: "/dashboard/interviews", icon: User },
    { title: "Planlar", url: "/pricing", icon: CreditCard },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [userInitial, setUserInitial] = useState("?")
    const [userName, setUserName] = useState("")

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
                const fullName = profile?.full_name || user.user_metadata?.full_name || user.email || ""
                setUserName(fullName.split(" ")[0] || fullName)
                setUserInitial((fullName[0] || "?").toUpperCase())
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
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-2.5 font-bold text-lg">
                    <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <BrainCircuit className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="truncate text-sidebar-foreground">Intervio</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-3 border-t border-sidebar-border space-y-1">
                {/* Note: Profile has been moved to top-right DashboardHeader */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleSignOut}
                            tooltip="Sign Out"
                            className="text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                            <LogOut />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
