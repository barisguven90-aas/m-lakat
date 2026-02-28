import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard']

// Routes that require PRO subscription
const PRO_ROUTES = [
    '/api/interview/start',
    '/api/interview/chat',
    '/api/interview/voice/start',
]

// Free tier limits
const FREE_TIER_LIMITS = {
    interviews_per_month: 2,
    applications: 3,
}

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // 1. Auth Protection — redirect unauthenticated users away from /dashboard
    const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
    if (isProtected && !user) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // 2. Subscription gating for API routes 
    const isProRoute = PRO_ROUTES.some(r => pathname.startsWith(r))
    if (isProRoute && user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status, subscription_ends_at')
            .eq('id', user.id)
            .single()

        const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'

        if (!isPro) {
            // Check free tier interview limit
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { count } = await supabase
                .from('interview_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', startOfMonth.toISOString())

            if ((count || 0) >= FREE_TIER_LIMITS.interviews_per_month) {
                return NextResponse.json(
                    {
                        error: 'Free tier limit reached',
                        code: 'SUBSCRIPTION_REQUIRED',
                        message: `You have used all ${FREE_TIER_LIMITS.interviews_per_month} free interviews this month. Upgrade to Pro for unlimited interviews.`,
                        limit: FREE_TIER_LIMITS.interviews_per_month,
                        used: count || 0,
                    },
                    { status: 403 }
                )
            }
        }
    }

    return response
}
