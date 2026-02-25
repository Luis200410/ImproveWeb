import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = messages[messages.length - 1].content;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return new NextResponse(responseText, {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error generating AI response:', error);
        return NextResponse.json({ error: error.message || 'Error generating AI response' }, { status: 500 });
    }
}
