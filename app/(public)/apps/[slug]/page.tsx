import React from 'react'
import { notFound } from 'next/navigation'
import { getAppBySlug, APPS_DATA } from '@/lib/apps-data'
import { HeroFuturistic } from '@/components/ui/hero-futuristic'
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
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* 1. Hero Component with futuristic 3D WebGPU effect */}
      <HeroFuturistic
        badgeText={app.badge}
        title={app.heroTitle}
        subtitle={app.heroSubtitle}
        ctaText={`Explore ${app.name}`}
        textureUrl={app.imageUrl}
      />

      {/* 2. Brand Identity & Overview Section */}
      <section className="py-24 px-6 relative border-t border-white/10 overflow-hidden">
        {/* Subtle background glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b ${app.bgGradient} opacity-20 blur-3xl pointer-events-none rounded-full`} />

        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono uppercase tracking-widest text-amber-400">
                <AppIcon className="w-3.5 h-3.5" />
                {app.number} • APP IDENTITY SUITE
              </div>
              
              <h2 className={`${bebas.className} text-5xl sm:text-7xl tracking-tight text-white uppercase`}>
                {app.name}
              </h2>
              
              <p className="text-xl text-neutral-300 font-light leading-relaxed">
                {app.description}
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-black font-semibold text-xs rounded-lg uppercase tracking-widest hover:bg-neutral-200 transition-colors inline-flex items-center gap-2 group shadow-xl"
                >
                  <span>Launch {app.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 border border-white/20 text-white font-semibold text-xs rounded-lg uppercase tracking-widest hover:bg-white/10 transition-colors inline-flex items-center gap-2"
                >
                  <span>View Membership</span>
                </Link>
              </div>
            </div>

            {/* Quick Stat Summary Card */}
            <div className="lg:col-span-5 bg-neutral-950/80 border border-white/10 rounded-2xl p-8 space-y-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">System Telemetry</span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live
                </span>
              </div>

              <div className="space-y-6">
                {app.statSummary.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div>
                      <div className="text-xs font-mono text-neutral-400">{stat.label}</div>
                      <div className="text-2xl font-bold text-white mt-1">{stat.value}</div>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/5 border border-white/10 text-amber-400">
                      {stat.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Core Identity Features Grid */}
          <div className="space-y-10 pt-10 border-t border-white/10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h3 className={`${bebas.className} text-4xl sm:text-5xl uppercase tracking-tight`}>
                Core Capabilities
              </h3>
              <p className="text-neutral-400 text-sm uppercase tracking-widest font-mono">
                Architectural pillars of the {app.name} app
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {app.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="group relative p-8 rounded-2xl bg-neutral-950/60 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 font-mono font-bold group-hover:scale-110 transition-transform">
                      0{idx + 1}
                    </div>
                    <h4 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {feat.title}
                    </h4>
                    <p className="text-sm text-neutral-400 leading-relaxed font-light">
                      {feat.description}
                    </p>
                  </div>

                  {feat.metrics && (
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-amber-400">
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
            <div className="pt-10 border-t border-white/10">
              <SecondBrainProductivitySuite 
                initialTab={app.slug === 'second-brain' ? 'second-brain' : 'productivity'} 
              />
            </div>
          )}

          {/* 4. Switch Between Other Apps */}
          <div className="pt-16 border-t border-white/10 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400">Explore The Integrity Network</span>
                <h4 className={`${bebas.className} text-3xl sm:text-4xl uppercase tracking-tight text-white mt-1`}>
                  Other Dedicated Apps
                </h4>
              </div>
              <Link href="/apps" className="text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1">
                View All 8 Apps <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {APPS_DATA.filter((item) => item.slug !== app.slug).slice(0, 4).map((other) => (
                <Link
                  key={other.id}
                  href={`/apps/${other.slug}`}
                  className="p-4 rounded-xl bg-neutral-950 border border-white/10 hover:border-amber-500/40 transition-all group"
                >
                  <div className="text-[10px] font-mono text-amber-400">{other.number}</div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors mt-1 line-clamp-1">
                    {other.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 line-clamp-1 mt-1 font-light">
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
