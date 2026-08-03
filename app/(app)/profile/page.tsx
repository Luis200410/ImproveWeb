import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ProfileDashboard } from '@/components/profile/profile-dashboard'

type SearchParams = { updated?: string; error?: string }

export default async function ProfilePage({ searchParams }: { searchParams?: SearchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const fullName = (user.user_metadata?.full_name as string | undefined) || ''
    const email = user.email || ''

    return (
        <ProfileDashboard
            user={user}
            fullName={fullName}
            email={email}
        />
    )
}
