'use client';

import React from 'react';
import {
  Brain,
  Zap,
  Briefcase,
  Footprints,
  Library,
  Banknote,
  Users,
  Waves,
  CornerDownRight,
} from 'lucide-react';

type AreaKey =
  | 'mind'
  | 'dive'
  | 'work'
  | 'body'
  | 'second-brain'
  | 'money'
  | 'relationships';

interface AreaTheme {
  stop1: string;
  stop2: string;
  rgb: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const AREA_THEMES: Record<AreaKey, AreaTheme> = {
  mind: {
    stop1: '#6F1BD3',
    stop2: '#5314A0',
    rgb: '111, 27, 211',
    Icon: Brain,
  },
  dive: {
    stop1: '#FF02E8',
    stop2: '#C300B0',
    rgb: '255, 2, 232',
    Icon: Zap,
  },
  work: {
    stop1: '#2254F5',
    stop2: '#1B43C4',
    rgb: '34, 84, 245',
    Icon: Briefcase,
  },
  body: {
    stop1: '#43B752',
    stop2: '#2F8C3C',
    rgb: '67, 183, 82',
    Icon: Footprints,
  },
  'second-brain': {
    stop1: '#FF6900',
    stop2: '#CC5400',
    rgb: '255, 105, 0',
    Icon: Library,
  },
  money: {
    stop1: '#EFB219',
    stop2: '#C7930F',
    rgb: '239, 178, 25',
    Icon: Banknote,
  },
  relationships: {
    stop1: '#990000',
    stop2: '#660000',
    rgb: '153, 0, 0',
    Icon: Users,
  },
};

interface DiveAreaCardData {
  title: string;
  area: AreaKey;
  status: string;
  pickup: string;
}

const ROW_1: DiveAreaCardData[] = [
  { title: 'Writing', area: 'mind', status: 'Mind · 47 min today', pickup: 'finish the paragraph on tides' },
  { title: 'Deep work', area: 'work', status: 'Work', pickup: 'draft the Q4 plan' },
  { title: 'Training', area: 'body', status: 'Body · 32 min today', pickup: '5×5 squats' },
  { title: 'Reading notes', area: 'second-brain', status: 'Second Brain', pickup: 'chapter 4 highlights' },
  { title: 'Budget review', area: 'money', status: 'Money', pickup: 'check last week' },
  { title: 'Design', area: 'dive', status: 'Dive · 1 h 10 min today', pickup: 'tighten the onboarding' },
];

const ROW_2: DiveAreaCardData[] = [
  { title: 'Study', area: 'mind', status: 'Mind', pickup: 'spaced review, set 3' },
  { title: 'Call home', area: 'relationships', status: 'Relationships', pickup: 'ask about the trip' },
  { title: 'Coding', area: 'work', status: 'Work · 54 min today', pickup: 'fix the sync bug' },
  { title: 'Run', area: 'body', status: 'Body', pickup: 'easy 5 km' },
  { title: 'Weekly review', area: 'second-brain', status: 'Second Brain', pickup: 'clear the inbox' },
  { title: 'Side project', area: 'dive', status: 'Dive', pickup: 'ship the landing page' },
];

function DiveAreaCard({ card }: { card: DiveAreaCardData }) {
  const theme = AREA_THEMES[card.area];
  const { Icon } = theme;

  return (
    <div
      className="dive-area-card group relative flex-none w-[300px] md:w-[380px] min-h-[124px] py-[22px] px-[16px] rounded-[15px] flex items-center gap-[14px] transition-transform duration-150 hover:-translate-y-[2px] snap-center select-none"
      style={{
        ['--tint-rgb' as string]: theme.rgb,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        backgroundImage: `radial-gradient(circle at top left, rgba(${theme.rgb}, 0.32), transparent 280px), linear-gradient(135deg, rgba(${theme.rgb}, 0.24), rgba(${theme.rgb}, 0.05))`,
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
      }}
    >
      {/* Left: Area Tile (60x60) */}
      <div
        className="w-[60px] h-[60px] rounded-[10px] grid place-items-center flex-none"
        style={{
          backgroundImage: `linear-gradient(135deg, ${theme.stop1}, ${theme.stop2})`,
        }}
      >
        <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
      </div>

      {/* Middle: Text */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="font-medium text-[20px] leading-[1.2] text-white truncate">
          {card.title}
        </div>
        <div className="font-normal text-[13px] leading-[1.35] text-white/[0.82] truncate">
          {card.status}
        </div>
        <div className="font-normal text-[13px] leading-[1.35] text-white/60 flex items-center gap-1 min-w-0">
          <CornerDownRight className="w-[14px] h-[14px] flex-none" strokeWidth={1.5} />
          <span className="truncate">{card.pickup}</span>
        </div>
      </div>

      {/* Right: Dive Button (60x60) */}
      <div className="dive-area-btn w-[60px] h-[60px] rounded-[10px] border-[0.75px] border-white/[0.18] backdrop-blur-[12px] grid place-items-center flex-none transition-[background-color] duration-150">
        <Waves className="w-[22px] h-[22px] text-white" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export function DiveAreas() {
  return (
    <section className="py-[72px] md:py-[110px] bg-[#0A0A0D] text-white overflow-hidden">
      <style>{`
        @keyframes dive-areas-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @keyframes dive-areas-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .dive-areas-track-right {
          animation: dive-areas-right 70s linear infinite;
        }
        .dive-areas-track-left {
          animation: dive-areas-left 80s linear infinite;
        }
        .dive-areas-row:hover .dive-areas-track-right,
        .dive-areas-row:hover .dive-areas-track-left {
          animation-play-state: paused;
        }
        .dive-area-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 15px;
          padding: 0.75px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.08));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .dive-area-btn {
          background-color: rgba(var(--tint-rgb), 0.25);
        }
        .dive-area-card:hover .dive-area-btn {
          background-color: rgba(var(--tint-rgb), 0.6);
        }
        @media (prefers-reduced-motion: reduce) {
          .dive-areas-row {
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
          }
          .dive-areas-track-right,
          .dive-areas-track-left {
            animation: none !important;
          }
          .dive-areas-dup {
            display: none !important;
          }
        }
      `}</style>

      {/* Centred Heading */}
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 text-center mb-12 md:mb-14">
        <h2
          className="font-normal text-white tracking-[-0.02em] leading-[1.08] m-0"
          style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
        >
          Pick an area. Dive in.
        </h2>
        <p className="font-normal text-[18px] leading-[1.55] text-white/[0.66] max-w-[560px] mx-auto mt-4 m-0">
          Your habits live as cards, one per part of your life. Tap one and you&apos;re under.
        </p>
      </div>

      {/* Edge-faded Marquee Stage */}
      <div
        className="w-full flex flex-col gap-[18px]"
        style={{
          maskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
        }}
      >
        {/* Row 1: moves RIGHT */}
        <div className="dive-areas-row w-full overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="dive-areas-track-right flex w-max gap-[18px]">
            {ROW_1.map((card, i) => (
              <DiveAreaCard key={`r1-a-${i}`} card={card} />
            ))}
            <div className="dive-areas-dup flex gap-[18px]" aria-hidden="true">
              {ROW_1.map((card, i) => (
                <DiveAreaCard key={`r1-b-${i}`} card={card} />
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: moves LEFT */}
        <div className="dive-areas-row w-full overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="dive-areas-track-left flex w-max gap-[18px]">
            {ROW_2.map((card, i) => (
              <DiveAreaCard key={`r2-a-${i}`} card={card} />
            ))}
            <div className="dive-areas-dup flex gap-[18px]" aria-hidden="true">
              {ROW_2.map((card, i) => (
                <DiveAreaCard key={`r2-b-${i}`} card={card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
