
import { Entry } from "@/lib/data-store";

// Area Data Model
export interface AreaData {
    title: string;
    description?: string;

    // RAG Health Status
    ragStatus: 'Red' | 'Amber' | 'Green';

    // High Level Goal
    goal?: string;

    // Decoration
    icon?: string; // Emoji
    color?: string; // Hex or Tailwind class

    // Stats (Computed or Cached)
    projectCount?: number;
    taskCount?: number;
}

export type AreaEntry = Entry & { data: AreaData };

// Helper Types
export const AREA_COLORS = {
    Red: 'bg-rose-500',
    Amber: 'bg-amber-500',
    Green: 'bg-emerald-500',
    Blue: 'bg-blue-500',
    Purple: 'bg-purple-500',
    Pink: 'bg-pink-500',
};

export const AREA_BG_COLORS = {
    Red: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    Amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    Green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    Blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    Purple: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
    Pink: 'bg-pink-500/10 border-pink-500/20 text-pink-500',
};
