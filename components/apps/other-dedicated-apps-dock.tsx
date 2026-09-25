'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/general/dock'
import { APPS_DATA } from '@/lib/apps-data'

const logoMap: Record<string, string> = {
  'body-optimization': '/Body Logo.svg',
  'second-brain': '/Second Brain Logo.svg',
  'money-wealth': '/money Logo.svg',
  'professional-mastery': '/Work Logo.svg',
  'execution-productivity': '/Productivity Logo.svg',
  'relationships-capital': '/RelationShips logo.svg',
  'mind-emotions': '/mind Logo.svg',
  'legacy-fun': '/logo.svg',
}

interface OtherDedicatedAppsDockProps {
  currentSlug?: string
}

export function OtherDedicatedAppsDock({ currentSlug }: OtherDedicatedAppsDockProps) {
  const appsToShow = currentSlug 
    ? APPS_DATA.filter(app => app.slug !== currentSlug)
    : APPS_DATA

  return (
    <section className="py-16 px-6 border-t border-[var(--separator)]">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Exact Original Section Header */}
        <div className="flex justify-between items-end">
          <div>
            <p className="kicker text-[var(--indigo)] uppercase tracking-wider font-bold text-xs sm:text-sm">
              EXPLORE THE INTEGRITY NETWORK
            </p>
            <h4 className="type-title text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[var(--label)] mt-1">
              OTHER DEDICATED APPS
            </h4>
          </div>
          <Link 
            href="/apps" 
            className="type-callout text-[var(--label-2)] hover:text-[var(--label)] flex items-center gap-1.5 font-medium text-sm sm:text-base group transition-colors"
          >
            <span>View All 8 Apps</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[var(--indigo)]" />
          </Link>
        </div>

        {/* Dedicated Dock Container with NO borders */}
        <div className="w-full flex flex-col items-center justify-center pt-2 pb-4 overflow-x-auto">
          <Dock 
            panelHeight={104} 
            magnification={145} 
            distance={180} 
            className="items-center bg-transparent border-none shadow-none px-4 rounded-3xl gap-4 sm:gap-6"
          >
            {appsToShow.map((app) => {
              return (
                <DockItem
                  key={app.id}
                  className="aspect-square rounded-2xl bg-black/80 border-none shadow-none hover:bg-black transition-all group/dock relative overflow-hidden flex items-center justify-center"
                >
                  <DockLabel className="bg-black text-white border border-zinc-800 font-semibold px-3 py-1 text-xs sm:text-sm shadow-xl">
                    {app.name}
                  </DockLabel>
                  <DockIcon>
                    <Link 
                      href={`/apps/${app.slug}`} 
                      className="w-full h-full flex items-center justify-center p-1"
                    >
                      <img
                        src={logoMap[app.slug] || '/logo.svg'}
                        alt={app.name}
                        className="w-full h-full object-contain filter group-hover/dock:scale-110 transition-transform"
                      />
                    </Link>
                  </DockIcon>
                </DockItem>
              );
            })}
          </Dock>
        </div>
      </div>
    </section>
  )
}
