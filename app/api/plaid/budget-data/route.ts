import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/utils/supabase/server";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');
        const forceRefresh = url.searchParams.get('refresh') === 'true';

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

        // Date math for 1 month historical window (Current and Last Month)
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startDateStr = oneMonthAgo.toISOString().split('T')[0];
        const endDateStr = now.toISOString().split('T')[0];

        const fetchPromises = items.map(async (item) => {
            const accessToken = item.access_token;
            let itemBalances = 0;
            let itemUpcomingBills = 0;
            let itemTransactions: any[] = [];

            // Get balances
            const balancePromise = plaidClient.accountsBalanceGet({ access_token: accessToken })
                .then(res => {
                    itemBalances = res.data.accounts.reduce((acc, a) => {
                        if (a.type === 'depository' && a.balances.available !== null) {
                            return acc + a.balances.available;
                        }
                        return acc;
                    }, 0);
                }).catch(err => console.error("Error fetching balance:", err));

            // Get Recurring Transactions
            const recurringPromise = plaidClient.transactionsRecurringGet({ access_token: accessToken })
                .then(res => {
                    res.data.outflow_streams.forEach(stream => {
                        if (stream.status === 'MATURE' && stream.frequency === 'MONTHLY') {
                            itemUpcomingBills += Math.abs(stream.average_amount?.amount || 0);
                        }
                    });
                }).catch(err => console.error("Error fetching recurring:", err));

            // Get Historical Transactions (180 days)
            const transactionsPromise = plaidClient.transactionsGet({
                access_token: accessToken,
                start_date: startDateStr,
                end_date: endDateStr,
                options: { count: 500 }
            }).then(res => {
                itemTransactions = res.data.transactions;
            }).catch(err => console.error("Error fetching transactions:", err));

            await Promise.all([balancePromise, recurringPromise, transactionsPromise]);

            return { itemBalances, itemUpcomingBills, itemTransactions };
        });

        const results = await Promise.all(fetchPromises);
        let totalIncome = 0;

        for (const res of results) {
            allBalances += res.itemBalances;
            upcomingBillsTotal += res.itemUpcomingBills;
            allTransactions = [...allTransactions, ...res.itemTransactions];
        }

        // --- ZERO-KNOWLEDGE RAM PROCESSING ---

        let buckets = {
            fixed: 0,
            goals: 0,
            flexible: 0
        };

        const currentMonthId = now.toISOString().substring(0, 7); // YYYY-MM
        const lastMonthId = oneMonthAgo.toISOString().substring(0, 7);
        const burnRateMap: Record<string, number> = {};

        // Bucketing Heuristic
        allTransactions.forEach(tx => {
            const amount = tx.amount;
            const categoryPrimary = tx.personal_finance_category?.primary || '';
            const txDate = tx.date; // YYYY-MM-DD
            const txMonth = txDate.substring(0, 7);

            // Income Detection (Plaid treats incoming money as negative)
            if (amount < 0 && categoryPrimary !== 'TRANSFER_IN') {
                if (txMonth === currentMonthId || txMonth === lastMonthId) {
                    totalIncome += Math.abs(amount);
                }
            }

            // Ignore income for expense buckets
            if (amount <= 0) return;

            // We only process current month for expenses
            if (txMonth !== currentMonthId) return;

            // Determine bucket
            let bucketName = 'flexible';
            if (['RENT_AND_UTILITIES', 'LOAN_PAYMENTS', 'BANK_FEES'].includes(categoryPrimary)) {
                bucketName = 'fixed';
            } else if (categoryPrimary === 'TRANSFER_OUT' || tx.name?.toLowerCase().includes('robinhood') || tx.name?.toLowerCase().includes('savings')) {
                bucketName = 'goals';
            }

            buckets[bucketName as keyof typeof buckets] += amount;

            // Burn Rate Tracking for CURRENT MONTH only
            if (bucketName === 'flexible') {
                const day = parseInt(txDate.split('-')[2]);
                burnRateMap[day] = (burnRateMap[day] || 0) + amount;
            }
        });

        const averageIncome = totalIncome / 2;

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

        const responseData = {
            buckets,
            averageIncome,
            burnRate: burnRateChart,
            safeToSpend: Math.max(0, safeToSpend),
            remainingFixedBills: upcomingBillsTotal,
            totalBalances: allBalances,
            status: "success"
        };

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error("Budget Data Error:", error);
        return NextResponse.json({ error: "Failed to compile zero-knowledge budget" }, { status: 500 });
    }
}
