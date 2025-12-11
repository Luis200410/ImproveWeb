'use server'

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { assertSupabaseAdmin } from '@/lib/supabase-admin'

type SubscriptionStatus = Stripe.Subscription.Status | 'unpaid'

async function upsertSubscriptionRecord(params: {
    userId: string
    customerId?: string | null
    subscriptionId?: string | null
    priceId?: string | null
    status: SubscriptionStatus
    currentPeriodEnd?: number | null
}) {
    const admin = assertSupabaseAdmin()
    const { userId, customerId, subscriptionId, priceId, status, currentPeriodEnd } = params

    const { data: existing } = await admin
        .from('entries')
        .select('id')
        .eq('user_id', userId)
        .eq('microapp_id', 'subscription-status')
        .limit(1)
        .maybeSingle()

    const nowIso = new Date().toISOString()
    const id = existing?.id || crypto.randomUUID()

    const { error } = await admin.from('entries').upsert({
        id,
        user_id: userId,
        microapp_id: 'subscription-status',
        data: {
            status,
            customer_id: customerId,
            subscription_id: subscriptionId,
            price_id: priceId,
            current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
        },
        updated_at: nowIso,
        created_at: existing?.id ? undefined : nowIso
    })

    if (error) {
        console.error('Failed to upsert subscription status to Supabase', error)
        throw error
    }
}

function resolveUserIdFromEvent(evt: Stripe.Event): string | null {
    if (evt.type.startsWith('customer.subscription')) {
        const sub = evt.data.object as Stripe.Subscription
        return (sub.metadata?.user_id as string) || null
    }
    if (evt.type === 'checkout.session.completed') {
        const session = evt.data.object as Stripe.Checkout.Session
        return (session.metadata?.user_id as string) || null
    }
    return null
}

function subscriptionStatusFromEvent(evt: Stripe.Event): SubscriptionStatus | null {
    if (evt.type.startsWith('customer.subscription')) {
        const sub = evt.data.object as Stripe.Subscription
        return sub.status || 'unpaid'
    }
    if (evt.type === 'checkout.session.completed') {
        const session = evt.data.object as Stripe.Checkout.Session
        return session.payment_status === 'paid' ? 'active' : 'unpaid'
    }
    return null
}

export async function POST(req: Request) {
    const headerList = await headers()
    const sig = headerList.get('stripe-signature')
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

    const payload = await req.text()
    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
    } catch (err) {
        console.error('Stripe webhook signature verification failed', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const userId = resolveUserIdFromEvent(event)
    const status = subscriptionStatusFromEvent(event)

    if (userId && status) {
        if (event.type.startsWith('customer.subscription')) {
            const sub = event.data.object as Stripe.Subscription
            await upsertSubscriptionRecord({
                userId,
                status,
                customerId: sub.customer?.toString(),
                subscriptionId: sub.id,
                priceId: sub.items.data[0]?.price.id,
                currentPeriodEnd: sub.current_period_end
            })
        } else if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session
            await upsertSubscriptionRecord({
                userId,
                status,
                customerId: session.customer?.toString(),
                subscriptionId: session.subscription?.toString() || null,
                priceId: session.metadata?.price_id || null,
                currentPeriodEnd: null
            })
        }
    } else {
        console.warn('Stripe webhook received without userId or status', { type: event.type })
    }

    return NextResponse.json({ received: true })
}
