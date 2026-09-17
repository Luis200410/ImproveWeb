import React from 'react'
import { notFound } from 'next/navigation'
import { getAppBySlug, APPS_DATA } from '@/lib/apps-data'
import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp, Shield, Cpu, Activity, Brain, Wallet, Briefcase, Users, Compass, Crown } from 'lucide-react'
import { SecondBrainProductivitySuite } from '@/components/landing/second-brain-productivity-suite'
import { ProductivityShowcase } from '@/components/apps/productivity-showcase'
import { AppHeroShowcase } from '@/components/apps/app-hero-showcase'



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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--label)] selection:bg-[var(--indigo)] selection:text-white pt-8">
      {/* Brand Identity & Overview Hero Showcase */}
      <AppHeroShowcase app={app} />

      {/* 3. Core Identity Features Grid */}
      <section className="py-16 px-6 relative border-t border-[var(--separator)]">
        <div className="max-w-7xl mx-auto space-y-10">
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
        </section>

      {/* 3.2 Dedicated Science & Execution Showcase for Productivity */}
      {app.slug === 'execution-productivity' && (
        <ProductivityShowcase />
      )}

      {/* 3.5 Interlocking Suite Specification for Second Brain */}
      {app.slug === 'second-brain' && (
        <section className="py-16 px-6 border-t border-[var(--separator)]">
          <div className="max-w-7xl mx-auto">
            <SecondBrainProductivitySuite 
              initialTab="second-brain" 
            />
          </div>
        </section>
      )}

      {/* 4. Switch Between Other Apps */}
      <section className="py-16 px-6 border-t border-[var(--separator)]">
        <div className="max-w-7xl mx-auto space-y-8">
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
      </section>
    </div>
  )
}
