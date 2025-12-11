import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/dashboard-client'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const subscribed = user.user_metadata?.subscribed || user.user_metadata?.is_subscribed || user.user_metadata?.couponUnlocked
    if (!subscribed) {
        redirect('/pricing?reason=subscribe')
    }

    return <DashboardClient />
}
