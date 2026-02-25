import { Entry } from '@/lib/data-store'

/**
 * Universal helper to extract the Task Title.
 * Handles the historical mismatch of property names saving under Task vs Title vs title.
 */
export function getTaskTitle(task: Entry | null | undefined, fallback = 'Untitled Task'): string {
    if (!task || !task.data) return fallback
    return task.data.Task || task.data.Title || task.data.title || fallback
}

/**
 * Universal helper to extract the Task Deadline.
 * Handles the historical mismatch of property names saving under deadline vs Deadline vs DueDate vs date.
 */
export function getTaskDeadline(task: Entry | null | undefined): string | null {
    if (!task || !task.data) return null
    return task.data.deadline || task.data.DueDate || task.data.Deadline || task.data.date || null
}

/**
 * Universal helper to extract the Project Title.
 * Handles the mismatch of property names saving under title vs Project Name.
 */
export function getProjectTitle(project: Entry | null | undefined, fallback = 'Untitled Project'): string {
    if (!project || !project.data) return fallback
    return project.data.title || project.data['Project Name'] || project.data.Title || fallback
}

/**
 * Universal helper to extract the Project Deadline.
 * Handles the mismatch of property names saving under deadline vs Deadline vs DueDate.
 */
export function getProjectDeadline(project: Entry | null | undefined): string | null {
    if (!project || !project.data) return null
    return project.data.deadline || project.data.Deadline || project.data.DueDate || null
}
