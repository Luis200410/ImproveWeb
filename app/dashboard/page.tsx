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

    const status = subscriptionEntry?.data?.status as string | undefined
    const isActive = status === 'active' || status === 'trialing'
    const legacySubscribed = user.user_metadata?.subscribed || user.user_metadata?.is_subscribed || user.user_metadata?.couponUnlocked

    if (!isActive && !legacySubscribed) {
        redirect('/pricing?reason=subscribe')
    }

    return <DashboardClient />
}
