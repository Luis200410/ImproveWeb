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
    id: 'productivity',
    slug: 'productivity',
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

export interface AppPrivacyProfile {
  appSlug: string;
  appName: string;
  singleWord: string;
  badge: string;
  accentHex: string;
  iconName: string;
  summary: string;
  permissionsRequired: {
    name: string;
    purpose: string;
    isOptional: boolean;
  }[];
  dataHandledLocally: string[];
  dataNeverCollected: string[];
  complianceFrameworks: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const APPS_PRIVACY_PROFILES: Record<string, AppPrivacyProfile> = {
  "relationships-capital": {
    appSlug: "relationships-capital",
    appName: "IMPROVE Relationships",
    singleWord: "RELATIONSHIPS",
    badge: "APP 01 • SOCIAL CAPITAL PRIVACY",
    accentHex: "#cc0000",
    iconName: "Users",
    summary: "Your relational network is your most sensitive social asset. IMPROVE Relationships operates with zero contact list harvesting, zero address book uploads, and local-first encryption.",
    permissionsRequired: [
      { name: "Contacts (Optional)", purpose: "Read-only access to select and link specific contacts you choose to track. Never uploaded to any server.", isOptional: true },
      { name: "Notifications", purpose: "Deliver local scheduled reminders to reach out to mentors and friends.", isOptional: false }
    ],
    dataHandledLocally: [
      "Contact names and custom relationship tags chosen by you",
      "Touchpoint cadences and interaction frequency timestamps",
      "Personal reflection notes, gift ideas, and mutual milestone logs"
    ],
    dataNeverCollected: [
      "Your full address book or unselected contacts",
      "Call logs, SMS contents, or message histories",
      "Relationship graphs shared with advertising networks or social brokers"
    ],
    complianceFrameworks: ["Apple Privacy Protection Class A", "Zero Third-Party SDKs", "Apple CloudKit Private Container"],
    faqs: [
      {
        question: "Does IMPROVE upload my entire iPhone contacts list to a server?",
        answer: "Never. If you grant contacts permission, it is used strictly on-device so you can search and attach names you choose. Your contacts list is never transferred to any remote database."
      },
      {
        question: "Can anyone else see my relationship notes or gift ideas?",
        answer: "No. Your entries are stored locally on your device and synchronized exclusively through your personal, end-to-end encrypted Apple iCloud account."
      },
      {
        question: "How do I wipe my relationship data?",
        answer: "You can delete individual contacts, purge history in Settings > Clear Data, or delete the app. Because we store no data on developer servers, deleting the local app instantly destroys all records."
      }
    ]
  },
  "mind-emotions": {
    appSlug: "mind-emotions",
    appName: "IMPROVE Mind",
    singleWord: "MIND",
    badge: "APP 02 • MENTAL SOVEREIGNTY PRIVACY",
    accentHex: "#6f1bd3",
    iconName: "Compass",
    summary: "Emotional debriefs and cognitive reflections require sacred confidentiality. IMPROVE Mind enforces zero sentiment profiling, zero ad targeting, and complete psychological sovereignty.",
    permissionsRequired: [
      { name: "Face ID / Touch ID (Optional)", purpose: "Lock your cognitive debriefs and reflections behind on-device biometric security.", isOptional: true },
      { name: "Notifications", purpose: "Deliver daily evening prompts for your 3-minute mental reflection.", isOptional: false }
    ],
    dataHandledLocally: [
      "Daily cognitive debriefs, mood ratings, and emotional equilibrium scores",
      "Identified cognitive biases, reflection tags, and gratitude logs",
      "On-device mental clarity streak statistics"
    ],
    dataNeverCollected: [
      "Psychographic profiles for commercial ad targeting",
      "Journal reflections transmitted to external cloud LLMs or analytics companies",
      "Audio recordings or behavioral biometric surveillance"
    ],
    complianceFrameworks: ["On-Device Hardware Encryption", "Zero Ad SDKs", "Zero Sentiment Ingestion"],
    faqs: [
      {
        question: "Are my personal reflections used to train AI models?",
        answer: "Absolutely not. Your journal debriefs and mood scores are never ingested into machine learning training sets. Any reflection summaries execute 100% locally on your iPhone using Apple Neural Engine."
      },
      {
        question: "Can anyone at IMPROVE read my mental debriefs?",
        answer: "No. We operate no backend servers or database tables for your entries. All data is encrypted using Apple's Data Protection API and inaccessible to our team."
      },
      {
        question: "Can I lock my reflection logs with Face ID?",
        answer: "Yes. You can enable biometric app lock in Settings so only your biometric authentication can unlock the app."
      }
    ]
  },
  "productivity": {
    appSlug: "productivity",
    appName: "IMPROVE Productivity",
    singleWord: "PRODUCTIVITY",
    badge: "APP 03 • SCREEN-TIME & EXECUTION PRIVACY",
    accentHex: "#ff02e8",
    iconName: "CheckCircle2",
    summary: "Deep execution without surveillance. Screen Time app blocking is powered by Apple's privacy-preserving Family Controls framework, which guarantees that developers can never see what apps you use.",
    permissionsRequired: [
      { name: "Screen Time (Family Controls)", purpose: "Automate blocking of distracting apps during scheduled habit blocks.", isOptional: false },
      { name: "Apple Calendar (EventKit)", purpose: "Display your daily schedule and block focus slots on your calendar.", isOptional: true },
      { name: "Notifications & Live Activities", purpose: "Show focus countdown timers on Dynamic Island and Lock Screen.", isOptional: false }
    ],
    dataHandledLocally: [
      "Focus session durations, habit routine completion states, and goal milestones",
      "Selected app shield groupings (opaque tokens managed by iOS)",
      "Daily chronotype peak focus hours computed on-device"
    ],
    dataNeverCollected: [
      "Your browsing history, app usage statistics, or screen contents",
      "Names or identities of other applications installed on your phone",
      "Live location during timer execution"
    ],
    complianceFrameworks: ["Apple Family Controls Privacy Sandbox", "EventKit Privacy Standard", "On-Device Chronotype Processing"],
    faqs: [
      {
        question: "Can IMPROVE see which apps I use or my browsing history?",
        answer: "No. Apple’s Screen Time framework (Family Controls) operates in a restricted sandbox: IMPROVE receives only opaque tokens to lock and unlock categories you select. We cannot see what apps you have, when you open them, or what you browse."
      },
      {
        question: "Where are my focus timers and streaks saved?",
        answer: "Locally on your device and synchronized through your private iCloud account. No central server tracks when you work or focus."
      },
      {
        question: "How does Apple Calendar sync protect my privacy?",
        answer: "Calendar integration uses Apple's native EventKit API. Event data stays within your local calendar; we never upload your schedule to our servers."
      }
    ]
  },
  "professional-mastery": {
    appSlug: "professional-mastery",
    appName: "IMPROVE Work",
    singleWord: "WORK",
    badge: "APP 04 • CAREER & DELIVERABLES PRIVACY",
    accentHex: "#2254f5",
    iconName: "Briefcase",
    summary: "Built for ambitious professionals who require strict enterprise confidentiality. Zero employer tracking, zero telemetry, and total ownership over your proof of work.",
    permissionsRequired: [
      { name: "Notifications", purpose: "Deliver milestone reminders and weekly sprint review prompts.", isOptional: false },
      { name: "Photo Library (Optional)", purpose: "Attach deliverable screenshots or certificate attachments to your portfolio.", isOptional: true }
    ],
    dataHandledLocally: [
      "Career roadmaps, skill trees, and deliberate practice logs",
      "Milestone completion timelines and project deliverables",
      "High-impact deep focus hour logs"
    ],
    dataNeverCollected: [
      "Corporate network telemetry or employer-facing tracking",
      "Confidential work deliverables or proprietary documents",
      "Salary and compensation figures shared with external parties"
    ],
    complianceFrameworks: ["Zero Employer Surveillance", "Air-Gapped Local Database", "Private iCloud Encryption"],
    faqs: [
      {
        question: "Can my company or employer see my career goals in IMPROVE?",
        answer: "No. IMPROVE is a personal consumer application. There are no corporate administrator portals, employer monitoring integrations, or third-party enterprise analytics."
      },
      {
        question: "Where are my career deliverables and notes stored?",
        answer: "Strictly in your local iOS sandbox and your personal Apple iCloud container."
      },
      {
        question: "How can I export my proof of work for offline backup?",
        answer: "You can generate encrypted JSON or PDF exports directly from app settings at any time."
      }
    ]
  },
  "body-optimization": {
    appSlug: "body-optimization",
    appName: "IMPROVE Body",
    singleWord: "BODY",
    badge: "APP 05 • HEALTH & BIOMETRIC PRIVACY",
    accentHex: "#43b752",
    iconName: "Activity",
    summary: "Your physiological data is sacred. IMPROVE Body reads HealthKit metrics strictly on-device to calculate recovery scores and never shares your health status with data brokers or insurers.",
    permissionsRequired: [
      { name: "Apple HealthKit (Read-Only)", purpose: "Read Heart Rate Variability (HRV), sleep stages, active energy, and workouts to compute recovery velocity.", isOptional: false },
      { name: "Notifications", purpose: "Morning readiness updates and hydration/protocol alerts.", isOptional: false }
    ],
    dataHandledLocally: [
      "Heart Rate Variability (HRV) baseline averages and sleep duration metrics",
      "Daily recovery velocity scores calculated natively via CoreML",
      "Custom nutrition, workout, and supplement protocol schedules"
    ],
    dataNeverCollected: [
      "Health data sold or disclosed to insurance firms, advertisers, or third-party brokers",
      "Raw medical records or genomic information uploaded to cloud servers",
      "Location tracking during workouts unless explicitly authorized"
    ],
    complianceFrameworks: ["Apple HealthKit Privacy Guidelines", "HIPAA-Aligned Privacy Model", "On-Device Biometric Synthesis"],
    faqs: [
      {
        question: "Does IMPROVE sell my health or biometric data to insurance providers?",
        answer: "Never. Under Apple HealthKit Developer Guidelines and our ethical charter, health data is strictly prohibited from being sold, monetized, or shared with advertising platforms or insurance companies."
      },
      {
        question: "Are my vital signs uploaded to a cloud database?",
        answer: "No. Health metrics are read on-device directly from Apple HealthKit, analyzed locally, and never stored on any remote developer server."
      },
      {
        question: "How do I revoke Apple HealthKit permissions?",
        answer: "You can revoke access anytime in iOS Settings > Health > Data Access & Devices > IMPROVE."
      }
    ]
  },
  "second-brain": {
    appSlug: "second-brain",
    appName: "IMPROVE Second Brain",
    singleWord: "SECOND BRAIN",
    badge: "APP 06 • KNOWLEDGE VAULT PRIVACY",
    accentHex: "#ff6900",
    iconName: "Brain",
    summary: "Your intellectual cortex. Fast voice capture and OCR triage run entirely on-device with zero audio recordings uploaded and zero ingestion into external LLM datasets.",
    permissionsRequired: [
      { name: "Microphone & Speech Recognition", purpose: "On-device speech-to-text for thought capture. Audio is transcribed locally and never leaves your iPhone.", isOptional: true },
      { name: "Camera (Optional)", purpose: "Offline OCR to scan book pages and whiteboards into text notes.", isOptional: true },
      { name: "Apple Calendar (EventKit)", purpose: "Bridge tasks directly into your recurring calendar habit blocks.", isOptional: true }
    ],
    dataHandledLocally: [
      "Personal knowledge notes, life areas, project trees, and checklist items",
      "On-device OCR and transcription results stored in local SQLite",
      "Locally generated task breakdown micro-steps"
    ],
    dataNeverCollected: [
      "Audio recordings sent to cloud servers for speech recognition",
      "Notes or documents used to train centralized AI models",
      "Knowledge graphs or personal writings scanned for commercial insights"
    ],
    complianceFrameworks: ["On-Device Speech & Vision Processing", "Private CloudKit Encryption", "Zero LLM Scraping"],
    faqs: [
      {
        question: "Is my voice recording sent to a remote server when I use voice capture?",
        answer: "No. Speech transcription is processed natively on-device using Apple Speech framework. Audio data never leaves your iPhone and is discarded immediately after transcription."
      },
      {
        question: "Do you train AI models on my private notes or project ideas?",
        answer: "Never. Your knowledge notes, intellectual property, and plans remain 100% confidential and are never used to train machine learning models."
      },
      {
        question: "What happens if I lose my device?",
        answer: "Your notes are safely backed up inside your personal Apple iCloud account and restored automatically when you sign in on a new Apple device."
      }
    ]
  },
  "money-wealth": {
    appSlug: "money-wealth",
    appName: "IMPROVE Money",
    singleWord: "MONEY",
    badge: "APP 07 • FINANCIAL VELOCITY PRIVACY",
    accentHex: "#efb219",
    iconName: "Wallet",
    summary: "Financial intelligence with strict stateless proxying. Connect your banks via Plaid with zero developer server persistence, zero credential visibility, and total revocation control.",
    permissionsRequired: [
      { name: "Plaid Financial Integration", purpose: "Secure read-only connection to financial institutions for account balances and transaction sync.", isOptional: false },
      { name: "Notifications", purpose: "Weekly cash flow updates and budget envelope threshold alerts.", isOptional: false },
      { name: "Face ID / Biometric Lock", purpose: "Protect financial balances and account lists from unauthorized device access.", isOptional: true }
    ],
    dataHandledLocally: [
      "Read-only account balances, masked account numbers, and transaction logs stored in local SwiftData",
      "Custom spending envelopes and 90-day cash flow projections computed on-device",
      "Financial session token securely stored in iOS Keychain"
    ],
    dataNeverCollected: [
      "Your banking login username, password, or MFA security codes",
      "Transaction records or balances stored in any developer server database",
      "Payment initiation or wire transfer capabilities (read-only access only)"
    ],
    complianceFrameworks: ["Plaid End User Services Agreement", "Stateless Edge Proxy Gateway", "App Store Guideline 5.1.1(v)"],
    faqs: [
      {
        question: "Can IMPROVE see or store my bank username or password?",
        answer: "Never. When you connect a bank, you authenticate directly inside Plaid's encrypted dialog. IMPROVE never sees, transmits, or possesses your bank credentials."
      },
      {
        question: "Where are my transactions and bank balances stored?",
        answer: "Only on your personal device and inside your private Apple iCloud account. Our Supabase edge function proxy is 100% stateless: it holds zero database tables, zero user rows, and zero cached transactions."
      },
      {
        question: "Can IMPROVE move my money or initiate transfers?",
        answer: "No. IMPROVE Money requests read-only transactions access. It is technically impossible for the application to initiate wires, transfers, or withdrawals."
      },
      {
        question: "How do I permanently disconnect my bank and delete my data?",
        answer: "Go to Settings > Connected Institutions > Unlink & Delete Data. Our gateway immediately calls Plaid's /item/remove to permanently destroy your access token, and all local transaction history is purged immediately."
      }
    ]
  }
};

export function getAppBySlug(slug: string): AppIdentity | undefined {
  const normalized = slug.toLowerCase();
  if (normalized === 'money' || normalized === 'money-wealth') {
    return APPS_DATA.find((a) => a.slug === 'money-wealth');
  }
  if (normalized === 'body' || normalized === 'body-optimization') {
    return APPS_DATA.find((a) => a.slug === 'body-optimization');
  }
  if (normalized === 'work' || normalized === 'professional-mastery') {
    return APPS_DATA.find((a) => a.slug === 'professional-mastery');
  }
  if (normalized === 'mind' || normalized === 'mind-emotions') {
    return APPS_DATA.find((a) => a.slug === 'mind-emotions');
  }
  if (normalized === 'relationships' || normalized === 'relationships-capital') {
    return APPS_DATA.find((a) => a.slug === 'relationships-capital');
  }
  if (normalized === 'productivity' || normalized === 'execution-productivity') {
    return APPS_DATA.find((a) => a.slug === 'productivity');
  }
  return APPS_DATA.find((app) => app.slug === normalized);
}

export function getAppPrivacyProfile(slug: string): AppPrivacyProfile | undefined {
  const normalized = slug.toLowerCase();
  if (normalized === 'money' || normalized === 'money-wealth') {
    return APPS_PRIVACY_PROFILES['money-wealth'];
  }
  if (normalized === 'body' || normalized === 'body-optimization') {
    return APPS_PRIVACY_PROFILES['body-optimization'];
  }
  if (normalized === 'work' || normalized === 'professional-mastery') {
    return APPS_PRIVACY_PROFILES['professional-mastery'];
  }
  if (normalized === 'mind' || normalized === 'mind-emotions') {
    return APPS_PRIVACY_PROFILES['mind-emotions'];
  }
  if (normalized === 'relationships' || normalized === 'relationships-capital') {
    return APPS_PRIVACY_PROFILES['relationships-capital'];
  }
  if (normalized === 'productivity' || normalized === 'execution-productivity') {
    return APPS_PRIVACY_PROFILES['productivity'];
  }
  if (normalized === 'second-brain') {
    return APPS_PRIVACY_PROFILES['second-brain'];
  }
  return APPS_PRIVACY_PROFILES[normalized];
}
