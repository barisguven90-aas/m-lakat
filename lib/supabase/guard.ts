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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key'

    // Attempt to manually fetch the auth token from cookies
    const cookieHeader = request.headers.get('cookie')
    let accessToken = ''

    if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim())
        const sbCookie = cookies.find(c => c.startsWith('sb-') && c.endsWith('-auth-token'))
        if (sbCookie) {
            try {
                const cookieValue = decodeURIComponent(sbCookie.split('=')[1])
                const tokenData = JSON.parse(cookieValue)
                if (Array.isArray(tokenData) && tokenData[0]) {
                    accessToken = tokenData[0]
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }

    const pathname = request.nextUrl.pathname

    // Auth Protection — redirect unauthenticated users away from /dashboard
    const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
    if (isProtected && !accessToken) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    let user = null;

    if (accessToken) {
        // Fetch user from Supabase Auth REST API
        const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${accessToken}`
            }
        })
        if (userRes.ok) {
            user = await userRes.json()
        } else if (isProtected) {
            // Invalid token but trying to access protected route
            const loginUrl = request.nextUrl.clone()
            loginUrl.pathname = '/login'
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Subscription gating for API routes
    const isProRoute = PRO_ROUTES.some(r => pathname.startsWith(r))
    if (isProRoute && user) {
        // Fetch profile
        const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=subscription_status,subscription_ends_at`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${accessToken}`
            }
        })
        let isPro = false;
        if (profileRes.ok) {
            const profiles = await profileRes.json()
            const profile = profiles[0]
            isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
        }

        if (!isPro) {
            // Check free tier interview limit
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const countRes = await fetch(`${supabaseUrl}/rest/v1/interview_sessions?user_id=eq.${user.id}&created_at=gte.${startOfMonth.toISOString()}&select=id`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${accessToken}`,
                    'Prefer': 'count=exact,head=true'
                }
            });

            // The count is returned in the Content-Range header: e.g., "0-0/1" or "*/0"
            const contentRange = countRes.headers.get('content-range') || '0-0/0';
            const countStr = contentRange.split('/')[1];
            const count = parseInt(countStr, 10) || 0;

            if (count >= FREE_TIER_LIMITS.interviews_per_month) {
                return NextResponse.json(
                    {
                        error: 'Free tier limit reached',
                        code: 'SUBSCRIPTION_REQUIRED',
                        message: `You have used all ${FREE_TIER_LIMITS.interviews_per_month} free interviews this month. Upgrade to Pro for unlimited interviews.`,
                        limit: FREE_TIER_LIMITS.interviews_per_month,
                        used: count,
                    },
                    { status: 403 }
                )
            }
        }
    }

    return response
}
