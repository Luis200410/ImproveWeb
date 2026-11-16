'use client'

import React from 'react'
import Link from 'next/link'
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/general/dock'
import { APPS_DATA } from '@/lib/apps-data'

const logoMap: Record<string, string> = {
  'body-optimization': '/Body Logo.svg',
  'second-brain': '/Second Brain Logo.svg',
  'money-wealth': '/money Logo.svg',
  'professional-mastery': '/Work Logo.svg',
  'productivity': '/Productivity Logo.svg',
  'execution-productivity': '/Productivity Logo.svg',
  'relationships-capital': '/RelationShips logo.svg',
  'mind-emotions': '/mind Logo.svg',
  'legacy-fun': '/logo.svg',
}

interface OtherDedicatedAppsDockProps {
  currentSlug?: string
}

export function OtherDedicatedAppsDock({ currentSlug }: OtherDedicatedAppsDockProps) {
  const currentApp = APPS_DATA.find((app) => app.slug === currentSlug)
  const brandColor = currentApp?.accentHex || '#FF02E8'

  const appsToShow = currentSlug 
    ? APPS_DATA.filter((app) => app.slug !== currentSlug)
    : APPS_DATA

  return (
    <section className="relative py-16 px-6 border-t border-white/10 overflow-hidden bg-transparent select-none">
      {/* Background ambient glow matching the app's brand color */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-15 blur-[180px] transition-all duration-700"
        style={{ backgroundColor: brandColor }}
      />

      {/* Main Unified Access-Glass Container (Same as Pricing) */}
      <div className="access-glass w-full max-w-7xl mx-auto relative z-10 overflow-hidden px-6 sm:px-10 lg:px-14 py-8 sm:py-10 space-y-8">
        
        {/* Section Header (Same Title Typography as Pricing, no badge pills) */}
        <div className="space-y-3">
          <p 
            className="kicker uppercase tracking-widest font-bold text-xs sm:text-sm"
            style={{ color: brandColor }}
          >
            EXPLORE THE INTEGRITY NETWORK
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none drop-shadow-md">
            OTHER DEDICATED APPS
          </h2>
        </div>

        {/* Dedicated Dock Container inside the access-glass */}
        <div className="w-full flex flex-col items-center justify-center pt-2 pb-2 overflow-x-auto">
          <Dock 
            panelHeight={104} 
            magnification={145} 
            distance={180} 
            className="items-center bg-transparent border-none shadow-none px-4 rounded-3xl gap-4 sm:gap-6"
          >
            {appsToShow.map((app) => {
              const isAvailable = app.slug === 'productivity'

              return (
                <DockItem
                  key={app.id}
                  className={`aspect-square rounded-2xl bg-black/80 border-none shadow-none transition-all group/dock relative overflow-hidden flex items-center justify-center ${
                    isAvailable ? 'hover:bg-black cursor-pointer' : 'opacity-30 grayscale cursor-not-allowed'
                  }`}
                >
                  <DockLabel className="bg-black text-white border border-zinc-800 font-semibold px-3 py-1 text-xs sm:text-sm shadow-xl whitespace-nowrap">
                    {isAvailable ? 'Dive' : `${app.name} (Coming Soon)`}
                  </DockLabel>
                  <DockIcon>
                    {isAvailable ? (
                      <Link 
                        href="/dive" 
                        className="w-full h-full flex items-center justify-center p-1"
                      >
                        <img
                          src={logoMap[app.slug] || '/logo.svg'}
                          alt={app.name}
                          className="w-full h-full object-contain filter group-hover/dock:scale-110 transition-transform"
                        />
                      </Link>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-1 relative select-none">
                        <img
                          src={logoMap[app.slug] || '/logo.svg'}
                          alt={app.name}
                          className="w-full h-full object-contain filter"
                        />
                        {/* Dimming overlay on inactive apps */}
                        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/10">
                            Soon
                          </span>
                        </div>
                      </div>
                    )}
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
