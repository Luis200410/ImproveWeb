'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error('Server signout error', error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
}
