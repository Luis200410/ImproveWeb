import { notFound, redirect } from 'next/navigation'
import { getAppBySlug, APPS_DATA } from '@/lib/apps-data'
import { SecondBrainReverseEngineerMotion } from '@/components/apps/second-brain-reverse-engineer-motion'
import { SecondBrainCalendarBoardMotion } from '@/components/apps/second-brain-calendar-board-motion'
import { SecondBrainNotesHandwritingMotion } from '@/components/apps/second-brain-notes-handwriting-motion'
import { SecondBrainInboxTriageMotion } from '@/components/apps/second-brain-inbox-triage-motion'
import { SecondBrainProductivityBridgeMotion } from '@/components/apps/second-brain-productivity-bridge-motion'
import { ProductivityShowcase } from '@/components/apps/productivity-showcase'
import { AppHeroShowcase } from '@/components/apps/app-hero-showcase'
import { OtherDedicatedAppsDock } from '@/components/apps/other-dedicated-apps-dock'
import { AppComingSoon } from '@/components/apps/app-coming-soon'
import CTAWithVerticalMarquee from '@/components/general/cta-with-text-marquee'

interface AppDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return APPS_DATA.map((app) => ({
    slug: app.slug,
  }))
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params

  if (slug === 'execution-productivity') {
    redirect('/apps/productivity')
  }

  const app = getAppBySlug(slug)

  if (!app) {
    notFound()
  }

  const isProductivity = app.slug === 'productivity' || app.slug === 'execution-productivity'

  return (
    <div className="min-h-screen bg-transparent text-[var(--label)] selection:bg-[var(--indigo)] selection:text-white pt-8">
      {/* 1. Flagship Productivity: Showcase */}
      {isProductivity && (
        <ProductivityShowcase />
      )}

      {/* 2. All Other Ecosystem Pillars (including Second Brain): Dedicated Coming Soon Experience */}
      {!isProductivity && (
        <AppComingSoon app={app} />
      )}

      {/* 4. Dedicated Pricing & Tier Showcase with App Accent Color */}
      <section className="w-full border-t border-[var(--separator)]">
        <CTAWithVerticalMarquee app={app} />
      </section>

      {/* 5. Switch Between Other Apps via Apple-Style Dock (Inactive apps dimmed with opacity) */}
      <OtherDedicatedAppsDock currentSlug={app.slug} />
    </div>
  )
}
