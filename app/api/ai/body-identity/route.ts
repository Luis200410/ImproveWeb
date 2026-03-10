import { NextResponse } from 'next/server'
import { aiOrchestrator } from '@/lib/ai/orchestrator'
import { createClient } from '@/utils/supabase/server'

/**
 * POST /api/ai/body-identity
 *
 * Tier 1: High-Reasoning (Gemini 1.5 Pro)
 * Limit: 1 execution per week/user.
 * Requires "Athlete Pro" status.
 */
export async function POST(req: Request) {
  try {
    const { goal_text, current_weight_kg, height_cm } = await req.json()

    if (!goal_text || typeof goal_text !== 'string') {
      return NextResponse.json({ error: 'goal_text is required' }, { status: 400 })
    }

    // 1. Authenticate & Check Pro Status
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: sub } = await supabase
      .from('entries')
      .select('data')
      .eq('user_id', user.id)
      .eq('microapp_id', 'subscription-status')
      .maybeSingle()

    const isPro = sub?.data?.status === 'active'
    if (!isPro) {
      return NextResponse.json({
        error: 'Athlete Pro status required for this high-reasoning plan generation.'
      }, { status: 403 })
    }

    // 2. Orchestrate Generation
    const prompt = `You are an elite sports performance coach and nutritionist planning a client's first week.

The client's goal (in their own words): "${goal_text}"
Current weight: ${current_weight_kg ? current_weight_kg + ' kg' : 'unknown'}
Height: ${height_cm ? height_cm + ' cm' : 'unknown'}

Generate a complete, personalised 7-day body system plan.
Return ONLY valid JSON.

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
      "recovery_notes": "Specific recovery/mobility work for this day",
      "coaching_note": "One motivational sentence"
    }
  ]
}`

    const planJson = await aiOrchestrator.generate({
      userId: user.id,
      tier: 'PRO',
      intent: 'Identity Plan Generation',
      prompt,
      jsonResponse: true
    })

    const plan = JSON.parse(planJson)
    return NextResponse.json(plan)

  } catch (err: any) {
    console.error('[body-identity API]', err)
    return NextResponse.json({ error: err.message || 'Failed to generate plan' }, { status: 500 })
  }
}
