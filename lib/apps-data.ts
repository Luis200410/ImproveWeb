export interface AppIdentity {
  id: string;
  slug: string;
  number: string;
  name: string;
  singleWord: string;
  logoUrl: string;
  tagline: string;
  description: string;
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  accentColor: string;
  accentHex: string;
  bgGradient: string;
  borderColor: string;
  iconName: string;
  imageUrl: string;
  features: {
    title: string;
    description: string;
    metrics?: string;
  }[];
  statSummary: {
    label: string;
    value: string;
    change: string;
  }[];
}

export const APPS_DATA: AppIdentity[] = [
  {
    id: 'relationships-capital',
    slug: 'relationships-capital',
    number: '01',
    name: 'Relationships & Social Capital',
    singleWord: 'RELATIONSHIPS',
    logoUrl: '/RelationShips logo.svg',
    tagline: 'Cultivating high-value social capital',
    description: 'Nurture deep personal connections, manage high-trust professional networks, and build lasting relational capital.',
    badge: 'SYSTEM 01 • RELATIONS',
    heroTitle: 'SOCIAL CAPITAL NETWORK',
    heroSubtitle: 'Cultivate meaningful alliances and maintain high-touch relationships effortlessly.',
    accentColor: 'from-red-600 to-rose-600',
    accentHex: '#cc0000',
    bgGradient: 'from-red-950/40 via-black to-black',
    borderColor: 'border-red-500/30',
    iconName: 'Users',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop',
    features: [
      { title: 'Relational Cadence Tracker', description: 'Smart reminders to reach out to core mentors, collaborators, and trusted friends.', metrics: '42 Active Cadences' },
      { title: 'Context & Gift Memory Vault', description: 'Log important preferences, family milestones, and meaningful shared moments.', metrics: '100% Retain Rate' },
      { title: 'Network Influence Heatmap', description: 'Visualize your relationship density across key industries, locations, and interests.', metrics: 'High Cohesion' }
    ],
    statSummary: [
      { label: 'Key Touchpoints', value: '14/wk', change: '100% Cadence' },
      { label: 'Network Depth', value: '92 Score', change: '+5 vs Q1' },
      { label: 'Trust Index', value: 'High', change: 'Verified' }
    ]
  },
  {
    id: 'mind-emotions',
    slug: 'mind-emotions',
    number: '02',
    name: 'Mind, Emotions & Clarity',
    singleWord: 'MIND',
    logoUrl: '/mind Logo.svg',
    tagline: 'Mental clarity and psychological resilience',
    description: 'Stoic reflection tools, mood equilibrium tracking, and cognitive debriefing for unwavering mental fortitude.',
    badge: 'SYSTEM 02 • CLARITY',
    heroTitle: 'COGNITIVE CLARITY CHAMBER',
    heroSubtitle: 'Maintain emotional equilibrium and mental clarity through structured debriefs.',
    accentColor: 'from-purple-600 to-indigo-600',
    accentHex: '#6f1bd3',
    bgGradient: 'from-purple-950/40 via-black to-black',
    borderColor: 'border-purple-500/30',
    iconName: 'Compass',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1999&auto=format&fit=crop',
    features: [
      { title: 'Evening Mental Debrief', description: 'Guided 3-minute prompts to offload mental tension, review decisions, and reset.', metrics: 'Daily Habit' },
      { title: 'Cognitive Bias Shield', description: 'Identify emotional triggers and decision pitfalls before they influence major choices.', metrics: 'Zero Knee-Jerk Decisions' },
      { title: 'Equilibrium Index', description: 'Tracking mental baseline stability, anxiety mitigation, and focus tranquility.', metrics: '9.2/10 Stability' }
    ],
    statSummary: [
      { label: 'Clarity Index', value: '9.4/10', change: '+0.8 points' },
      { label: 'Reflection Streak', value: '45 Days', change: 'Consistent' },
      { label: 'Stress Recovery', value: 'Fast', change: '< 15 mins' }
    ]
  },
  {
    id: 'execution-productivity',
    slug: 'execution-productivity',
    number: '03',
    name: 'Productivity',
    singleWord: 'PRODUCTIVITY',
    logoUrl: '/Productivity Logo.svg',
    tagline: 'Focus sessions, habit routines, and Screen-Time app blocking',
    description: 'The execution side: yearly Four Bigs goals, daily habit routines on a real timeline, focus sessions with a timer, and a Screen-Time shield that blocks distracting apps automatically.',
    badge: 'SUITE 03 • PRODUCTIVITY',
    heroTitle: 'DEEP EXECUTION & SCREEN-TIME SHIELD',
    heroSubtitle: 'Execute with background-resilient focus timers, timeline habit routines, and automated per-habit app blocking powered by Apple Family Controls.',
    accentColor: 'from-fuchsia-500 to-pink-500',
    accentHex: '#ff02e8',
    bgGradient: 'from-fuchsia-950/40 via-black to-black',
    borderColor: 'border-fuchsia-500/30',
    iconName: 'CheckCircle2',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop',
    features: [
      { title: 'Per-Habit Auto App Blocking', description: 'Distracting apps are blocked automatically during scheduled habit blocks with zero manual toggling.', metrics: 'Family Controls' },
      { title: 'Focus Timer & Live Write-Back', description: 'Whole-block timers cycle through assigned tasks; checking off sub-steps writes straight back to Second Brain.', metrics: 'Zero-Lag Sync' },
      { title: 'Flow & Chronotype Intelligence', description: 'On-device analysis maps your peak energy windows, tailoring habit schedules to biological focus rhythms.', metrics: 'On-Device AI' }
    ],
    statSummary: [
      { label: 'App Shielding', value: 'Automated', change: 'Per-Habit Active' },
      { label: 'Habit Consistency', value: '94% (30-day)', change: 'Rolling Score' },
      { label: 'Calendar Sync', value: 'Automatic', change: 'Apple Calendar' }
    ]
  },
  {
    id: 'professional-mastery',
    slug: 'professional-mastery',
    number: '04',
    name: 'Professional Work Mastery',
    singleWord: 'WORK',
    logoUrl: '/Work Logo.svg',
    tagline: 'Professional excellence and project mastery',
    description: 'Elevate career trajectory, master high-leverage skill acquisition, and execute high-stakes projects with precision.',
    badge: 'SYSTEM 04 • CAREER',
    heroTitle: 'CAREER LEVERAGE PLATFORM',
    heroSubtitle: 'Command high-stakes initiatives and build immutable proof of work in your domain.',
    accentColor: 'from-blue-600 to-cyan-600',
    accentHex: '#2254f5',
    bgGradient: 'from-blue-950/40 via-black to-black',
    borderColor: 'border-blue-500/30',
    iconName: 'Briefcase',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
    features: [
      { title: 'High-Leverage Skill Map', description: 'Targeted micro-credentials and deliberate practice roadmaps for high-demand skills.', metrics: '3 Skills Mastered' },
      { title: 'Proof of Work Portfolio', description: 'Automated documentation of major career milestones and deliverable case studies.', metrics: '12 Deliverables' },
      { title: 'Executive Project Command', description: 'Milestone tracking optimized for strategic alignment and team delegation.', metrics: '100% On-Time Rate' }
    ],
    statSummary: [
      { label: 'High-Impact Hours', value: '38 hrs/wk', change: '+6 hrs deep focus' },
      { label: 'Skill Mastery Rate', value: '91%', change: 'Advanced' },
      { label: 'Deliverable Output', value: '4 Milestones', change: 'Ahead of schedule' }
    ]
  },
  {
    id: 'body-optimization',
    slug: 'body-optimization',
    number: '05',
    name: 'Body Optimization',
    singleWord: 'BODY',
    logoUrl: '/Body Logo.svg',
    tagline: 'Physical optimization and peak performance',
    description: 'Biometric tracking, sleep velocity recovery, and physical protocol optimization built for high-performance individuals.',
    badge: 'SYSTEM 05 • PHYSIOLOGY',
    heroTitle: 'BODY OPTIMIZATION ENGINE',
    heroSubtitle: 'Peak physiological performance through data-driven recovery and biometric precision.',
    accentColor: 'from-green-500 to-emerald-500',
    accentHex: '#43b752',
    bgGradient: 'from-green-950/40 via-black to-black',
    borderColor: 'border-green-500/30',
    iconName: 'Activity',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop',
    features: [
      { title: 'Biometric Pulse Monitor', description: 'Real-time synchronization of HRV, sleep architecture, and metabolic strain.', metrics: '98.4% Accuracy' },
      { title: 'Protocol Stack Generator', description: 'Custom nutrition, supplement, and workout regimens adapted daily.', metrics: '14 Active Routines' },
      { title: 'Recovery Velocity Score', description: 'Predictive readiness score telling you exactly how hard to push each morning.', metrics: 'Readiness 92/100' }
    ],
    statSummary: [
      { label: 'HRV Baseline', value: '84 ms', change: '+12% vs last month' },
      { label: 'Deep Sleep Avg', value: '2.4 hrs', change: '+24 min' },
      { label: 'Recovery Score', value: '94%', change: 'Optimal' }
    ]
  },
  {
    id: 'second-brain',
    slug: 'second-brain',
    number: '06',
    name: 'Second Brain',
    singleWord: 'SECOND BRAIN',
    logoUrl: '/Second Brain Logo.svg',
    tagline: 'Capture, organize, and plan on your real Apple Calendar',
    description: 'A calm, organized home for everything on your mind — captured fast, sorted into life areas and projects, broken into doable steps, and scheduled onto your real calendar by an on-device planner.',
    badge: 'SUITE 06 • SECOND BRAIN',
    heroTitle: 'ON-DEVICE COGNITIVE CORTEX',
    heroSubtitle: 'Capture frictionless ideas, auto-triage with on-device AI, and schedule tasks directly into your recurring Apple Calendar habit blocks.',
    accentColor: 'from-orange-500 to-amber-500',
    accentHex: '#ff6900',
    bgGradient: 'from-orange-950/40 via-black to-black',
    borderColor: 'border-orange-500/30',
    iconName: 'Brain',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop',
    features: [
      { title: 'Frictionless Voice & OCR Capture', description: 'Record thoughts with on-device speech transcription (no audio leaves phone) or snap photos with instant offline triage.', metrics: '100% On-Device' },
      { title: 'AI Goal Reverse-Engineering', description: 'Split ambitious tasks into micro-steps or generate entire project roadmaps from just a title and target outcome.', metrics: 'On-Device AI' },
      { title: 'Plan My Day Calendar Bridge', description: 'Proposes rolling horizon task schedules grouped under active Apple Calendar habit blocks with adaptive recovery.', metrics: 'EventKit Native' }
    ],
    statSummary: [
      { label: 'Capture Velocity', value: '< 1s', change: 'Instant Inbox' },
      { label: 'AI Privacy', value: '100% Local', change: 'Zero Cloud Storage' },
      { label: 'Calendar Sync', value: 'Bidirectional', change: 'Native EventKit' }
    ]
  },
  {
    id: 'money-wealth',
    slug: 'money-wealth',
    number: '07',
    name: 'Money & Wealth System',
    singleWord: 'MONEY',
    logoUrl: '/money Logo.svg',
    tagline: 'Financial intelligence and wealth architecture',
    description: 'Proactive cash flow forecasting, envelope budgeting, and strategic asset allocation for absolute financial velocity.',
    badge: 'SYSTEM 07 • WEALTH',
    heroTitle: 'CASH FLOW VELOCITY SUITE',
    heroSubtitle: 'See 90 days into your financial future with continuous risk analysis and automated surplus allocation.',
    accentColor: 'from-yellow-500 to-amber-500',
    accentHex: '#efb219',
    bgGradient: 'from-yellow-950/40 via-black to-black',
    borderColor: 'border-yellow-500/30',
    iconName: 'Wallet',
    imageUrl: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=2070&auto=format&fit=crop',
    features: [
      { title: '90-Day Cash Flow Line', description: 'Predictive runway view mapping every subscription, income stream, and goal trade-off.', metrics: '+90 Days Forward' },
      { title: 'Adaptive Rhythm Envelopes', description: 'Dynamic spending pools that automatically adjust to your natural purchase cycles.', metrics: '6 Active Envelopes' },
      { title: 'Surplus Allocator', description: 'Automated recommendations for investing extra capital into high-yield reserves.', metrics: '$4.2k Reallocated' }
    ],
    statSummary: [
      { label: 'Savings Velocity', value: '$2,850/mo', change: '+18% acceleration' },
      { label: 'Runway Protected', value: '14 Months', change: 'Zero Debt Risk' },
      { label: 'Subscription Efficiency', value: '94%', change: '3 Canceled' }
    ]
  }
];

export function getAppBySlug(slug: string): AppIdentity | undefined {
  return APPS_DATA.find((app) => app.slug === slug);
}
