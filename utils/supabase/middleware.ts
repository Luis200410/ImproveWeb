
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return supabaseResponse
    }

    const allCookies = request.cookies.getAll()
    const hasAuthCookie = allCookies.some(c => c.name.startsWith('sb-') || c.name.includes('auth-token'))

    // If there are no auth cookies and user is not visiting /login or /register, skip network auth call completely
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
    if (!hasAuthCookie && !isAuthRoute) {
        return supabaseResponse
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    let user = null
    try {
        const userPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise<{ data: { user: null }; error: any }>((resolve) =>
            setTimeout(() => resolve({ data: { user: null }, error: new Error('Auth timeout') }), 600)
        )
        const { data } = await Promise.race([userPromise, timeoutPromise])
        user = data?.user ?? null
    } catch {
        // Fail silently without blocking route navigation
    }

    // Authenticated user attempting to access auth pages -> redirect to app or home
    if (user && isAuthRoute) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        if (appUrl && !appUrl.startsWith(request.nextUrl.origin)) {
            return NextResponse.redirect(appUrl)
        }
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

