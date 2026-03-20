
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
    complexity: '1' | '2' | '3' | '4' | '5';

    // ROI Priority
    priority: 'High' | 'Medium' | 'Low';

    // Blockers
    blockedBy?: string; // Optional text description of blocker

    // Status (Kanban)
    status: 'inbox' | 'active' | 'done' | 'backlog';

    // Extended Details (Sidebar)
    notes?: { id: string, title: string, content: string, createdAt: string }[];
    resources?: { id: string, title: string, type: 'link' | 'file', url: string }[];
}

export type ProjectEntry = Entry & { data: ProjectData };

// 2. Logic & Computed Values

export const calculateProgress = (project: ProjectEntry, linkedTasks: Entry[] = []): number => {
    // 1. If we have real linked tasks, use them as the source of truth
    if (linkedTasks.length > 0) {
        const completed = linkedTasks.filter(t => {
            const status = t.data?.Status || t.data?.status;
            return status === 'done' || status === 'Done' || status === 'Completed' || status === true;
        }).length;
        return Math.round((completed / linkedTasks.length) * 100);
    }

    // 2. Fallback to embedded subtasks
    const subtasks = project.data.subtasks || [];
    if (subtasks.length === 0) return 0;
    
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

export const calculateProjectStats = (projects: ProjectEntry[], allTasks: Entry[] = []): ProjectStats => {
    const activeProjects = projects.filter(p => p.data.status === 'active' && !(p.data as any).archived);
    const completedProjects = projects.filter(p => p.data.status === 'done' && !(p.data as any).archived);
    const inboxProjects = projects.filter(p => p.data.status === 'inbox' && !(p.data as any).archived);

    // Helper to get linked tasks for a project
    const getTasksForProject = (projectId: string) => {
        return allTasks.filter(t => {
            const pRel = t.data.Project || t.data.projectId || t.data.project;
            const relId = typeof pRel === 'object' ? pRel?.id : pRel;
            return relId === projectId;
        });
    };

    // Overall Progress (Total completed tasks / Total tasks across active projects)
    let totalTasksCount = 0;
    let completedTasksCount = 0;

    activeProjects.forEach(p => {
        const pTasks = getTasksForProject(p.id);
        const subtasks = p.data.subtasks || [];
        
        if (pTasks.length > 0) {
            totalTasksCount += pTasks.length;
            completedTasksCount += pTasks.filter(t => {
                const s = t.data?.Status || t.data?.status;
                return s === 'Done' || s === 'done' || s === 'Completed' || s === 'completed' || s === true;
            }).length;
        } else if (subtasks.length > 0) {
            totalTasksCount += subtasks.length;
            completedTasksCount += subtasks.filter(t => t.completed).length;
        }
    });
    
    const overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    const roiDistribution = {
        High: projects.filter(p => p.data.priority === 'High' && !(p.data as any).archived).length,
        Medium: projects.filter(p => p.data.priority === 'Medium' && !(p.data as any).archived).length,
        Low: projects.filter(p => p.data.priority === 'Low' && !(p.data as any).archived).length,
    };

    const ragDistribution = {
        Red: projects.filter(p => p.data.ragStatus === 'Red' && !(p.data as any).archived).length,
        Amber: projects.filter(p => p.data.ragStatus === 'Amber' && !(p.data as any).archived).length,
        Green: projects.filter(p => p.data.ragStatus === 'Green' && !(p.data as any).archived).length,
    };

    return {
        totalProjects: projects.filter(p => !(p.data as any).archived).length,
        activeCount: activeProjects.length,
        completedCount: completedProjects.length,
        backlogCount: inboxProjects.length,
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
