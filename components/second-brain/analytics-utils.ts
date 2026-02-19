import { Entry } from '@/lib/data-store';

export interface TaskMetrics {
    completionRate: number; // percentage 0-100
    avgDurationHours: number;
    overdueCount: number;
    totalTasks: number;
    completedTasks: number;
}

export interface ProjectMetrics {
    completionRate: number; // percentage 0-100
    activeCount: number;
    archivedCount: number;
    totalProjects: number;
    completedProjects: number;
    avgDurationDays: number;
}

export interface ProductivityScore {
    score: number;
    breakdown: {
        taskComponent: number;
        projectComponent: number;
        overduePenalty: number;
    };
}

// Date Helpers
const isValidDate = (d: Date) => !isNaN(d.getTime());

const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
};

const getStartOfMonth = (d: Date) => {
    const date = new Date(d);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
};

export const calculateTaskMetrics = (tasks: Entry[], period: 'all' | 'week' | 'month' = 'all'): TaskMetrics => {
    const now = new Date();
    let relevantTasks = tasks;

    // Filter by period
    if (period === 'week') {
        const start = getStartOfWeek(now);
        relevantTasks = tasks.filter(t => {
            const date = new Date(t.createdAt);
            const completed = t.data.completedAt ? new Date(t.data.completedAt) : null;
            return (isValidDate(date) && date >= start) || (completed && isValidDate(completed) && completed >= start);
        });
    } else if (period === 'month') {
        const start = getStartOfMonth(now);
        relevantTasks = tasks.filter(t => {
            const date = new Date(t.createdAt);
            const completed = t.data.completedAt ? new Date(t.data.completedAt) : null;
            return (isValidDate(date) && date >= start) || (completed && isValidDate(completed) && completed >= start);
        });
    }

    const totalTasks = relevantTasks.length;
    if (totalTasks === 0) {
        return { completionRate: 0, avgDurationHours: 0, overdueCount: 0, totalTasks: 0, completedTasks: 0 };
    }

    const completedTasks = relevantTasks.filter(t =>
        t.data.Status === 'done' || t.data.Status === true || t.data.Status === 'completed'
    );
    const completedCount = completedTasks.length;

    // Overdue: Not done AND deadline < now
    const overdueCount = relevantTasks.filter(t => {
        const isDone = t.data.Status === 'done' || t.data.Status === true || t.data.Status === 'completed';
        if (isDone) return false;

        if (!t.data.Deadline) return false;
        const deadline = new Date(t.data.Deadline);
        return isValidDate(deadline) && deadline < now;
    }).length;

    // Duration
    // If no completedAt, we can't calculate duration for that task accurately.
    let totalDurationHours = 0;
    let durationCount = 0;

    completedTasks.forEach(t => {
        if (t.data.completedAt && t.createdAt) {
            const start = new Date(t.createdAt);
            const end = new Date(t.data.completedAt);
            if (isValidDate(start) && isValidDate(end)) {
                const diffMs = Math.abs(end.getTime() - start.getTime());
                totalDurationHours += diffMs / (1000 * 60 * 60);
                durationCount++;
            }
        }
    });

    return {
        completionRate: (completedCount / totalTasks) * 100,
        avgDurationHours: durationCount > 0 ? totalDurationHours / durationCount : 0,
        overdueCount,
        totalTasks,
        completedTasks: completedCount
    };
};

export const calculateProjectMetrics = (projects: Entry[]): ProjectMetrics => {
    const totalProjects = projects.length;
    if (totalProjects === 0) {
        return { completionRate: 0, activeCount: 0, archivedCount: 0, totalProjects: 0, completedProjects: 0, avgDurationDays: 0 };
    }

    const completedProjects = projects.filter(p => p.data.status === 'done' || p.data.status === 'completed');
    const completedCount = completedProjects.length;

    const archivedCount = projects.filter(p => p.data.status === 'archived' || p.data.archived === true).length;

    // Active: Not done AND Not archived
    const activeCount = projects.filter(p =>
        p.data.status !== 'done' &&
        p.data.status !== 'completed' &&
        p.data.status !== 'archived' &&
        p.data.archived !== true
    ).length;

    // Avg Project Duration
    let totalDurationDays = 0;
    let durationCount = 0;
    completedProjects.forEach(p => {
        if (p.data.completedAt && p.createdAt) {
            const start = new Date(p.createdAt);
            const end = new Date(p.data.completedAt);
            if (isValidDate(start) && isValidDate(end)) {
                const diffMs = Math.abs(end.getTime() - start.getTime());
                totalDurationDays += diffMs / (1000 * 60 * 60 * 24);
                durationCount++;
            }
        }
    });

    return {
        completionRate: (completedCount / totalProjects) * 100,
        activeCount,
        archivedCount,
        totalProjects,
        completedProjects: completedCount,
        avgDurationDays: durationCount > 0 ? totalDurationDays / durationCount : 0
    };
};

export const calculateProductivityScore = (
    taskMetrics: TaskMetrics,
    projectMetrics: ProjectMetrics,
    weights = { wt: 0.5, wp: 0.3, wo: 2 } // Custom default weights
): ProductivityScore => {
    // Formula: (WT * TaskCompletionRate) + (WP * ProjectCompletionRate) - (WO * OverdueTasks)

    const taskComponent = weights.wt * taskMetrics.completionRate;
    const projectComponent = weights.wp * projectMetrics.completionRate;
    const overduePenalty = weights.wo * taskMetrics.overdueCount;

    let score = taskComponent + projectComponent - overduePenalty;

    // Cap score at 0 minimum for display? Or allow negative? User didn't specify.
    // Let's allow negative but maybe display 0 if it looks weird.

    return {
        score,
        breakdown: {
            taskComponent,
            projectComponent,
            overduePenalty
        }
    };
};
