'use server'

import { NextResponse } from 'next/server'
import { assertStripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'

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

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const stripe = assertStripe()

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: priceId, quantity }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            automatic_tax: { enabled: true },
            customer_email: user.email || undefined,
            client_reference_id: user.id,
            metadata: {
                user_id: user.id,
                email: user.email || ''
            },
            subscription_data: {
                metadata: {
                    user_id: user.id,
                    email: user.email || '',
                    price_id: priceId
                }
            }
        })

        return NextResponse.json({ id: session.id, url: session.url })
    } catch (error) {
        console.error('Stripe checkout error', error)
        return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 })
    }
}
