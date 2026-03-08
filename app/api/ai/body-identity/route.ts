import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

/**
 * POST /api/ai/body-identity
 *
 * Accepts: { goal_text, current_weight_kg, height_cm }
 * Returns: { goal_label, goal_key, staple_list, week_plan }
 *
 * Fires ONCE on identity first-setup or when the user chooses to
 * "Change Identity". Not called on scans, not called on page loads.
 */
export async function POST(req: Request) {
    try {
        const { goal_text, current_weight_kg, height_cm } = await req.json()

        if (!goal_text || typeof goal_text !== 'string') {
            return NextResponse.json({ error: 'goal_text is required' }, { status: 400 })
        }
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `You are an elite sports performance coach and nutritionist planning a client's first week.

The client's goal (in their own words): "${goal_text}"
Current weight: ${current_weight_kg ? current_weight_kg + ' kg' : 'unknown'}
Height: ${height_cm ? height_cm + ' cm' : 'unknown'}

Generate a complete, personalised 7-day body system plan.
Return ONLY valid JSON — no markdown, no explanation, nothing outside the JSON object.

{
  "goal_label": "3-word max label describing the goal (e.g. 'Explosive Court Power')",
  "goal_key": "EXACTLY ONE of: pro_basketball | weight_loss | muscle_gain | athletic_performance | general_fitness",
  "staple_list": [
    { "name": "1-3 word grocery name", "category": "protein|carbs|fats|vegetables|fruits|dairy", "priority": "high|medium|low" }
  ],
  "week_plan": [
    {
      "day_index": 0,
      "day": "Monday",
      "type": "training|recovery|rest",
      "focus": "Short focus descriptor (e.g. 'Lower Body Power')",
      "duration_min": 60,
      "exercises": [
        { "name": "Exercise Name", "sets": "4", "reps": "6", "notes": "cue or load%" }
      ],
      "recovery_notes": "Specific recovery/mobility work for this day (even on training days)",
      "coaching_note": "One motivational sentence for this day"
    }
  ]
}

Rules:
- staple_list: exactly 14 items. Short grocery-list names only (1-3 words).
- week_plan: exactly 7 objects (Monday through Sunday, day_index 0-6).
- Training days: include 4-6 exercises each.
- Recovery days: exercises array is empty; recovery_notes is detailed.
- Rest days: exercises empty, recovery_notes = "Full rest. Let adaptation happen."
- Vary intensity: don't put 3 heavy training days in a row.
- Match the user's goal precisely — a dunking goal = explosive power; marathon goal = aerobic base + long runs; weight loss = circuit + LISS cardio; etc.
- coaching_note must be personal to their stated goal.`

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        // Strip any accidental markdown fences
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
        const plan = JSON.parse(cleaned)

        return NextResponse.json(plan)
    } catch (err: any) {
        console.error('[body-identity API]', err)
        return NextResponse.json({ error: err.message || 'Failed to generate plan' }, { status: 500 })
    }
}
