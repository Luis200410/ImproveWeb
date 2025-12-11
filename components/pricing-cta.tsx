'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
    label: string
    priceId: string | null
    url?: string | null
}

export function PricingCTA({ label, priceId, url }: Props) {
    const router = useRouter()

    const handleClick = async () => {
        if (url) {
            window.location.href = url
            return
        }
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/register')
            return
        }
        if (!priceId) {
            router.push('/pricing')
            return
        }
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            })
            const json = await res.json()
            if (json.url) {
                window.location.href = json.url as string
            } else {
                router.push('/pricing')
            }
        } catch (e) {
            router.push('/pricing')
        }
    }

    return (
        <Button
            onClick={handleClick}
            className="w-full font-serif text-sm uppercase tracking-widest transition-all duration-300 relative overflow-hidden bg-white text-black hover:bg-white/90"
        >
            {label}
        </Button>
    )
}
