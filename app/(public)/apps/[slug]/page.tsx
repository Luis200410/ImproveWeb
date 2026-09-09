import React from 'react'
import { notFound } from 'next/navigation'
import { getAppBySlug, APPS_DATA } from '@/lib/apps-data'
import Link from 'next/link'
import { Bebas_Neue } from '@/lib/font-shim'
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp, Shield, Cpu, Activity, Brain, Wallet, Briefcase, Users, Compass, Crown } from 'lucide-react'
import { SecondBrainProductivitySuite } from '@/components/landing/second-brain-productivity-suite'

const bebas = Bebas_Neue({ subsets: ['latin'] })

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
  const app = getAppBySlug(slug)

  if (!app) {
    notFound()
  }

  const AppIcon = iconMap[app.iconName] || Sparkles

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--label)] selection:bg-[var(--indigo)] selection:text-white pt-12">
      {/* Brand Identity & Overview Section */}
      <section className="py-16 px-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b ${app.bgGradient} opacity-20 blur-3xl pointer-events-none rounded-full`} />

        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="tag-chip text-xs">
                <AppIcon className="w-3.5 h-3.5 text-[var(--indigo)]" />
                <span className="kicker text-[var(--indigo)]">{app.number} • APP IDENTITY SUITE</span>
              </div>
              
              <h2 className="type-large-title text-4xl sm:text-6xl font-bold tracking-tight text-[var(--label)] uppercase">
                {app.name}
              </h2>
              
              <p className="type-body text-lg text-[var(--label-2)] leading-relaxed">
                {app.description}
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="btn-primary text-xs uppercase px-8 py-4 tracking-wider"
                >
                  <span>Launch {app.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-secondary text-xs uppercase px-8 py-4 tracking-wider"
                >
                  <span>View Membership</span>
                </Link>
              </div>
            </div>

            {/* Quick Stat Summary Card */}
            <div className="lg:col-span-5 card-ios border border-[var(--separator)] p-8 space-y-6 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[var(--separator)] pb-4">
                <span className="kicker">System Telemetry</span>
                <span className="type-subcaption text-[var(--green)] font-rounded flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-ping" /> Live
                </span>
              </div>

              <div className="space-y-6">
                {app.statSummary.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-[var(--separator)] last:border-0 last:pb-0">
                    <div>
                      <div className="type-caption text-[var(--label-2)]">{stat.label}</div>
                      <div className="font-rounded text-2xl font-bold text-[var(--label)] mt-1">{stat.value}</div>
                    </div>
                    <span className="tag-chip font-rounded text-xs text-[var(--indigo)]">
                      {stat.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Core Identity Features Grid */}
          <div className="space-y-10 pt-10 border-t border-[var(--separator)]">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <p className="kicker text-[var(--indigo)]">Architectural Pillars</p>
              <h3 className="type-title text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[var(--label)]">
                Core Capabilities
              </h3>
              <p className="type-caption text-[var(--label-2)]">
                Key modules of the {app.name} app
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {app.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="card-ios group relative p-8 border border-[var(--separator)] hover:border-[var(--indigo)] transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="icon-box-tint font-rounded text-sm font-bold group-hover:scale-110 transition-transform">
                      0{idx + 1}
                    </div>
                    <h4 className="type-headline text-xl font-bold text-[var(--label)] group-hover:text-[var(--indigo)] transition-colors">
                      {feat.title}
                    </h4>
                    <p className="type-body text-[var(--label-2)] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  {feat.metrics && (
                    <div className="pt-4 border-t border-[var(--separator)] flex items-center justify-between type-subcaption font-rounded text-[var(--indigo)]">
                      <span>Benchmark</span>
                      <span>{feat.metrics}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3.5 Interlocking Suite Specification for Second Brain & Productivity */}
          {['second-brain', 'execution-productivity'].includes(app.slug) && (
            <div className="pt-10 border-t border-[var(--separator)]">
              <SecondBrainProductivitySuite 
                initialTab={app.slug === 'second-brain' ? 'second-brain' : 'productivity'} 
              />
            </div>
          )}

          {/* 4. Switch Between Other Apps */}
          <div className="pt-16 border-t border-[var(--separator)] space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="kicker text-[var(--indigo)]">Explore The Integrity Network</p>
                <h4 className="type-title text-2xl sm:text-3xl uppercase tracking-tight text-[var(--label)] mt-1">
                  Other Dedicated Apps
                </h4>
              </div>
              <Link href="/apps" className="type-callout text-[var(--label-2)] hover:text-[var(--label)] flex items-center gap-1">
                View All 8 Apps <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {APPS_DATA.filter((item) => item.slug !== app.slug).slice(0, 4).map((other) => (
                <Link
                  key={other.id}
                  href={`/apps/${other.slug}`}
                  className="card-ios p-4 border border-[var(--separator)] hover:border-[var(--indigo)] transition-all group"
                >
                  <div className="font-rounded text-[10px] text-[var(--indigo)]">{other.number}</div>
                  <div className="type-headline text-sm font-bold text-[var(--label)] group-hover:text-[var(--indigo)] transition-colors mt-1 line-clamp-1">
                    {other.name}
                  </div>
                  <div className="type-caption text-[var(--label-2)] line-clamp-1 mt-1">
                    {other.tagline}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
