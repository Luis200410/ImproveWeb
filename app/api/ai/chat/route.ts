import { NextResponse } from 'next/server';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/ai/chat
 * 
 * Tier 3: Efficiency & Chat (Gemini Flash-Lite)
 */
export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // 1. Authenticate
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const prompt = messages[messages.length - 1].content;

        const responseText = await aiOrchestrator.generate({
            userId: user.id,
            tier: 'LITE',
            intent: 'General Chat',
            prompt,
            supabase,
        });

        return new NextResponse(responseText, {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error generating AI response:', error);
        return NextResponse.json({ error: error.message || 'Error generating AI response' }, { status: 500 });
    }
}
