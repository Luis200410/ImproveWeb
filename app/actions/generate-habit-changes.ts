'use server'

import { Schema, SchemaType } from '@google/generative-ai'
import { Entry } from '@/lib/data-store'
import { aiOrchestrator } from '@/lib/ai/orchestrator'
import { createClient } from '@/utils/supabase/server'

export interface HabitChangePlan {
    add: {
        'Habit Name': string;
        'Category': string;
        'Frequency': string;
        'Time': string; // 24h format HH:MM
        'Duration (minutes)': number;
        'Cue': string;
        'Craving': string;
        'Response': string;
        'Reward': string;
    }[];
    modify: {
        id: string;
        'Habit Name'?: string;
        'Category'?: string;
        'Frequency'?: string;
        'Time'?: string;
        'Duration (minutes)'?: number;
        'Cue'?: string;
        'Craving'?: string;
        'Response'?: string;
        'Reward'?: string;
        rationale: string;
    }[];
    delete: string[];
    summary: string;
    error?: string;
}

const habitSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        'Habit Name': { type: SchemaType.STRING },
        'Category': { type: SchemaType.STRING },
        'Frequency': { type: SchemaType.STRING, description: "usually 'daily'" },
        'Time': { type: SchemaType.STRING, description: "24h format HH:MM" },
        'Duration (minutes)': { type: SchemaType.NUMBER },
        'Cue': { type: SchemaType.STRING },
        'Craving': { type: SchemaType.STRING },
        'Response': { type: SchemaType.STRING },
        'Reward': { type: SchemaType.STRING }
    },
    required: ["Habit Name", "Category", "Frequency", "Time", "Duration (minutes)", "Cue", "Craving", "Response", "Reward"]
}

const changePlanSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        add: {
            type: SchemaType.ARRAY,
            items: habitSchema
        },
        modify: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    id: { type: SchemaType.STRING },
                    'Habit Name': { type: SchemaType.STRING },
                    'Category': { type: SchemaType.STRING },
                    'Frequency': { type: SchemaType.STRING },
                    'Time': { type: SchemaType.STRING },
                    'Duration (minutes)': { type: SchemaType.NUMBER },
                    'Cue': { type: SchemaType.STRING },
                    'Craving': { type: SchemaType.STRING },
                    'Response': { type: SchemaType.STRING },
                    'Reward': { type: SchemaType.STRING },
                    rationale: { type: SchemaType.STRING }
                },
                required: ["id", "rationale"]
            }
        },
        delete: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Array of habit IDs to delete"
        },
        summary: {
            type: SchemaType.STRING,
            description: "A short, encouraging message explaining the changes made to the routine."
        }
    },
    required: ["add", "modify", "delete", "summary"]
}

export async function generateHabitChanges(
    intent: string,
    currentHabits: Entry[]
): Promise<HabitChangePlan | null> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const activeHabits = currentHabits.filter(h => h.data['Type'] !== 'adaptation' && !h.data['archived']);

        const prompt = `
You are an expert productivity coach and AI routine architect based on the book Atomic Habits.
The user wants to permanently change their routine.
User Intent: "${intent}"

Current Active Habits:
${JSON.stringify(activeHabits.map(h => ({
            id: h.id,
            name: h.data['Habit Name'],
            time: h.data['Time'],
            duration: h.data['Duration (minutes)'],
            cue: h.data['Cue'],
            craving: h.data['Craving'],
            response: h.data['Response'],
            reward: h.data['Reward']
        })), null, 2)}

Strict Instructions:
1. Parse the user intent to figure out if they want to ADD, MODIFY, or DELETE habits.
2. If adding a new habit, you MUST determine a realistic Time (HH:MM) and provide Atomic Habit fields.
3. Provide a short, friendly 'summary' explaining the new setup to the user.
`

        const responseText = await aiOrchestrator.generate({
            userId: user.id,
            tier: 'LITE',
            intent: 'Habit Rotation',
            prompt,
            jsonResponse: true,
            supabase
        });

        if (responseText) {
            try {
                return JSON.parse(responseText) as HabitChangePlan;
            } catch (e: any) {
                console.error("JSON Parse Error:", e, "Raw Text:", responseText);
                return { add: [], modify: [], delete: [], summary: "", error: `JSON Parse failed: ${e.message}` };
            }
        }
        return { add: [], modify: [], delete: [], summary: "", error: "Empty response from AI" };

    } catch (error: any) {
        console.error("Error generating habit changes:", error);
        return { add: [], modify: [], delete: [], summary: "", error: error.message || String(error) };
    }
}
