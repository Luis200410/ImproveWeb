import { NextResponse } from 'next/server';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import { createClient } from '@/utils/supabase/server';

const BASKETBALL_SHOPPING_LIST = [
    'grilled chicken', 'turkey', 'salmon', 'tuna', 'eggs', 'greek yogurt', 'cottage cheese',
    'sweet potato', 'brown rice', 'oats', 'quinoa', 'white rice',
    'broccoli', 'spinach', 'kale', 'avocado', 'berries',
    'olive oil', 'nuts', 'seeds', 'banana', 'apple', 'whey protein'
]

function calcFuelGrade(items: any[], totalCalories: number, totalProtein: number): number {
    if (!items.length) return 0
    const itemNames = items.map((i: any) => (i.name || '').toLowerCase())
    const matchCount = itemNames.filter((name: string) =>
        BASKETBALL_SHOPPING_LIST.some(bl => name.includes(bl) || bl.includes(name))
    ).length
    const matchRatio = matchCount / items.length
    const proteinPerCal = totalCalories > 0 ? (totalProtein * 4) / totalCalories : 0

    let score = 5
    score += matchRatio * 3          // up to +3 for quality items
    score += Math.min(proteinPerCal * 4, 2) // up to +2 for protein density

    return Math.min(10, Math.max(1, Math.round(score * 10) / 10))
}

/**
 * POST /api/ai/macro-scan
 * 
 * Tier 2: High-Performance Vision (Gemini Flash)
 * Limit: 50 scans per day.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { imageBase64, mimeType = 'image/jpeg' } = body

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
        }

        // 1. Authenticate
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // 2. Orchestrate with Flash Tier
        const prompt = `You are a precision nutrition AI. Analyze this food image and return ONLY valid JSON.

NAMING RULES (most important):
- Use the SHORTEST possible common food name: 1-3 words max.
- Examples: "Kimchi", "Beef Patty", "Burger Bun", "White Rice", "Avocado", "Bacon Strip", "Cheddar Cheese", "Broccoli"
- DO NOT include cooking method adjectives in the name (no "Grilled", "Toasted", "Crispy", "Melted", "Shredded").
- DO NOT add brand names, percentages, or parenthetical details like "(80/20)" in the name.

ANALYSIS RULES:
- Identify each individual food component separately.
- Use reference scaling: estimate weight by comparing food to visible plate/utensil/hand size in the image.
- If no food is detected, return an empty items array.

Return this exact JSON structure:
{
  "items": [
    {
      "name": "Short Food Name",
      "weight_g": 150,
      "calories": 165,
      "protein_g": 31,
      "carbs_g": 0,
      "fat_g": 3.6,
      "confidence": 0.9
    }
  ],
  "total_calories": 165,
  "total_protein_g": 31,
  "total_carbs_g": 0,
  "total_fat_g": 3.6,
  "summary": "One-line meal label",
  "portion_reference": "Reference object used for scaling"
}`

        const responseText = await aiOrchestrator.generate({
            userId: user.id,
            tier: 'FLASH',
            intent: 'Macro Scan',
            prompt,
            media: [{ mimeType, data: imageBase64 }],
            jsonResponse: true
        });

        let parsed: any
        try {
            // Helper to clean potential markdown backticks or extra text
            const extractJson = (str: string) => {
                const match = str.match(/\{[\s\S]*\}/);
                return match ? match[0] : str;
            }
            parsed = JSON.parse(extractJson(responseText))
        } catch (jsonErr) {
            console.error('[macro-scan] JSON Parse Error:', jsonErr)
            console.error('[macro-scan] Raw Response:', responseText)
            return NextResponse.json({
                error: 'AI returned invalid data format',
                details: 'Please try scanning again with a clearer view of the food.'
            }, { status: 422 })
        }

        // Ensure required fields
        const items = Array.isArray(parsed.items) ? parsed.items : []
        const totalCalories = parsed.total_calories || items.reduce((s: number, i: any) => s + (i.calories || 0), 0)
        const totalProtein = parsed.total_protein_g || items.reduce((s: number, i: any) => s + (i.protein_g || 0), 0)
        const totalCarbs = parsed.total_carbs_g || items.reduce((s: number, i: any) => s + (i.carbs_g || 0), 0)
        const totalFat = parsed.total_fat_g || items.reduce((s: number, i: any) => s + (i.fat_g || 0), 0)

        const fuelGrade = calcFuelGrade(items, totalCalories, totalProtein)

        return NextResponse.json({
            items,
            total_calories: totalCalories,
            total_protein_g: totalProtein,
            total_carbs_g: totalCarbs,
            total_fat_g: totalFat,
            fuel_grade: fuelGrade,
            summary: parsed.summary || 'Scanned Meal',
            portion_reference: parsed.portion_reference || 'visual estimation'
        })
    } catch (err: any) {
        console.error('[macro-scan] Global error:', err)
        if (err.message?.includes('Daily limit exceeded')) {
            return NextResponse.json({ error: err.message }, { status: 429 })
        }
        return NextResponse.json({ error: err.message || 'Vision analysis failed' }, { status: 500 })
    }
}
