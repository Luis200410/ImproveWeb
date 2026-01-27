-- Review Sessions Table
CREATE TABLE IF NOT EXISTS review_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('weekly', 'monthly', 'yearly')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    insights_json JSONB,
    action_items TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_sessions_user_id ON review_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_sessions_period ON review_sessions(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_review_sessions_type ON review_sessions(review_type);
CREATE INDEX IF NOT EXISTS idx_review_sessions_completed ON review_sessions(completed_at);

-- Row Level Security
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own reviews
CREATE POLICY review_sessions_select_policy ON review_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own reviews
CREATE POLICY review_sessions_insert_policy ON review_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reviews
CREATE POLICY review_sessions_update_policy ON review_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY review_sessions_delete_policy ON review_sessions
    FOR DELETE
    USING (auth.uid() = user_id);
