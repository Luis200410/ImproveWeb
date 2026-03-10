import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { aiOrchestrator } from '@/lib/ai/orchestrator';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Context Data
        const [
            { data: identity },
            { data: exerciseLogs },
            { data: dietEntries },
            { data: recoveryEntries }
        ] = await Promise.all([
            supabase.from('body_identity').select('*').eq('user_id', user.id).maybeSingle(),
            supabase.from('exercise_log').select('*').eq('user_id', user.id).order('last_logged_at', { ascending: false }).limit(10),
            supabase.from('entries').select('*').eq('user_id', user.id).eq('microapp_id', 'diet').order('created_at', { ascending: false }).limit(20),
            supabase.from('entries').select('*').eq('user_id', user.id).eq('microapp_id', 'recovery').order('created_at', { ascending: false }).limit(10)
        ]);

        if (!identity) {
            return NextResponse.json({ error: 'Body Identity not found. Please complete setup first.' }, { status: 404 });
        }

        // 2. Format Context
        const context = `
SYSTEM: IMPROVE · Intelligence Orchestration · 15-Second Coaching Session
USER GOAL: ${identity.goal_label} (${identity.goal_text})
CURRENT STATS: ${identity.current_weight_kg}kg, Target: ${identity.target_weight_kg}kg, Height: ${identity.height_cm}cm

RECENT EXERCISE PERFORMANCE:
${exerciseLogs?.map(l => `- ${l.exercise_name}: Last ${l.last_sets_done}x${l.last_reps_done} @ ${l.last_weight_kg}kg (PR: ${l.pr_weight_kg}kg)`).join('\n') || 'No exercise logs yet.'}

RECENT FUEL (DIET):
${dietEntries?.map(e => `- ${e.data.Meal}: ${e.data.Calories}kcal, P:${e.data['Protein (g)']}g, C:${e.data['Carbs (g)']}g, F:${e.data['Fats (g)']}g. Note: ${e.data.Notes}`).join('\n') || 'No diet logs yet.'}

RECENT RECOVERY:
${recoveryEntries?.map(e => `- ${e.data.Modality}: Readiness ${e.data['Readiness (1-10)']}/10, Sleep ${e.data['Sleep Hours']}h`).join('\n') || 'No recovery logs yet.'}

INSTRUCTION: 
Provide a "15-Second Coaching Session". 
1. Use 3-4 bullet points max.
2. Be blunt, high-integrity, and performance-focused.
3. Identify one specific win and one specific adjustment based on the logs vs their goal.
4. Keep it under 60 words total.
5. Format with rich text/markdown.
`;

        // 3. AI Generation
        const response = await aiOrchestrator.generate({
            userId: user.id,
            tier: 'FLASH',
            intent: 'coaching_review',
            prompt: context,
            supabase
        });

        return NextResponse.json({ coaching: response });

    } catch (error: any) {
        console.error('[COACHING_API_ERROR]:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate coaching feedback' }, { status: 500 });
    }
}
