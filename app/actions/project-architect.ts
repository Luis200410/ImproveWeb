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
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables')
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

        const prompt = `
      System Role: You are a Senior Project Architect. Your mission is to take a high-level goal and deconstruct it into a realistic, professional execution plan that respects the user's actual time-blocks (Habits).

      Step 1: Context Gathering (Input Data)
      Project Title: ${projectTitle}
      Project Goal/Outcome: ${projectGoal}
      Timeline: Start Date: ${startDate} | Hard Deadline: ${deadline}
      Linked Habit: ${habitName}

      Step 2: The Reverse Engineering Logic
      Sequence Planning: Break the project into 3 phases: Setup (Foundation), Execution (Bulk), and Polishing (Launch).
      Pacing: Distribute tasks across the calendar from Start Date to Deadline.
      Dependency: Ensure tasks are logically sequenced.

      Step 3: Output Specification (JSON Structure)
      Generate a "Draft Task List" in the following JSON format. Return ONLY the JSON array, no markdown formatting.

      [
        {
          "title": "Actionable Title",
          "data": {
            "scheduled_date": "YYYY-MM-DD",
            "duration_mins": 45,
            "phase": "Execution", // One of: Setup, Execution, Polishing
            "professional_tip": "Advice to avoid blockers",
            "is_essential": true, // or false
            "description": "Brief description of the task"
          }
        }
      ]
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        let text = response.text()

        // Clean up markdown formatting if present
        if (text.startsWith('```json')) {
            text = text.replace(/^```json\n/, '').replace(/\n```$/, '')
        } else if (text.startsWith('```')) {
            text = text.replace(/^```\n/, '').replace(/\n```$/, '')
        }

        const tasks: GeneratedTask[] = JSON.parse(text)
        return tasks

    } catch (error) {
        console.error('Error in generateProjectPlan:', error)
        throw new Error('Failed to generate project plan')
    }
}
