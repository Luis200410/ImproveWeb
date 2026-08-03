import type { Metadata } from 'next'
import { SystemShell } from '@/components/system-shell'

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
}

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
    return <SystemShell>{children}</SystemShell>
}
