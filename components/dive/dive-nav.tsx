'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DIVE_APP_STORE_URL } from './constants';
import { DiveLogo, ImproveMark } from './dive-assets';

export function DiveNav() {
  const pathname = usePathname();
  const isDive = pathname === '/' || pathname === '/dive' || pathname?.startsWith('/dive/');

  return (
    <div className="sticky top-0 h-0 z-50">
      <nav
        className="relative top-3 mx-auto w-[calc(100%-32px)] max-w-[1120px] rounded-[15px] border-[0.75px] border-white/10 bg-[#0A0A0D]/75 backdrop-blur-[18px] text-white font-['Inter',-apple-system,Helvetica,sans-serif]"
        aria-label="Site navigation"
      >
        <div className="flex items-center gap-3 sm:gap-7 h-[58px] pl-4 pr-3">
          {isDive ? (
            <a href="#top" className="flex items-center gap-[10px] no-underline text-white">
              <DiveLogo className="w-7 h-7 rounded-[7px]" />
              <span className="font-medium text-[17px] leading-none">Dive</span>
              <span className="text-[13px] text-white/50">by Improve</span>
            </a>
          ) : (
            <Link href="/" className="flex items-center gap-[10px] no-underline text-white">
              <ImproveMark className="w-5 h-7" />
              <span className="font-medium text-[17px] leading-none">Improve</span>
            </Link>
          )}

          <div className="hidden md:flex gap-6 ml-auto text-[14px]">
            {isDive ? (
              <>
                <a href="#how" className="no-underline text-white/70 hover:text-white transition-colors">
                  How it works
                </a>
                <a href="#privacy" className="no-underline text-white/70 hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#pricing" className="no-underline text-white/70 hover:text-white transition-colors">
                  Pricing
                </a>
                <a href="#faq" className="no-underline text-white/70 hover:text-white transition-colors">
                  FAQ
                </a>
              </>
            ) : (
              <>
                <Link href="/" className="no-underline text-white/70 hover:text-white transition-colors">
                  Dive
                </Link>
                <Link href="/apps" className="no-underline text-white/70 hover:text-white transition-colors">
                  All apps
                </Link>
                <Link href="/blog" className="no-underline text-white/70 hover:text-white transition-colors">
                  Blog
                </Link>
                <Link href="/login" className="no-underline text-white/70 hover:text-white transition-colors">
                  Sign in
                </Link>
              </>
            )}
          </div>

          {isDive ? (
            <a
              href={DIVE_APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Join Dive on TestFlight"
              className="ml-auto md:ml-0 inline-flex items-center gap-[10px] py-[9px] px-4 rounded-[10px] bg-[#FF02E8] text-black font-medium text-[14px] no-underline transition-transform active:scale-[0.97]"
            >
              Get Dive
            </a>
          ) : (
            <Link
              href="/"
              className="ml-auto md:ml-0 inline-flex items-center gap-[10px] py-[9px] px-4 rounded-[10px] bg-[#FF02E8] text-black font-medium text-[14px] no-underline transition-transform active:scale-[0.97]"
            >
              Get Dive
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
