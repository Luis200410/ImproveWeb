'use server'

import { aiOrchestrator } from '@/lib/ai/orchestrator'
import { createClient } from '@/utils/supabase/server'

export async function summarizeResource(
    type: 'website' | 'image' | 'file',
    content: string, // URL or base64 string
    mimeType?: string
): Promise<{ summary: string; success: boolean }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        if (type === 'website') {
            const res = await fetch(content, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            })

            if (!res.ok) {
                throw new Error(`Failed to fetch website: ${res.status} ${res.statusText}`)
            }

            const html = await res.text()
            const textContent = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()

            const prompt = `You are a helpful research assistant. Summarize the following website content comprehensively. Extract the main ideas and highlight the BEST points. Keep it structured.\n\nContent:\n${textContent.slice(0, 30000)}`

            const summary = await aiOrchestrator.generate({
                userId: user.id,
                tier: 'LITE',
                intent: 'Website Summary',
                prompt,
            });

            return { summary, success: true }
        }
        else if (type === 'image' || type === 'file') {
            if (!mimeType) throw new Error("MIME type required");

            const base64Data = content.includes('base64,') ? content.split('base64,')[1] : content
            const prompt = type === 'image'
                ? "Analyze this image. Summarize its contents and readable text."
                : "Analyze this document. Summarize its key contents and highlight best points."

            const summary = await aiOrchestrator.generate({
                userId: user.id,
                tier: 'LITE',
                intent: 'Media Summary',
                prompt,
                media: [{ mimeType, data: base64Data }]
            });

            return { summary, success: true }
        }

        throw new Error("Invalid resource type")
    } catch (error: any) {
        console.error('Error in summarizeResource:', error);
        throw new Error(error.message || 'Failed to summarize resource');
    }
}
