'use client';

import React from 'react';

export function DiveScenes() {
  return (
    <section id="how" className="bg-[#0A0A0D] text-white pt-[72px] md:pt-[110px] pb-[120px]">
      <div className="max-w-[1120px] mx-auto px-4 md:px-8">
        <div className="grid gap-[96px] md:gap-[140px]">
          {/* Scene 1: Dive */}
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-[0.85fr_1.15fr] items-center text-center lg:text-left gap-8 lg:gap-10 w-full">
            {/* Small + Medium upright phone render (Left on tablet, top on mobile, hidden on desktop) */}
            <div className="lg:hidden flex justify-center w-full">
              <img
                src="/images/dive/dive-scene-1-mobile.png"
                alt="Dive app cards on iPhone"
                className="w-[270px] md:w-[300px] h-[560px] md:h-[620px] object-contain drop-shadow-[0_30px_70px_rgba(0,0,0,0.65)]"
              />
            </div>

            {/* Text Column (Center on mobile & tablet, left on desktop >=900px) */}
            <div className="flex flex-col items-center text-center min-[900px]:items-start min-[900px]:text-left max-w-[440px] mx-auto min-[900px]:mx-0">
              <div className="inline-flex items-center py-[6px] px-[12px] rounded-[10px] bg-white/[0.09] border-[0.75px] border-white/12 text-[13px] font-medium text-white/66 mb-[14px]">
                Dive
              </div>
              <h3 className="text-[28px] md:text-[34px] font-light tracking-[-0.02em] m-0 mb-3">
                Your next step is already there.
              </h3>
              <p className="text-[17px] leading-[1.6] text-white/66 max-w-[440px] m-0">
                Each dive is a card for one area of your life. It shows where you said you&apos;d pick up, so starting is one tap, not a decision.
              </p>
            </div>

            {/* Desktop angled 3D phone render (Right on desktop lg+, with bottom shadow fade into #0A0A0D) */}
            <div className="hidden lg:flex justify-center relative">
              <div className="relative w-[520px] xl:w-[600px]">
                {/* Subtle ambient glow behind phone */}
                <div
                  className="pointer-events-none absolute inset-6 rounded-full opacity-20 blur-[90px]"
                  style={{ backgroundColor: '#FF02E8' }}
                />
                <img
                  src="/images/dive/dive-scene-1-desk.png"
                  alt="Dive app cards on iPhone"
                  className="relative z-[1] w-full h-auto object-contain"
                />
                {/* Soft bottom shadow fade blending the phone into #0A0A0D */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] z-[2]"
                  style={{
                    background:
                      'linear-gradient(to top, #0A0A0D 12%, rgba(10, 10, 13, 0.72) 48%, rgba(10, 10, 13, 0) 100%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Scene 2: Stay in (Phone on LEFT, Text on RIGHT — opposite of Scenes 1 & 3) */}
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-[1.15fr_0.85fr] items-center text-center lg:text-left gap-8 lg:gap-10 w-full">
            {/* Small + Medium upright phone render (Left on tablet, top on mobile, hidden on desktop) */}
            <div className="lg:hidden flex justify-center w-full">
              <img
                src="/images/dive/dive-scene-2-mobile.png"
                alt="Stay in shield screen on iPhone"
                className="w-[270px] md:w-[300px] h-[560px] md:h-[620px] object-contain drop-shadow-[0_30px_70px_rgba(0,0,0,0.65)]"
              />
            </div>

            {/* Desktop angled 3D phone render (Left on desktop lg+, with bottom shadow fade into #0A0A0D) */}
            <div className="hidden lg:flex justify-center relative">
              <div className="relative w-[520px] xl:w-[600px]">
                <div
                  className="pointer-events-none absolute inset-6 rounded-full opacity-20 blur-[90px]"
                  style={{ backgroundColor: '#FF02E8' }}
                />
                <img
                  src="/images/dive/dive-scene-2-desk.png"
                  alt="Stay in shield screen on iPhone"
                  className="relative z-[1] w-full h-auto object-contain"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] z-[2]"
                  style={{
                    background:
                      'linear-gradient(to top, #0A0A0D 12%, rgba(10, 10, 13, 0.72) 48%, rgba(10, 10, 13, 0) 100%)',
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center text-center min-[900px]:items-start min-[900px]:text-left max-w-[440px] mx-auto min-[900px]:mx-0">
              <div className="inline-flex items-center py-[6px] px-[12px] rounded-[10px] bg-white/[0.09] border-[0.75px] border-white/12 text-[13px] font-medium text-white/66 mb-[14px]">
                Stay in
              </div>
              <h3 className="text-[28px] md:text-[34px] font-light tracking-[-0.02em] m-0 mb-3">
                Everything else goes quiet.
              </h3>
              <p className="text-[17px] leading-[1.6] text-white/66 max-w-[440px] m-0">
                The apps that pull you out stay closed until you surface. Reach for one and it tells you where you are, kindly, with one way back in.
              </p>
            </div>
          </div>

          {/* Scene 3: Surface */}
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-[0.85fr_1.15fr] items-center text-center lg:text-left gap-8 lg:gap-10 w-full">
            {/* Small + Medium upright phone render (Left on tablet, top on mobile, hidden on desktop) */}
            <div className="lg:hidden flex justify-center w-full">
              <img
                src="/images/dive/dive-scene-3-mobile.png"
                alt="Surface check-in on iPhone"
                className="w-[270px] md:w-[300px] h-[560px] md:h-[620px] object-contain drop-shadow-[0_30px_70px_rgba(0,0,0,0.65)]"
              />
            </div>

            {/* Text Column (Center on mobile & tablet, left on desktop >=900px) */}
            <div className="flex flex-col items-center text-center min-[900px]:items-start min-[900px]:text-left max-w-[440px] mx-auto min-[900px]:mx-0">
              <div className="inline-flex items-center py-[6px] px-[12px] rounded-[10px] bg-white/[0.09] border-[0.75px] border-white/12 text-[13px] font-medium text-white/66 mb-[14px]">
                Surface
              </div>
              <h3 className="text-[28px] md:text-[34px] font-light tracking-[-0.02em] m-0 mb-3">
                Two taps, and your mind can let go.
              </h3>
              <p className="text-[17px] leading-[1.6] text-white/66 max-w-[440px] m-0">
                Say how deep it went (only you see it, and it&apos;s never a score) and where you&apos;ll pick up. Next time, the card is waiting with that line.
              </p>
            </div>

            {/* Desktop angled 3D phone render (Right on desktop lg+, with bottom shadow fade into #0A0A0D) */}
            <div className="hidden lg:flex justify-center relative">
              <div className="relative w-[520px] xl:w-[600px]">
                <div
                  className="pointer-events-none absolute inset-6 rounded-full opacity-20 blur-[90px]"
                  style={{ backgroundColor: '#FF02E8' }}
                />
                <img
                  src="/images/dive/dive-scene-3-desk.png"
                  alt="Surface check-in on iPhone"
                  className="relative z-[1] w-full h-auto object-contain"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] z-[2]"
                  style={{
                    background:
                      'linear-gradient(to top, #0A0A0D 12%, rgba(10, 10, 13, 0.72) 48%, rgba(10, 10, 13, 0) 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
