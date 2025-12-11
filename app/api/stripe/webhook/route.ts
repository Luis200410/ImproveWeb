'use server'

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// Minimal webhook handler to verify signatures; extend with your event handling.
export async function POST(req: Request) {
    const headerList = await headers()
    const sig = headerList.get('stripe-signature')
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

    const payload = await req.text()
    let event
    try {
        event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
    } catch (err) {
        console.error('Stripe webhook signature verification failed', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // TODO: handle events (checkout.session.completed, invoice.paid, etc.)
    // console.log('Stripe event', event.type)

    return NextResponse.json({ received: true })
}
