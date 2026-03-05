import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Get access tokens
        const { data: items, error } = await supabase
            .from('plaid_items')
            .select('access_token')
            .eq('user_id', userId);

        if (error) throw error;
        if (!items || items.length === 0) {
            return NextResponse.json({
                buckets: null,
                burnRate: [],
                remainingFixedBills: 0,
                safeToSpend: 0,
                status: "no_accounts"
            });
        }

        let allTransactions: any[] = [];
        let allBalances = 0;
        let upcomingBillsTotal = 0;

        // Date math for 6 month historical window
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        const startDateStr = sixMonthsAgo.toISOString().split('T')[0];
        const endDateStr = now.toISOString().split('T')[0];

        for (const item of items) {
            const accessToken = item.access_token;

            // Get balances for Safe-to-Spend
            try {
                const balanceResponse = await plaidClient.accountsBalanceGet({ access_token: accessToken });
                const accounts = balanceResponse.data.accounts;
                allBalances += accounts.reduce((acc, a) => {
                    // Only sum depository accounts for spending cash
                    if (a.type === 'depository' && a.balances.available !== null) {
                        return acc + a.balances.available;
                    }
                    return acc;
                }, 0);
            } catch (err) {
                console.error("Error fetching balance:", err);
            }

            // Get Recurring Transactions (Fixed bills)
            try {
                const recurringRes = await plaidClient.transactionsRecurringGet({ access_token: accessToken });
                const streams = recurringRes.data.outflow_streams;
                // Sum active streams that are billed monthly to find remaining bills
                streams.forEach(stream => {
                    if (stream.status === 'MATURE' && stream.frequency === 'MONTHLY') {
                        // Simply add the average amount
                        upcomingBillsTotal += Math.abs(stream.average_amount?.amount || 0);
                    }
                });
            } catch (err) {
                console.error("Error fetching recurring:", err);
            }

            // RAM-Only extraction: Fetch historical transactions via /transactions/get
            // PRD specifies 730 days initially, but 6-month (180 days) for Budget Planner "Target" heuristic.
            try {
                const txResponse = await plaidClient.transactionsGet({
                    access_token: accessToken,
                    start_date: startDateStr,
                    end_date: endDateStr,
                    options: { count: 500 } // Get up to 500 recent transactions for bucketing
                });

                allTransactions = [...allTransactions, ...txResponse.data.transactions];
            } catch (err) {
                console.error("Error fetching transactions:", err);
            }
        }

        // --- ZERO-KNOWLEDGE RAM PROCESSING ---

        let buckets = {
            fixed: 0,
            goals: 0,
            flexible: 0
        };

        const currentMonthId = now.toISOString().substring(0, 7); // YYYY-MM
        const burnRateMap: Record<string, number> = {};

        // Bucketing Heuristic
        allTransactions.forEach(tx => {
            const amount = tx.amount;
            // Ignore income
            if (amount <= 0) return;

            const categoryPrimary = tx.personal_finance_category?.primary || '';
            const txDate = tx.date; // YYYY-MM-DD
            const txMonth = txDate.substring(0, 7);

            // Determine bucket
            let bucketName = 'flexible';
            if (['RENT_AND_UTILITIES', 'LOAN_PAYMENTS', 'BANK_FEES'].includes(categoryPrimary)) {
                bucketName = 'fixed';
            } else if (categoryPrimary === 'TRANSFER_OUT' || tx.name?.toLowerCase().includes('robinhood') || tx.name?.toLowerCase().includes('savings')) {
                bucketName = 'goals';
            }

            buckets[bucketName as keyof typeof buckets] += amount;

            // Burn Rate Tracking for CURRENT MONTH only
            if (txMonth === currentMonthId && bucketName === 'flexible') {
                const day = parseInt(txDate.split('-')[2]);
                burnRateMap[day] = (burnRateMap[day] || 0) + amount;
            }
        });

        // Average out the 6 month buckets to get a "Target Baseline"
        buckets.fixed = buckets.fixed / 6;
        buckets.goals = buckets.goals / 6;
        buckets.flexible = buckets.flexible / 6;

        // Build Cumulative Burn Rate Chart Data
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        let cumulative = 0;
        const burnRateChart = [];

        // Target pace per day based on historical flexible bucket
        const dailyTargetPace = buckets.flexible / daysInMonth;
        let cumulativeTarget = 0;

        for (let i = 1; i <= daysInMonth; i++) {
            if (burnRateMap[i]) {
                cumulative += burnRateMap[i];
            }
            cumulativeTarget += dailyTargetPace;

            // Only plot actual cumulative up to "today", but target for whole month
            if (i <= now.getDate()) {
                burnRateChart.push({
                    day: i.toString(),
                    actual: cumulative,
                    target: cumulativeTarget
                });
            } else {
                burnRateChart.push({
                    day: i.toString(),
                    actual: null,
                    target: cumulativeTarget
                });
            }
        }

        // Safe To Spend Calculation (from PRD)
        const safeToSpend = allBalances - (upcomingBillsTotal + buckets.goals);

        // Discard all raw transaction objects from RAM
        allTransactions.length = 0;

        return NextResponse.json({
            buckets,
            burnRate: burnRateChart,
            safeToSpend: Math.max(0, safeToSpend),
            remainingFixedBills: upcomingBillsTotal,
            totalBalances: allBalances,
            status: "success"
        });

    } catch (error: any) {
        console.error("Budget Data Error:", error);
        return NextResponse.json({ error: "Failed to compile zero-knowledge budget" }, { status: 500 });
    }
}
