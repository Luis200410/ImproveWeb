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

        // Default empty structure 
        const defaultChart = [
            { month: 'Jan', income: 0, expense: 0 },
            { month: 'Feb', income: 0, expense: 0 },
            { month: 'Mar', income: 0, expense: 0 },
            { month: 'Apr', income: 0, expense: 0 },
            { month: 'May', income: 0, expense: 0 },
            { month: 'Jun', income: 0, expense: 0 },
            { month: 'Jul', income: 0, expense: 0 },
            { month: 'Aug', income: 0, expense: 0 },
            { month: 'Sep', income: 0, expense: 0 },
            { month: 'Oct', income: 0, expense: 0 },
            { month: 'Nov', income: 0, expense: 0 },
            { month: 'Dec', income: 0, expense: 0 },
        ];

        if (!items || items.length === 0) {
            return NextResponse.json({ chartData: defaultChart, status: "no_accounts" });
        }

        let allTransactions: any[] = [];

        // Date math: Only fetch last month and current month
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startDateStr = lastMonth.toISOString().split('T')[0];
        const endDateStr = now.toISOString().split('T')[0];

        const fetchPromises = items.map(async (item) => {
            try {
                // Plaid /transactions/get
                const txResponse = await plaidClient.transactionsGet({
                    access_token: item.access_token,
                    start_date: startDateStr,
                    end_date: endDateStr,
                    options: { count: 500 } // up to 500 txs per item for YTD cashflow should be reasonable for summary
                });
                return txResponse.data.transactions;
            } catch (err) {
                console.error("Error fetching Plaid transactions for cashflow:", err);
                return [];
            }
        });

        const txResults = await Promise.all(fetchPromises);
        for (const txs of txResults) {
            allTransactions = [...allTransactions, ...txs];
        }

        // Aggregate into Month Buckets
        const monthlyData: Record<string, { income: number, expense: number }> = {};

        // initialize for all months up to current month so standard 12 months array works
        allTransactions.forEach(tx => {
            // Plaid format: YYYY-MM-DD
            const monthStr = tx.date.substring(5, 7); // '01', '02', etc
            const monthInt = parseInt(monthStr, 10);

            if (!monthlyData[monthInt]) {
                monthlyData[monthInt] = { income: 0, expense: 0 };
            }

            const amount = tx.amount;
            if (amount < 0) {
                // Income: Plaid represents incoming funds as negative
                // Ignore transfers for accurate income if desirable, but simple negative sum for now
                if (tx.personal_finance_category?.primary !== 'TRANSFER_IN') {
                    monthlyData[monthInt].income += Math.abs(amount);
                }
            } else if (amount > 0) {
                // Expense
                if (tx.personal_finance_category?.primary !== 'TRANSFER_OUT' &&
                    tx.personal_finance_category?.primary !== 'LOAN_PAYMENTS') {
                    monthlyData[monthInt].expense += amount;
                }
            }
        });

        // Map to standard layout
        const chartData = defaultChart.map((m, i) => {
            const monthIndex = i + 1; // 1-12
            if (monthlyData[monthIndex]) {
                return {
                    month: m.month,
                    income: monthlyData[monthIndex].income,
                    expense: monthlyData[monthIndex].expense
                };
            }
            return m;
        });

        // Discard raw transactions from RAM
        allTransactions.length = 0;

        const responseData = {
            chartData,
            status: "success"
        };

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error("Cashflow Data Error:", error);
        return NextResponse.json({ error: "Failed to compile cashflow data" }, { status: 500 });
    }
}
