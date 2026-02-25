'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

export async function summarizeResource(
    type: 'website' | 'image' | 'file',
    content: string, // URL or base64 string
    mimeType?: string
): Promise<{ summary: string; success: boolean }> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables')
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

        if (type === 'website') {
            // Fetch URL content
            const res = await fetch(content, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            })

            if (!res.ok) {
                throw new Error(`Failed to fetch website: ${res.status} ${res.statusText}`)
            }

            const html = await res.text()

            // Basic HTML strip to get readable text
            const textContent = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()

            // Summarize prompt
            const prompt = `You are a helpful research assistant. Summarize the following website content comprehensively. Extract the main ideas and highlight the BEST points or takeaways from the resource. Keep it structured and easy to read.\n\nWebsite Content Limit Reached:\n${textContent.slice(0, 50000)}`

            const result = await model.generateContent(prompt)
            return { summary: result.response.text(), success: true }
        }
        else if (type === 'image' || type === 'file') {
            if (!mimeType) {
                throw new Error("MIME type is required for files and images")
            }

            // Remove base64 data URI prefix if it exists (e.g. data:image/png;base64,xxxx)
            const base64Data = content.includes('base64,')
                ? content.split('base64,')[1]
                : content

            const prompt = type === 'image'
                ? "You are a helpful assistant. Analyze this image carefully. Summarize its contents, any readable text, and highlight the most important visual information or takeaways."
                : "You are a helpful research assistant. Analyze this document. Summarize its key contents and highlight the BEST points, main arguments, or most important takeaways."

            const result = await model.generateContent([
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                },
                prompt
            ])

            return { summary: result.response.text(), success: true }
        }

        throw new Error("Invalid resource type")
    } catch (error: any) {
        console.error('Error in summarizeResource:', error)
        throw new Error(error.message || 'Failed to summarize resource')
    }
}
