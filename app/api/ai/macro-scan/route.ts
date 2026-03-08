import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

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

export async function POST(req: Request) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15-second session limit

    try {
        const body = await req.json()
        const { imageBase64, mimeType = 'image/jpeg' } = body

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `You are a precision nutrition AI. Analyze this food image and return ONLY valid JSON.

NAMING RULES (most important):
- Use the SHORTEST possible common food name: 1-3 words max.
- Examples: "Kimchi", "Beef Patty", "Burger Bun", "White Rice", "Avocado", "Bacon Strip", "Cheddar Cheese", "Broccoli"
- DO NOT include cooking method adjectives in the name (no "Grilled", "Toasted", "Crispy", "Melted", "Shredded").
- DO NOT add brand names, percentages, or parenthetical details like "(80/20)" in the name.
- Think of the name as what you would write on a grocery list.

ANALYSIS RULES:
- Identify each individual food component separately.
- Use reference scaling: estimate weight by comparing food to visible plate/utensil/hand size in the image.
- If no food is detected, return an empty items array.
- Use cooking method knowledge internally to calculate accurate calories, but keep it OUT of the name.

Return this exact JSON structure with NO markdown or code fences:
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
  "summary": "One-line meal label, e.g. Burger, Kimchi Bowl, Grilled Chicken Plate",
  "portion_reference": "Reference object used for scaling (e.g. dinner plate, fork, hand)"
}`

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: imageBase64
                }
            }
        ])

        clearTimeout(timeout)
        const text = result.response.text().trim()

        // Strip markdown fences if model wraps output
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

        let parsed: any
        try {
            parsed = JSON.parse(cleaned)
        } catch {
            return NextResponse.json({ error: 'AI returned unparseable response', raw: text }, { status: 422 })
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
        clearTimeout(timeout)
        if (err.name === 'AbortError') {
            return NextResponse.json({ error: 'Analysis timed out (15s limit). Please try again.' }, { status: 408 })
        }
        console.error('[macro-scan] error:', err)
        return NextResponse.json({ error: err.message || 'Vision analysis failed' }, { status: 500 })
    }
}
