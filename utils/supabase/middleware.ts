
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    console.log('Middleware: Path:', request.nextUrl.pathname)
    console.log('Middleware: User found?', !!user)

    // Unauthenticated user attempting to access protected routes -> redirect to login
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/register') &&
        !request.nextUrl.pathname.startsWith('/home') &&
        !request.nextUrl.pathname.startsWith('/about') &&
        !request.nextUrl.pathname.startsWith('/blog') &&
        !request.nextUrl.pathname.startsWith('/sales') &&
        !request.nextUrl.pathname.startsWith('/pricing') &&
        !request.nextUrl.pathname.startsWith('/archive-manifesto') &&
        !request.nextUrl.pathname.startsWith('/api') &&
        !request.nextUrl.pathname.endsWith('.xml') &&
        !request.nextUrl.pathname.endsWith('.txt') &&
        !request.nextUrl.pathname.endsWith('.json') &&
        !request.nextUrl.pathname.match(/\.(mp3|wav|ogg|mp4|webm|png|jpg|jpeg|gif|svg|ico)$/) &&
        request.nextUrl.pathname !== '/'
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Authenticated user attempting to access auth/firewall pages -> redirect to app dashboard
    if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
