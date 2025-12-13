'use client'

import { Microapp } from '@/lib/data-store'
import { Playfair_Display, Inter } from 'next/font/google'
import { ArrowLeft, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface MicroappHeaderProps {
    microapp: Microapp
    onBack?: () => void
    onAdd?: () => void
    systemId: string
}

export function MicroappHeader({ microapp, onBack, onAdd, systemId }: MicroappHeaderProps) {
    const router = useRouter()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            router.push(`/systems/${systemId}`)
        }
    }

    return (
        <div className="flex items-center justify-between mb-8 md:mb-12">
            <div className="space-y-2">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="pl-0 hover:bg-transparent text-white/40 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="text-xs uppercase tracking-widest">Back to System</span>
                </Button>
                <div className="flex items-center gap-3">
                    <span className="text-4xl md:text-5xl">{microapp.icon}</span>
                    <div>
                        <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold text-white`}>
                            {microapp.name}
                        </h1>
                    </div>
                </div>
                <p className={`${inter.className} text-white/40 max-w-lg text-lg`}>
                    {microapp.description}
                </p>
            </div>

            {onAdd && (
                <Button
                    onClick={onAdd}
                    className="bg-white text-black hover:bg-emerald-200 transition-colors rounded-full px-8 py-6"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    <span className="uppercase tracking-widest font-semibold text-xs">New Entry</span>
                </Button>
            )}
        </div>
    )
}
