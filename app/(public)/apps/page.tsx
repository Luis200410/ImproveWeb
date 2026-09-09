import React from 'react'
import Link from 'next/link'
import { APPS_DATA } from '@/lib/apps-data'
import { ArrowRight, Sparkles, Activity, Brain, Wallet, Briefcase, CheckCircle2, Users, Compass, Crown } from 'lucide-react'

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

export default function AppsIndexPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--label)] selection:bg-[var(--indigo)] selection:text-white pt-12">
      {/* Grid of All 8 Applications */}
      <section className="py-24 px-6 relative border-t border-[var(--separator)]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="tag-chip text-xs">
              <Sparkles className="w-4 h-4 text-[var(--indigo)]" />
              <span className="kicker text-[var(--indigo)]">Comprehensive Ecosystem</span>
            </span>
            <h2 className="type-large-title text-4xl sm:text-6xl font-bold uppercase tracking-tight text-[var(--label)]">
              The 8 Integrated Applications
            </h2>
            <p className="type-body text-base sm:text-lg text-[var(--label-2)]">
              Select an application below to view its dedicated brand identity, telemetry metrics, and core capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {APPS_DATA.map((app) => {
              const IconComponent = iconMap[app.iconName] || Sparkles

              return (
                <Link
                  key={app.id}
                  href={`/apps/${app.slug}`}
                  className="card-ios group relative p-6 border border-[var(--separator)] hover:border-[var(--indigo)] transition-all duration-300 flex flex-col justify-between space-y-8 shadow-xl hover:-translate-y-1.5 overflow-hidden"
                >
                  {/* Card top indicator */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="icon-box-tint group-hover:scale-110 transition-transform">
                        <IconComponent className="w-5 h-5 text-[var(--indigo)]" />
                      </div>
                      <span className="font-rounded text-sm text-[var(--indigo)]">
                        {app.number}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="type-headline text-xl font-bold text-[var(--label)] group-hover:text-[var(--indigo)] transition-colors leading-tight">
                        {app.name}
                      </h3>
                      <p className="type-caption text-[var(--label-2)] line-clamp-2 leading-relaxed">
                        {app.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-[var(--separator)] flex items-center justify-between type-subcaption text-[var(--label-2)] group-hover:text-[var(--label)] transition-colors">
                    <span>View Dedicated Page</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[var(--indigo)]" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
