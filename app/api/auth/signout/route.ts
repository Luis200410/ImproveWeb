import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// GET  → used when the browser navigates directly to /api/auth/signout
// POST → kept for backwards compatible fetch calls
async function handleSignOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Build a redirect response — cookies are cleared in the SAME response
    const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
        status: 302,
    })

    // Force-expire every sb-* cookie in the browser
    const cookieStore = await cookies()
    for (const cookie of cookieStore.getAll()) {
        if (cookie.name.startsWith('sb-')) {
            response.cookies.set(cookie.name, '', {
                path: '/',
                maxAge: 0,
                expires: new Date(0),
                httpOnly: true,
                sameSite: 'lax',
            })
        }
    }

    return response
}

export async function GET() {
    return handleSignOut()
}

export async function POST() {
    return handleSignOut()
}
