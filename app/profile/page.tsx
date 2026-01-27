import { redirect } from 'next/navigation'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { updateProfile } from './actions'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

type SearchParams = { updated?: string; error?: string }

export default async function ProfilePage({ searchParams }: { searchParams?: SearchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const fullName = (user.user_metadata?.full_name as string | undefined) || ''
    const email = user.email || ''
    const message = searchParams?.updated ? 'Profile updated' : searchParams?.error || ''
    const isError = Boolean(searchParams?.error)

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            <div className="fixed inset-0 z-0">
                <div className="absolute top-1/4 right-1/4 w-[520px] h-[520px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-[420px] h-[420px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute inset-0 opacity-[0.02]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="profile-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#profile-grid)" />
                    </svg>
                </div>
            </div>

            <div className="relative z-10">
                <Navigation />
                <div className="h-24" />

                <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
                    <div>
                        <p className={`${inter.className} text-xs uppercase tracking-[0.3em] text-white/50 mb-2`}>Account</p>
                        <h1 className={`${playfair.className} text-4xl font-bold text-white`}>Your Profile</h1>
                        <p className={`${inter.className} text-white/60 mt-3 max-w-2xl`}>
                            Keep your account details current. You can update your display name here even without a paid membership.
                        </p>
                    </div>

                    {message && (
                        <div className={`border ${isError ? 'border-red-500/50 text-red-200 bg-red-500/10' : 'border-emerald-500/50 text-emerald-200 bg-emerald-500/10'} px-4 py-3 text-sm`}>
                            {message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/5 border border-white/10 p-6">
                            <form action={updateProfile} className="space-y-6">
                                <div className="space-y-2">
                                    <label className={`${inter.className} text-sm uppercase tracking-[0.2em] text-white/60`}>Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        defaultValue={fullName}
                                        className="w-full bg-black/50 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                                        placeholder="Add your name"
                                    />
                                </div>

                                <Button type="submit" className="bg-white text-black hover:bg-white/90 font-serif text-sm uppercase tracking-widest py-3 w-full">
                                    Save Profile
                                </Button>
                            </form>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 space-y-4">
                            <div>
                                <p className={`${inter.className} text-xs uppercase tracking-[0.2em] text-white/50 mb-1`}>Email</p>
                                <p className={`${playfair.className} text-xl text-white`}>{email}</p>
                            </div>
                            <div>
                                <p className={`${inter.className} text-xs uppercase tracking-[0.2em] text-white/50 mb-1`}>User ID</p>
                                <p className={`${inter.className} text-sm text-white/70 break-all`}>{user.id}</p>
                            </div>
                            <div>
                                <p className={`${inter.className} text-xs uppercase tracking-[0.2em] text-white/50 mb-1`}>Subscription</p>
                                <p className={`${inter.className} text-sm text-white/70`}>Access to dashboard and your data is available even without payment.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
