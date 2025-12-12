import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/dashboard-client'
import { assertSupabaseAdmin } from '@/lib/supabase-admin'

async function reconcileSubscriptionUserId(userId: string, email?: string | null) {
    try {
        const admin = assertSupabaseAdmin()
        if (!email) return

        const { data: legacyEntry } = await admin
            .from('entries')
            .select('id')
            .eq('microapp_id', 'subscription-status')
            .eq('user_id', email)
            .limit(1)
            .maybeSingle()

        if (legacyEntry?.id) {
            const { error } = await admin
                .from('entries')
                .update({ user_id: userId })
                .eq('id', legacyEntry.id)

            if (error) {
                console.warn('Dashboard reconcile: failed to update legacy email user_id', error)
            } else {
                console.warn('Dashboard reconcile: corrected subscription user_id from email to auth uid', { entryId: legacyEntry.id })
            }
        }
    } catch (err) {
        console.warn('Dashboard reconcile: admin client unavailable or failed', err)
    }
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // One-time reconciliation: if any legacy row uses email as user_id, rewrite to auth uid
    await reconcileSubscriptionUserId(user.id, user.email)

    // Fetch with RLS-limited query using auth uid
    const { data: subscriptionEntry } = await supabase
        .from('entries')
        .select('data, updated_at')
        .eq('user_id', user.id)
        .eq('microapp_id', 'subscription-status')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    // If still nothing, read via service role (uid or email) and attempt fix
    let fallbackEntry = subscriptionEntry
    if (!fallbackEntry) {
        try {
            const admin = assertSupabaseAdmin()
            const ids: string[] = [user.id]
            if (user.email) ids.push(user.email)
            const { data: adminData } = await admin
                .from('entries')
                .select('id, data, updated_at, user_id')
                .in('user_id', ids)
                .eq('microapp_id', 'subscription-status')
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (adminData) {
                fallbackEntry = adminData
                console.warn('Dashboard fallback: subscription entry read via admin', { matchedUserId: adminData.user_id })

                // Try to correct the user_id if it was an email
                if (adminData.user_id !== user.id) {
                    const { error } = await admin
                        .from('entries')
                        .update({ user_id: user.id })
                        .eq('id', adminData.id)
                    if (error) {
                        console.warn('Dashboard fallback: failed to update user_id', error)
                    } else {
                        console.warn('Dashboard fallback: updated user_id to auth uid', { entryId: adminData.id })
                    }
                }
            }
        } catch (err) {
            console.warn('Dashboard fallback: admin unavailable', err)
        }
    }

    // Some rows store JSON as text, so normalize before checking status
    const effectiveEntry = subscriptionEntry || fallbackEntry
    const rawData = effectiveEntry?.data
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
        hasEntry: Boolean(effectiveEntry),
        updatedAt: effectiveEntry?.updated_at,
        userIdMatch: (effectiveEntry as any)?.user_id === user.id
    })

    if (!isActive && !legacySubscribed) {
        const detail = encodeURIComponent(status || 'none')
        const legacy = legacySubscribed ? '1' : '0'
        console.warn('Dashboard redirect: subscription inactive', { status, legacySubscribed })
        redirect(`/pricing?reason=subscribe&status=${detail}&legacy=${legacy}`)
    }

    return <DashboardClient />
}
