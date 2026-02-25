
import { Entry } from "@/lib/data-store";

// 1. Data Model Requirements (The PM Schema)
export interface ProjectData {
    // Core Identity
    title: string;
    description?: string;
    Area?: string; // ID of the Area (e.g., "Work", "Personal")

    // RAG Health Status
    ragStatus: 'Red' | 'Amber' | 'Green';

    // Computed Progress
    subtasks: { id: string; completed: boolean }[]; // Simplified for calculation

    // Time & Urgency
    startDate: string; // ISO Date
    deadline: string;  // ISO Date

    // Complexity (Scope)
    complexity: 'XS' | 'S' | 'M' | 'L' | 'XL';

    // ROI Priority
    priority: 'High' | 'Medium' | 'Low';

    // Blockers
    blockedBy?: string; // Optional text description of blocker

    // Status (Kanban)
    status: 'backlog' | 'active' | 'completed';

    // Extended Details (Sidebar)
    notes?: { id: string, title: string, content: string, createdAt: string }[];
    resources?: { id: string, title: string, type: 'link' | 'file', url: string }[];
}

export type ProjectEntry = Entry & { data: ProjectData };

// 2. Logic & Computed Values

export const calculateProgress = (subtasks: { completed: boolean }[] = []): number => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter(t => t.completed).length;
    return Math.round((completed / subtasks.length) * 100);
};

export const getUrgencyStatus = (deadline: string): 'Critical' | 'Warning' | 'Normal' => {
    if (!deadline) return 'Normal';

    const now = new Date();
    const specificDeadline = new Date(deadline);
    const diffTime = specificDeadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 2) return 'Critical';
    if (diffDays < 7) return 'Warning';
    return 'Normal';
};

export const getDaysRemaining = (deadline: string): number => {
    if (!deadline) return 0;
    const now = new Date();
    const d = new Date(deadline);
    const diffTime = d.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Statistics Interface
export interface ProjectStats {
    totalProjects: number;
    activeCount: number;
    completedCount: number;
    backlogCount: number;
    overallProgress: number; // Avg progress of active projects
    roiDistribution: {
        High: number;
        Medium: number;
        Low: number;
    };
    ragDistribution: {
        Red: number;
        Amber: number;
        Green: number;
    };
}

export const calculateProjectStats = (projects: ProjectEntry[]): ProjectStats => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.data.status === 'active');
    const completedProjects = projects.filter(p => p.data.status === 'completed');
    const backlogProjects = projects.filter(p => p.data.status === 'backlog');

    // Overall Progress (Average of active projects only)
    const totalActiveProgress = activeProjects.reduce((sum, p) => sum + calculateProgress(p.data.subtasks), 0);
    const overallProgress = activeProjects.length > 0 ? Math.round(totalActiveProgress / activeProjects.length) : 0;

    const roiDistribution = {
        High: projects.filter(p => p.data.priority === 'High').length,
        Medium: projects.filter(p => p.data.priority === 'Medium').length,
        Low: projects.filter(p => p.data.priority === 'Low').length,
    };

    // RAG Distribution (Active only usually matters, but let's do all for now)
    const ragDistribution = {
        Red: projects.filter(p => p.data.ragStatus === 'Red').length,
        Amber: projects.filter(p => p.data.ragStatus === 'Amber').length,
        Green: projects.filter(p => p.data.ragStatus === 'Green').length,
    };

    return {
        totalProjects,
        activeCount: activeProjects.length,
        completedCount: completedProjects.length,
        backlogCount: backlogProjects.length,
        overallProgress,
        roiDistribution,
        ragDistribution
    };
};

// Sorting Function
// P0 first, then closest deadline, then Health (Red on top)
export const sortProjects = (projects: ProjectEntry[]): ProjectEntry[] => {
    return [...projects].sort((a, b) => {
        // 1. Priority (High < Medium < Low)
        const pPriority: Record<string, number> = { 'High': 0, 'Medium': 1, 'Low': 2 };
        const pA = pPriority[a.data.priority || 'Low'] ?? 3;
        const pB = pPriority[b.data.priority || 'Low'] ?? 3;
        if (pA !== pB) return pA - pB;

        // 2. Deadline (Closest first) - Handling missing deadlines as "far away"
        const dA = a.data.deadline ? new Date(a.data.deadline).getTime() : Number.MAX_VALUE;
        const dB = b.data.deadline ? new Date(b.data.deadline).getTime() : Number.MAX_VALUE;
        if (dA !== dB) return dA - dB;

        // 3. Health (Red < Amber < Green) - "Red" is most critical/important to see
        const hPriority = { 'Red': 0, 'Amber': 1, 'Green': 2 };
        const hA = hPriority[a.data.ragStatus || 'Green'];
        const hB = hPriority[b.data.ragStatus || 'Green'];
        return hA - hB;
    });
};
