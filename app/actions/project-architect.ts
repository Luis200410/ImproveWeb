'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

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
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables. Add it to your .env.local file.')
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' })

    const prompt = `
System Role: You are a Senior Project Architect. Your mission is to take a high-level goal and deconstruct it into a realistic, professional execution plan.

Project Title: ${projectTitle}
Project Goal/Outcome: ${projectGoal}
Timeline: Start Date: ${startDate} | Hard Deadline: ${deadline}
Linked Habit: ${habitName}

Break the project into 3 phases: Setup (Foundation), Execution (Bulk), and Polishing (Launch).
Distribute tasks across the calendar from Start Date to Deadline.

Return ONLY a valid JSON array, no markdown, no code blocks, no explanation — just raw JSON:

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

    let text: string
    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        text = response.text()
    } catch (apiError: any) {
        const msg = apiError?.message || String(apiError)
        console.error('[project-architect] Gemini API call failed:', msg)
        throw new Error(`Gemini API error: ${msg}`)
    }

    // Strip any markdown fences if model adds them despite instructions
    text = text.trim()
    if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }

    try {
        const tasks: GeneratedTask[] = JSON.parse(text)
        return tasks
    } catch (parseError: any) {
        console.error('[project-architect] JSON parse failed. Raw response:\n', text)
        throw new Error(`AI returned invalid JSON. Raw response: ${text.slice(0, 200)}`)
    }
}
