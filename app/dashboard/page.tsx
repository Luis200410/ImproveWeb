import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/dashboard-client'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: subscriptionEntry } = await supabase
        .from('entries')
        .select('data, updated_at')
        .eq('user_id', user.id)
        .eq('microapp_id', 'subscription-status')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    // Some rows store JSON as text, so normalize before checking status
    const rawData = subscriptionEntry?.data
    const parsedData = typeof rawData === 'string' ? (() => {
        try {
            return JSON.parse(rawData)
        } catch {
            // If the JSONB column stores a bare string (e.g. "active"), use it directly
            return rawData
        }
    })() : rawData

    const statusValue = typeof parsedData === 'string' ? parsedData : parsedData?.status
    const status = (statusValue ?? '').toString().trim().toLowerCase() || undefined
    const isActive = status === 'active' || status === 'trialing'
    const legacySubscribed = user.user_metadata?.subscribed || user.user_metadata?.is_subscribed || user.user_metadata?.couponUnlocked

    console.log('Dashboard auth check', {
        userId: user.id,
        status,
        legacySubscribed,
        hasEntry: Boolean(subscriptionEntry),
        updatedAt: subscriptionEntry?.updated_at
    })

    if (!isActive && !legacySubscribed) {
        const detail = encodeURIComponent(status || 'none')
        const legacy = legacySubscribed ? '1' : '0'
        console.warn('Dashboard redirect: subscription inactive', { status, legacySubscribed })
        redirect(`/pricing?reason=subscribe&status=${detail}&legacy=${legacy}`)
    }

    return <DashboardClient />
}
