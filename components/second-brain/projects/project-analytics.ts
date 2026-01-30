
import { Entry } from "@/lib/data-store";
import { ProjectEntry, getDaysRemaining } from "./project-utils";

/**
 * Advanced Analytics Engine for Project Management
 * Implements SPC (Statistical Process Control) and EVM (Earned Value Management) logic.
 */

export interface AnalyticsMetrics {
    velocity: number;           // Tasks / Day
    volatility: number;         // Standard Deviation (Sigma)
    spi: number;                // Schedule Performance Index
    forecastDate: string | null;// Predicted completion date
    daysLate: number;           // Predicted delay in days
    biasFactor: number;         // Estimation accuracy (1.0 = perfect, >1.0 = optimistic)
    completionPercentage: number;
}

// 1. Velocity & Volatility (SPC)
// ----------------------------------------------------------------------------

export const calculateVelocity = (linkedTasks: Entry[], daysLookback = 28): number => {
    // Filter for completed tasks within the lookback window
    const now = new Date();
    const cutoff = new Date(now.getTime() - daysLookback * 24 * 60 * 60 * 1000);

    const completedRecent = linkedTasks.filter(t => {
        const isDone = t.data.Status === "Done" || t.data.Status === true;

        // Use updatedAt as completion time proxy if separate completedAt missing
        // TODO: In future, add dedicated `completedAt` to Entry schema
        const completionDate = new Date(t.updatedAt || t.createdAt);

        return isDone && completionDate >= cutoff;
    });

    if (completedRecent.length === 0) return 0;

    // We calculate velocity as: Total Completed / Days in Window (or days since first task if shorter)
    // To be more precise, we can find the range of active work.

    // Simple Rolling Average:
    // If user has been active for less than lookback, divide by actual active days.
    const firstTaskDate = linkedTasks
        .map(t => new Date(t.createdAt).getTime())
        .sort((a, b) => a - b)[0];

    if (!firstTaskDate) return 0;

    const daysActive = Math.max(1, Math.ceil((now.getTime() - Math.max(firstTaskDate, cutoff.getTime())) / (1000 * 60 * 60 * 24)));

    return Number((completedRecent.length / daysActive).toFixed(2));
};

export const calculateStandardDeviation = (linkedTasks: Entry[], velocity: number): number => {
    // We need daily throughput data points to calculate deviation.
    // Group completed tasks by day.
    const throughputByDay: Record<string, number> = {};
    const now = new Date();

    // Initialize last 14 days with 0
    for (let i = 0; i < 14; i++) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        throughputByDay[d] = 0;
    }

    linkedTasks.forEach(t => {
        if (t.data.Status === "Done" || t.data.Status === true) {
            const date = new Date(t.updatedAt).toISOString().split('T')[0];
            if (throughputByDay[date] !== undefined) {
                throughputByDay[date]++;
            }
        }
    });

    const values = Object.values(throughputByDay);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

    return Number(Math.sqrt(variance).toFixed(2));
};


// 2. Project Health (EVM) - SPI
// ----------------------------------------------------------------------------

export const calculateSPI = (project: ProjectEntry, linkedTasks: Entry[]): number => {
    if (!project.data.startDate || !project.data.deadline) return 1.0;

    const start = new Date(project.data.startDate).getTime();
    const end = new Date(project.data.deadline).getTime();
    const now = new Date().getTime();
    const totalDuration = end - start;
    const elapsed = now - start;

    if (elapsed <= 0) return 1.0; // Hasn't started
    if (totalDuration <= 0) return 0.0; // Invalid dates

    // Planned Value (PV) %: How much time has passed? (assuming linear burn)
    // If 50% of time passed, we expect 50% of work done.
    const plannedProgress = Math.min(1.0, elapsed / totalDuration);

    // Earned Value (EV) %: Actual completed tasks / Total tasks
    // If no tasks, we use subtasks from schema as fallback, or 0.
    const totalTasks = linkedTasks.length;
    const completedTasks = linkedTasks.filter(t => t.data.Status === "Done" || t.data.Status === true).length;

    let actualProgress = 0;
    if (totalTasks > 0) {
        actualProgress = completedTasks / totalTasks;
    } else {
        // Fallback to manual subtasks if no linked tasks
        return 1.0;
    }

    if (plannedProgress === 0) return 1.0;

    // SPI = EV / PV
    // SPI < 1.0 means Behind Schedule
    // SPI > 1.0 means Ahead of Schedule
    return Number((actualProgress / plannedProgress).toFixed(2));
};


// 3. Forecasting & Estimation
// ----------------------------------------------------------------------------

