export interface BlogGalleryCard {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    imageAlt?: string;
    credit?: string;
    content: string; // The written section for this card below the 3D gallery
}

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content?: string;
    date: string;
    author: string;
    category: string;
    image: string;
    readingTime: string;
    galleryRadius?: number;
    cards?: BlogGalleryCard[];
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: "the-7-pillars-of-sovereign-execution",
        title: "The 7 Pillars of Sovereign Execution",
        excerpt: "Why the future of personal performance belongs to closed-loop, on-device systems that replace scattered subscriptions with unified intent.",
        date: "2026-10-10",
        author: "IMPROVE Research",
        category: "Productivity",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop",
        readingTime: "6 min",
        galleryRadius: 620,
        cards: [
            {
                id: "card-1",
                title: "01 · Relational Capital",
                subtitle: "Relationships • High-Trust Networks",
                imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop",
                imageAlt: "Relational Capital",
                credit: "Unsplash / High-touch cadence",
                content: `### The Principle of Social Cadence

Your life trajectory is a lagging reflection of your five closest relationships. Yet modern professionals manage multi-million dollar portfolios on precision software while leaving their most valuable friendships to random chance and forgotten WhatsApp threads.

True relational capital isn't networking—it is deliberate cadence. By establishing structured check-in intervals and logging meaningful life milestones, you protect your alliances before urgent crises occur.

> "A friendship maintained by intention creates an unshakeable foundation for high-conviction decisions."`
            },
            {
                id: "card-2",
                title: "02 · Mental Clarity & Debriefs",
                subtitle: "Mind • Emotion & Reflection",
                imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
                imageAlt: "Mind & Emotions",
                credit: "Unsplash / Stoic Reflection",
                content: `### The Sanctuary of Local Reflection

Centralized cloud AI has made private journaling a surveillance risk. When every vulnerable thought is ingested to train corporate LLMs, self-honesty evaporates.

IMPROVE restores psychological safety through on-device Apple Intelligence. Your mental debriefs, mood correlations, and emotional patterns are computed strictly on local silicon.

- **Zero Cloud Ingestion**: Words never leave the physical device sandbox.
- **Biometric Locking**: Hardware-enforced encryption shields reflections from snooping.
- **Cognitive Symmetry**: Reflecting daily turns reactive stress into proactive clarity.`
            },
            {
                id: "card-3",
                title: "03 · Deep Habit Execution",
                subtitle: "Productivity • Hard Shields",
                imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop",
                imageAlt: "Deep Habit Execution",
                credit: "Unsplash / Screen Time Shielding",
                content: `### Why Willpower Is a Broken Strategy

Willpower is a depleting resource. If you rely on conscious discipline to avoid checking social media while writing code or designing a product, you have already lost.

The solution is structural friction: Apple Screen Time Family Controls frameworks allow IMPROVE to lock distracting applications with anonymous tokens. You do not negotiate with your phone; the shield decides for you until the focus session concludes.`
            },
            {
                id: "card-4",
                title: "04 · The Second Brain Cortex",
                subtitle: "Second Brain • Knowledge Vault",
                imageUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=1200&auto=format&fit=crop",
                imageAlt: "Second Brain Knowledge Vault",
                credit: "Unsplash / Knowledge Architecture",
                content: `### Externalizing the Biological CPU

The biological brain evolved for insight generation, not file storage. Carrying open tabs, unfinished tasks, and half-remembered book quotes in working memory induces constant low-grade cognitive strain.

A sovereign Second Brain captures voice, scanned text, and links offline. Tasks connect directly to calendar habit blocks, closing the loop between thinking and doing without third-party server exposure.`
            },
            {
                id: "card-5",
                title: "05 · Sovereign Velocity",
                subtitle: "Complete Integrity • Unified OS",
                imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
                imageAlt: "Sovereign Velocity",
                credit: "Unsplash / Interconnected Architecture",
                content: `### One Life, One System

When your health data, productivity timers, knowledge notes, and relationship milestones communicate with 0ms latency, fragmented life chaos disappears.

You stop context-switching between twelve different $15/month subscriptions. You step into complete integrity: purpose in mind, intention in motion.`
            }
        ]
    },
    {
        slug: "the-manifesto-complete-integrity",
        title: "The Manifesto: Complete Integrity",
        excerpt: "In an age of distraction, we stand for discipline. In an era of mediocrity, we champion Complete Integrity.",
        date: "2024-03-16",
        author: "IMPROVE Team",
        category: "Mind",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop",
        readingTime: "5 min",
        content: `
# The Manifesto: Complete Integrity

## The Crisis of Modern Life
We live in the most prosperous era in human history, yet we are drowning in anxiety, distraction, and unfulfilled potential. The problem is not a lack of information—it's a lack of **systems**.

> "The mass of men lead lives of quiet desperation." — Henry David Thoreau

## The Philosophy
IMPROVE is not just an app. It is a commitment to a way of being. In an age where everything is superficial, we choose depth. In an era of "hacks" and shortcuts, we choose systems that withstand the test of time.

### The Path Forward
1. **Structure**: Clear frameworks that eliminate decision fatigue and create momentum.
2. **Measurement**: Precise tracking that reveals patterns and enables optimization.
3. **Integration**: A holistic approach that recognizes all dimensions of life are interconnected.

Complete Integrity is not about being perfect. It is about being whole. It's about ensuring your actions align with your vision across every pillar of your life—Body, Wealth, Work, Productivity, Relationships, Mind, Legacy, and Knowledge.
        `
    },
    {
        slug: "the-psychology-of-deep-work",
        title: "The Psychology of Deep Work",
        excerpt: "How to reclaim your focus and master difficult tasks in a world designed to distract you.",
        date: "2024-03-12",
        author: "IMPROVE Team",
        category: "Productivity",
        image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop",
        readingTime: "8 min",
        content: `
# The Psychology of Deep Work

Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time.

## Why Deep Work Matters
In our current economy, the ability to perform deep work is becoming increasingly rare at the exact same time it is becoming increasingly valuable. Those who cultivate this skill will thrive.

### How to Implement Deep Work
- **Schedule Your Sessions**: Treat them like non-negotiable appointments.
- **Remove Distractions**: Turn off notifications, clear your workspace.
- **Embrace Boredom**: Train your brain to be okay without constant stimulation.

The IMPROVE Productivity system is designed to facilitate these states of high-intensity focus.
        `
    },
    {
        slug: "mastering-your-second-brain",
        title: "Mastering Your Second Brain",
        excerpt: "Stop relying on your biological memory. Build a digital system that works for you.",
        date: "2024-03-05",
        author: "IMPROVE Team",
        category: "Knowledge",
        image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=2000&auto=format&fit=crop",
        readingTime: "6 min",
        content: `
# Mastering Your Second Brain

Your brain is for having ideas, not for holding them. A Second Brain is a personal system for knowledge management that helps you save and retrieve the ideas, inspirations, and insights you encounter every day.

## The CODE Method
- **Capture**: Keep what resonates.
- **Organize**: Put it where it will be useful.
- **Distill**: Find the essence.
- **Express**: Put your knowledge to work.

By externalizing your thinking, you free up your biological CPU for creative work rather than maintenance.
        `
    }
];

const LOCAL_STORAGE_KEY = "improve_blog_custom_posts";

export function getStoredCustomPosts(): BlogPost[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as BlogPost[];
    } catch {
        return [];
    }
}

export function saveStoredCustomPost(post: BlogPost): void {
    if (typeof window === "undefined") return;
    try {
        const existing = getStoredCustomPosts();
        const filtered = existing.filter((p) => p.slug !== post.slug);
        const updated = [post, ...filtered];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error("Failed to save post to localStorage", e);
    }
}

export function deleteStoredCustomPost(slug: string): void {
    if (typeof window === "undefined") return;
    try {
        const existing = getStoredCustomPosts();
        const updated = existing.filter((p) => p.slug !== slug);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error("Failed to delete post from localStorage", e);
    }
}

export function getAllMergedPosts(): BlogPost[] {
    const custom = getStoredCustomPosts();
    const customSlugs = new Set(custom.map((p) => p.slug));
    const defaults = BLOG_POSTS.filter((p) => !customSlugs.has(p.slug));
    return [...custom, ...defaults];
}

export function findMergedPost(slug: string): BlogPost | undefined {
    const all = getAllMergedPosts();
    return all.find((p) => p.slug === slug);
}
