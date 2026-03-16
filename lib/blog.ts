export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author: string;
    category: string;
    image: string;
    readingTime: string;
}

export const BLOG_POSTS: BlogPost[] = [
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