export const predictCompletion = (project: ProjectEntry, linkedTasks: Entry[]): { date: string | null, daysLate: number, slope: number } => {
    const totalTasks = linkedTasks.length;
    const completedTasks = linkedTasks.filter(t => t.data.Status === "Done" || t.data.Status === true);

    // Sort completed by date
    completedTasks.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

    if (completedTasks.length < 2) {
        // Not enough data points for regression, fall back to simple velocity
        const velocity = calculateVelocity(linkedTasks);
        if (velocity <= 0.1) return { date: null, daysLate: 999, slope: 0 };

        const remaining = totalTasks - completedTasks.length;
        const days = Math.ceil(remaining / velocity);
        const date = new Date();
        date.setDate(date.getDate() + days);

        let delayed = 0;
        if (project.data.deadline) {
            delayed = Math.ceil((date.getTime() - new Date(project.data.deadline).getTime()) / (1000 * 60 * 60 * 24));
        }
        return { date: date.toISOString(), daysLate: Math.max(0, delayed), slope: velocity };
    }

    // Linear Regression: y = mx + b
    // x = Day number (0 = first completion day)
    // y = Cumulative Tasks Completed

    const firstDate = new Date(completedTasks[0].updatedAt).getTime();
    const dots = completedTasks.map((t, i) => {
        const date = new Date(t.updatedAt).getTime();
        const day = (date - firstDate) / (1000 * 60 * 60 * 24); // x
        const count = i + 1; // y (cumulative)
        return { x: day, y: count };
    });

    const n = dots.length;
    const sumX = dots.reduce((acc, d) => acc + d.x, 0);
    const sumY = dots.reduce((acc, d) => acc + d.y, 0);
    const sumXY = dots.reduce((acc, d) => acc + (d.x * d.y), 0);
    const sumXX = dots.reduce((acc, d) => acc + (d.x * d.x), 0);

    // Slope (m) = (NΣXY - ΣXΣY) / (NΣXX - (ΣX)²)
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Intercept (b) = (ΣY - mΣX) / N
    const intercept = (sumY - slope * sumX) / n;

    if (slope <= 0.01) return { date: null, daysLate: 999, slope: 0 }; // Flatlining or regression error

    // Predict when Y = TotalTasks
    // TotalTasks = m * x + b  =>  x = (TotalTasks - b) / m
    const daysToFinish = (totalTasks - intercept) / slope;

    const finishDate = new Date(firstDate + (daysToFinish * 24 * 60 * 60 * 1000));

    // Wait, ensure forecast is in the future. Regression might predict past if completed=total.
    // If calculated date is in past but tasks remain (not possible with this math usually), clamp to today? 
    // Actually, if Y=Total, x is the date it finished.
    // If Y < Total, x is future.

    let daysLate = 0;
    if (project.data.deadline) {
        daysLate = Math.ceil((finishDate.getTime() - new Date(project.data.deadline).getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
        date: finishDate.toISOString(),
        daysLate: Math.max(0, daysLate),
        slope: Number(slope.toFixed(3))
    };
};

export const calculateBiasFactor = (linkedTasks: Entry[]): number => {
    // Ideally compares Actual Duration vs Estimated.
    // Since we don't have explicit "Estimated Hours" on all tasks yet,
    // we can look for tasks that have "Due Dates" vs "Completed Dates".

    // Heuristic:
    // If a task was completed AFTER its Due Date, that's optimism bias.

    const tasksWithDeadlines = linkedTasks.filter(t => t.data.DueDate && (t.data.Status === "Done" || t.data.Status === true));
    if (tasksWithDeadlines.length === 0) return 1.0; // Neutral baseline

    let totalBias = 0;
    let count = 0;

    tasksWithDeadlines.forEach(t => {
        const due = new Date(t.data.DueDate).getTime();
        const completed = new Date(t.updatedAt).getTime();

        // If completed late
        if (completed > due) {
            // Factor is (Time Taken / Time Available)? Can't compute exactly without Start Date.
            // Simplified: Bias = 1.0 + (Days Late / 7). Each week late adds 1.0 to factor? 
            // Let's use a simpler multiplier: 1 day late = 1.1x factor.

            const daysLate = (completed - due) / (1000 * 60 * 60 * 24);
            if (daysLate > 0) {
                totalBias += (1 + (daysLate * 0.1)); // 1 day late adds 10% bias
                count++;
            } else {
                totalBias += 1.0; // On time
                count++;
            }
        } else {
            totalBias += 0.9; // Early completion (Pessimism bias - good!)
            count++;
        }
    });

    return Number((totalBias / count).toFixed(2));
};

export const generateAnalytics = (project: ProjectEntry, linkedTasks: Entry[]): AnalyticsMetrics => {
    const velocity = calculateVelocity(linkedTasks);
    const volatility = calculateStandardDeviation(linkedTasks, velocity);
    const spi = calculateSPI(project, linkedTasks);
    const { date, daysLate } = predictCompletion(project, linkedTasks);
    const biasFactor = calculateBiasFactor(linkedTasks);

    const total = linkedTasks.length;
    const done = linkedTasks.filter(t => t.data.Status === "Done" || t.data.Status === true).length;

    return {
        velocity, // Still useful for display, even if regression used for date
        volatility,
        spi,
        forecastDate: date,
        daysLate,
        biasFactor,
        completionPercentage: total > 0 ? Math.round((done / total) * 100) : 0
    };
};
