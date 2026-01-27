import Stripe from 'stripe'

// Server-side Stripe client. Requires STRIPE_SECRET_KEY in env.
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
    })
    : null

export function assertStripe() {
    if (!stripe) {
        throw new Error('Stripe not configured. Set STRIPE_SECRET_KEY in your environment.')
    }
    return stripe
}
