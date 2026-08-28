

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        
        const userPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise<{ data: { user: null }; error: any }>((resolve) => 
            setTimeout(() => resolve({ data: { user: null }, error: new Error('Auth timeout') }), 800)
        )
        const { data, error } = await Promise.race([userPromise, timeoutPromise])
        const user = data?.user ?? null

        if (error || !user) {
            return NextResponse.json({ user: null, subscriptionStatus: null }, { status: 200 })
        }

        const entryPromise = supabase
            .from('entries')
            .select('data')
            .eq('user_id', user.id)
            .eq('microapp_id', 'subscription-status')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        
        const { data: subscriptionEntry } = await Promise.race([
            entryPromise,
            new Promise<any>((resolve) => setTimeout(() => resolve({ data: null }), 800))
        ])

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
        return NextResponse.json({ user: null, subscriptionStatus: null }, { status: 200 })
    }
}

