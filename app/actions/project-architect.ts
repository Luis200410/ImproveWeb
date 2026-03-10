'use server'

import { aiOrchestrator } from '@/lib/ai/orchestrator'
import { createClient } from '@/utils/supabase/server'

export interface GeneratedTask {
    title: string
    data: {
        scheduled_date: string
        duration_mins: number
        phase: 'Setup' | 'Execution' | 'Polishing'
        professional_tip: string
        is_essential: boolean
        description?: string
    }
}

export async function generateProjectPlan(
    projectTitle: string,
    projectGoal: string,
    habitName: string,
    startDate: string,
    deadline: string
): Promise<GeneratedTask[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const prompt = `
System Role: You are a Senior Project Architect. Your mission is to take a high-level goal and deconstruct it into a realistic, professional execution plan.

Project Title: ${projectTitle}
Project Goal/Outcome: ${projectGoal}
Timeline: Start Date: ${startDate} | Hard Deadline: ${deadline}
Linked Habit: ${habitName}

Break the project into 3 phases: Setup (Foundation), Execution (Bulk), and Polishing (Launch).
Distribute tasks across the calendar from Start Date to Deadline.

Return ONLY a valid JSON array:

[
  {
    "title": "Actionable Title",
    "data": {
      "scheduled_date": "YYYY-MM-DD",
      "duration_mins": 45,
      "phase": "Execution",
      "professional_tip": "Advice to avoid blockers",
      "is_essential": true,
      "description": "Brief description"
    }
  }
]
`

    try {
        const responseText = await aiOrchestrator.generate({
            userId: user.id,
            tier: 'FLASH',
            intent: 'Project Architect',
            prompt,
            jsonResponse: true
        });

        const tasks: GeneratedTask[] = JSON.parse(responseText)
        return tasks
    } catch (parseError: any) {
        console.error('[project-architect] AI call or JSON parse failed:', parseError)
        throw new Error(`AI Architecture failed: ${parseError.message}`)
    }
}
