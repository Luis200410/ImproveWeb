'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const fullName = (formData.get('fullName') as string | null)?.trim() || ''

    const { error } = await supabase.auth.updateUser({
        data: {
            ...user.user_metadata,
            full_name: fullName
        }
    })

    if (error) {
        redirect(`/profile?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/profile?updated=1')
}
