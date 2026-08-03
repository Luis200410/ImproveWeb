

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.getUser()
        const user = data?.user ?? null

        if (error || !user) {
            return NextResponse.json({ user: null, subscriptionStatus: null }, { status: 200 })
        }

        const { data: subscriptionEntry } = await supabase
            .from('entries')
            .select('data')
            .eq('user_id', user.id)
            .eq('microapp_id', 'subscription-status')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        const rawData = subscriptionEntry?.data
        const parsedData = typeof rawData === 'string' ? (() => {
            try { return JSON.parse(rawData) } catch { return null }
        })() : rawData
        const status = (parsedData?.status as string | undefined)?.toLowerCase() || null

        return NextResponse.json({
            user,
            subscriptionStatus: status
        })
    } catch (e) {
        console.error('/api/auth/me error:', e)
        return NextResponse.json({ user: null, subscriptionStatus: null }, { status: 200 })
    }
}

