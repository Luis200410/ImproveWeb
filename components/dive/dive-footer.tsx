'use client';

import React from 'react';
import Link from 'next/link';
import { DIVE_APP_STORE_URL } from './constants';
import { DiveLogo, ImproveMark } from './dive-assets';

export function DiveFooter() {
  return (
    <footer className="py-12 md:py-16 bg-transparent text-white border-t-[0.75px] border-white/12 relative z-20 font-['Inter',-apple-system,Helvetica,sans-serif]">
      <div className="max-w-[1120px] mx-auto px-4 md:px-8">
        <div className="bg-white/[0.055] border-[0.75px] border-white/12 rounded-[15px] backdrop-blur-[20px] p-7 sm:p-10 grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8">
          <div className="col-span-2 md:col-span-1 flex flex-col items-start text-[13px] text-white/42">
            <Link href="/dive" className="flex items-center gap-[10px] no-underline text-white">
              <DiveLogo className="w-[26px] h-[26px] rounded-[7px]" />
              <span className="font-medium text-[17px]">Dive</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 mt-3 text-white/66 no-underline hover:text-white transition-colors">
              <ImproveMark className="w-4 h-[22px]" />
              by Improve
            </Link>
            <p className="text-[13px] leading-[1.5] text-white/42 mt-4 mb-0">
              © 2026 Improve.
            </p>
          </div>

          <div>
            <h4 className="m-0 mb-[14px] text-[13px] font-medium text-white">Dive</h4>
            <Link href="/dive#how" className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="/dive#privacy" className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/dive#pricing" className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/dive#faq" className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors">
              FAQ
            </Link>
            <a
              href={DIVE_APP_STORE_URL}
              title="Dive's App Store page"
              className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors"
            >
              Download
            </a>
          </div>

          <div>
            <h4 className="m-0 mb-[14px] text-[13px] font-medium text-white">Improve</h4>
            <Link href="/" className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors">
              Our why
            </Link>
            <Link href="/apps" className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors">
              All apps
            </Link>
            <Link href="/blog" className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors">
              Blog
            </Link>
          </div>

          <div>
            <h4 className="m-0 mb-[14px] text-[13px] font-medium text-white">Legal</h4>
            <Link href="/privacy" className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors">
              Privacy policy
            </Link>
            <Link href="/terms" className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/refund" className="block text-[14px] text-white/66 no-underline mb-[10px] hover:text-white transition-colors">
              Refund
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
