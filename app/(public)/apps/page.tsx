import React from 'react'
import Link from 'next/link'
import { APPS_DATA } from '@/lib/apps-data'
import { Bebas_Neue } from '@/lib/font-shim'
import { ArrowRight, Sparkles, Activity, Brain, Wallet, Briefcase, CheckCircle2, Users, Compass, Crown } from 'lucide-react'
import { HeroFuturistic } from '@/components/ui/hero-futuristic'

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

export default function AppsIndexPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Hero Showcase */}
      <HeroFuturistic
        badgeText="THE 8 CORE INTEGRITY SUITES"
        title="DEDICATED APP ENVIRONMENT"
        subtitle="Explore each application engineered to optimize your physical, financial, cognitive, and relational velocity."
        ctaText="Explore All 8 Applications"
      />

      {/* Grid of All 8 Applications */}
      <section className="py-24 px-6 relative border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Comprehensive Ecosystem
            </span>
            <h2 className={`${bebas.className} text-5xl sm:text-7xl tracking-tight uppercase`}>
              The 8 Integrated Applications
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg font-light">
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
                  className="group relative p-6 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between space-y-8 shadow-2xl hover:-translate-y-1.5 overflow-hidden"
                >
                  {/* Card top indicator */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-white/5 border ${app.borderColor} text-white group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-sm font-mono text-amber-400/80 group-hover:text-amber-400 transition-colors">
                        {app.number}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors leading-tight">
                        {app.name}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-light">
                        {app.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-white transition-colors">
                    <span>View Dedicated Page</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-400" />
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
