-- Migration: Create ai_usage_logs table for Intelligence Orchestration
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('PRO', 'FLASH', 'LITE')),
    model_name TEXT NOT NULL,
    intent TEXT NOT NULL,
    cost_estimate NUMERIC(10, 6) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own AI logs" ON ai_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Note: No policy for insert/update because the server-side AIOrchestrator 
-- with its service-level key (or service-role) would handle it, or we can add a specific insert policy
-- for the anon/authenticated role if needed, but orchestrator is usually server-side.
