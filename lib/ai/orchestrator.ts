import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { SupabaseClient } from '@supabase/supabase-js';

// --- Configuration & Types ---

export type AITier = 'PRO' | 'FLASH' | 'LITE';

export interface AIStrategy {
    model: string;
    maxTokens: number;
    dailyLimit: number;
    weeklyLimit?: number;
    baseCostPer1M: number; // Approximate cost for circuit breaker (USD)
}

const STRATEGIES: Record<AITier, AIStrategy> = {
    PRO: {
        model: 'gemini-1.5-pro',
        maxTokens: 4096,
        dailyLimit: 3, // Very tight for PRO
        weeklyLimit: 1, // As per PRD: 1 execution per week
        baseCostPer1M: 3.50,
    },
    FLASH: {
        model: 'gemini-2.0-flash',
        maxTokens: 2048,
        dailyLimit: 50, // As per PRD
        baseCostPer1M: 0.10,
    },
    LITE: {
        model: 'gemini-1.5-flash-8b', // Using flash-8b as lite equivalent
        maxTokens: 1024,
        dailyLimit: 200, // As per PRD
        baseCostPer1M: 0.03,
    }
};

const GLOBAL_DAILY_BUDGET = 5.00; // Circuit breaker threshold (USD)

// --- Sanitization & Guards ---

const INJECTION_PATTERNS = [
    /ignore previous instructions/i,
    /system prompt/i,
    /forget everything/i,
    /write code for/i, // Basic fitness guard
    /hacker/i
];

function sanitizePrompt(prompt: string): string {
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(prompt)) {
            throw new Error(`Security Guard: Potential prompt injection detected. Request aborted.`);
        }
    }
    // Simple length limit to prevent token-draining attacks
    if (prompt.length > 5000) {
        throw new Error(`Security Guard: Content too long.`);
    }
    return prompt;
}

// --- Orchestrator Class ---

export class AIOrchestrator {
    private genAI: GoogleGenerativeAI;

    constructor() {
        if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set.');
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    private async checkBudgetAndLimits(supabase: SupabaseClient, userId: string, tier: AITier): Promise<AITier> {
        let currentTier = tier;

        try {
            // 1. Global Circuit Breaker Check
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const { data: globalUsage, error: globalError } = await supabase
                .from('ai_usage_logs')
                .select('cost_estimate')
                .gte('created_at', todayStart.toISOString());

            if (!globalError && globalUsage) {
                const totalSpentToday = globalUsage.reduce((sum, log) => sum + (log.cost_estimate || 0), 0);
                if (totalSpentToday > GLOBAL_DAILY_BUDGET) {
                    console.warn(`[AI ORCHESTRATOR] Global budget exceeded ($${totalSpentToday.toFixed(2)}). Downgrading to LITE.`);
                    currentTier = 'LITE';
                }
            }

            // 2. User/Tier Specific Limit Check
            const strategy = STRATEGIES[currentTier];
            const dateLimit = new Date();
            dateLimit.setHours(0, 0, 0, 0);

            const { count: dailyCount, error: dailyError } = await supabase
                .from('ai_usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('tier', currentTier)
                .gte('created_at', dateLimit.toISOString());

            if (!dailyError && dailyCount !== null && dailyCount >= strategy.dailyLimit) {
                if (currentTier === 'LITE') {
                    throw new Error(`Daily limit exceeded for ${currentTier} requests. Please wait until tomorrow.`);
                }
                console.warn(`[AI ORCHESTRATOR] User daily limit for ${currentTier} hit. Downgrading...`);
                return this.checkBudgetAndLimits(supabase, userId, currentTier === 'PRO' ? 'FLASH' : 'LITE');
            }

            // 3. Weekly Limit Check (Mostly for PRO)
            if (strategy.weeklyLimit) {
                const weekLimitDate = new Date();
                weekLimitDate.setDate(weekLimitDate.getDate() - 7);

                const { count: weeklyCount, error: weeklyError } = await supabase
                    .from('ai_usage_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('tier', currentTier)
                    .gte('created_at', weekLimitDate.toISOString());

                if (!weeklyError && weeklyCount !== null && weeklyCount >= strategy.weeklyLimit) {
                    console.warn(`[AI ORCHESTRATOR] Weekly limit for ${currentTier} hit. Downgrading...`);
                    return this.checkBudgetAndLimits(supabase, userId, 'FLASH');
                }
            }
        } catch (e: any) {
            // If the error is our own limit error, re-throw it
            if (e.message?.includes('Daily limit exceeded')) throw e;
            console.error(`[AI ORCHESTRATOR] Orchestration check failed, proceeding with original tier:`, e.message);
            // Fallback: proceed with requested tier if check fails
        }

        return currentTier;
    }

    private async logUsage(supabase: SupabaseClient, userId: string, tier: AITier, model: string, intent: string, tokens: number) {
        try {
            const strategy = STRATEGIES[tier];
            const cost = (tokens / 1_000_000) * strategy.baseCostPer1M;

            const { error } = await supabase.from('ai_usage_logs').insert({
                user_id: userId,
                tier,
                model_name: model,
                intent,
                cost_estimate: cost || 0,
            });

            if (error) console.error(`[AI ORCHESTRATOR] Resource log failed:`, error.message);
        } catch (e) {
            console.error(`[AI ORCHESTRATOR] Log error:`, e);
        }
    }

    async generate(params: {
        userId: string;
        tier: AITier;
        intent: string;
        prompt: string;
        media?: { mimeType: string; data: string }[];
        jsonResponse?: boolean;
        supabase: SupabaseClient; // Accept authenticated client from route
    }) {
        // 0. Sanitize
        const cleanPrompt = sanitizePrompt(params.prompt);

        // 1. Routing & Guardrails (using authenticated client passed from route)
        const finalTier = await this.checkBudgetAndLimits(params.supabase, params.userId, params.tier);
        const strategy = STRATEGIES[finalTier];
        const model = this.genAI.getGenerativeModel({
            model: strategy.model,
            generationConfig: params.jsonResponse ? { responseMimeType: "application/json" } : {}
        });

        // 2. Execute
        const parts: (string | Part)[] = [cleanPrompt];
        if (params.media) {
            params.media.forEach(m => parts.push({ inlineData: m }));
        }

        const result = await model.generateContent(parts);
        const text = result.response.text();

        // 3. Clean & Purge (Privacy First)
        const cleanedOutput = text.trim();

        // 4. Usage Logging (using the same authenticated client)
        const estTokens = (cleanPrompt.length + cleanedOutput.length) / 4 * 1.3;
        await this.logUsage(params.supabase, params.userId, finalTier, strategy.model, params.intent, estTokens);

        return cleanedOutput;
    }
}

export const aiOrchestrator = new AIOrchestrator();
