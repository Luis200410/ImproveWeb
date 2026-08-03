'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = (formData.get('email') as string || '').trim()
    const password = formData.get('password') as string || ''

    if (!email || !password) {
        redirect('/login?error=' + encodeURIComponent('Email and password are required'))
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        redirect('/login?error=' + encodeURIComponent(error.message || 'Invalid credentials'))
    }

    revalidatePath('/', 'layout')
    const targetUrl = process.env.NEXT_PUBLIC_APP_URL || '/'
    redirect(targetUrl)
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = (formData.get('email') as string || '').trim()
    const password = formData.get('password') as string || ''
    const fullName = (formData.get('fullName') || formData.get('full_name') || formData.get('name') || '') as string

    if (!email || !password) {
        redirect('/register?error=' + encodeURIComponent('Email and password are required'))
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                display_name: fullName,
            }
        }
    })

    if (error) {
        redirect('/register?error=' + encodeURIComponent(error.message || 'Signup failed'))
    }

    revalidatePath('/', 'layout')
    const targetUrl = process.env.NEXT_PUBLIC_APP_URL || '/'
    redirect(targetUrl)
}

