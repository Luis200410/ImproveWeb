'use server'

import { NextResponse } from 'next/server'
import { assertStripe } from '@/lib/stripe'

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}))
        const {
            priceId,
            quantity = 1,
            successUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/success`,
            cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/billing`,
        } = body

        if (!priceId) {
            return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
        }

        const stripe = assertStripe()

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: priceId, quantity }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            automatic_tax: { enabled: true },
        })

        return NextResponse.json({ id: session.id, url: session.url })
    } catch (error) {
        console.error('Stripe checkout error', error)
        return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 })
    }
}
