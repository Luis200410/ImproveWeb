import { notFound, redirect } from 'next/navigation'
import { getAppBySlug, APPS_DATA } from '@/lib/apps-data'
import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp, Shield, Cpu, Activity, Brain, Wallet, Briefcase, Users, Compass, Crown } from 'lucide-react'
import { SecondBrainReverseEngineerMotion } from '@/components/apps/second-brain-reverse-engineer-motion'
import { SecondBrainCalendarBoardMotion } from '@/components/apps/second-brain-calendar-board-motion'
import { SecondBrainNotesHandwritingMotion } from '@/components/apps/second-brain-notes-handwriting-motion'
import { SecondBrainInboxTriageMotion } from '@/components/apps/second-brain-inbox-triage-motion'
import { SecondBrainProductivityBridgeMotion } from '@/components/apps/second-brain-productivity-bridge-motion'
import { ProductivityShowcase } from '@/components/apps/productivity-showcase'
import { AppHeroShowcase } from '@/components/apps/app-hero-showcase'
import { OtherDedicatedAppsDock } from '@/components/apps/other-dedicated-apps-dock'
import CTAWithVerticalMarquee from '@/components/general/cta-with-text-marquee'



const iconMap: Record<string, any> = {
  Activity,
  Brain,
  Wallet,
  Briefcase,
  CheckCircle2,
  Users,
  Compass,
  Crown
}

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

  const AppIcon = iconMap[app.iconName] || Sparkles

  return (
    <div className="min-h-screen bg-transparent text-[var(--label)] selection:bg-[var(--indigo)] selection:text-white pt-8">
      {/* Brand Identity & Overview Hero Showcase */}
      <AppHeroShowcase app={app} />

      {/* 3.2 Dedicated Science & Execution Showcase for Productivity */}
      {(app.slug === 'productivity' || app.slug === 'execution-productivity') && (
        <ProductivityShowcase />
      )}

      {/* 3.5 Interlocking Suite Specification for Second Brain */}
      {app.slug === 'second-brain' && (
        <>
          {/* 3.4 AI Reverse-Engineering 3D Camera Motion Showcase */}
          <SecondBrainReverseEngineerMotion />

          {/* 3.4b Calendar Day Board & Adaptive Re-Planning Motion Showcase */}
          <SecondBrainCalendarBoardMotion />

          {/* 3.4c Handwriting OCR & Smart Note System Motion Showcase */}
          <SecondBrainNotesHandwritingMotion />

          {/* 3.4d Universal Inbox & Autonomous AI Triage Motion Showcase */}
          <SecondBrainInboxTriageMotion />

          {/* 3.4e Live Connection to Productivity Focus Motion Showcase */}
          <SecondBrainProductivityBridgeMotion />
        </>
      )}

      {/* 4. Dedicated Pricing & Tier Showcase with App Accent Color */}
      <section className="w-full border-t border-[var(--separator)]">
        <CTAWithVerticalMarquee app={app} />
      </section>

      {/* 5. Switch Between Other Apps via Apple-Style Dock */}
      <OtherDedicatedAppsDock currentSlug={app.slug} />
    </div>
  )
}
