'use server'

import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'
import { Entry } from '@/lib/data-store'

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
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: changePlanSchema,
            }
        });

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
2. If adding a new habit, you MUST determine a realistic Time in 24h format (HH:MM) and provide great Atomic Habit fields (Cue, Craving, Response, Reward).
3. If modifying an existing habit (because the user asked, or to make room for a new habit), include it in 'modify'. ALWAYS provide the 'id' of the habit you are modifying. Provide ONLY the fields that are changing. Provide a short 'rationale' for why it changed.
4. If deleting a habit (only if the user explicitly asks to remove it), add its 'id' to the 'delete' array.
5. Make sure the schedule makes logical sense (no overlapping habits if possible, though minor overlaps are okay if unavoidable). Time format MUST be HH:MM in 24h format.
6. Provide a short, friendly 'summary' explaining the new setup to the user.
`

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        if (responseText) {
            let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                return JSON.parse(cleanedText) as HabitChangePlan;
            } catch (e: any) {
                console.error("JSON Parse Error:", e, "Raw Text:", cleanedText);
                return { add: [], modify: [], delete: [], summary: "", error: `JSON Parse failed: ${e.message}` };
            }
        }
        return { add: [], modify: [], delete: [], summary: "", error: "Empty response from AI" };

    } catch (error: any) {
        console.error("Error generating habit changes:", error);
        return { add: [], modify: [], delete: [], summary: "", error: error.message || String(error) };
    }
}
