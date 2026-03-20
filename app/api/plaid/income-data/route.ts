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
            return NextResponse.json({ deposits: [], classified: [] });
        }

        let allTransactions: any[] = [];

        // Date math for 60 days
        const now = new Date();
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(now.getDate() - 60);
        const startDateStr = sixtyDaysAgo.toISOString().split('T')[0];
        const endDateStr = now.toISOString().split('T')[0];

        const fetchPromises = items.map(async (item) => {
            try {
                const txResponse = await plaidClient.transactionsGet({
                    access_token: item.access_token,
                    start_date: startDateStr,
                    end_date: endDateStr,
                    options: { count: 500 }
                });
                return txResponse.data.transactions;
            } catch (err) {
                console.error("Error fetching Plaid transactions for income:", err);
                return [];
            }
        });

        const txResults = await Promise.all(fetchPromises);
        for (const txs of txResults) {
            allTransactions = [...allTransactions, ...txs];
        }

        // Filter for potential income (amount < 0)
        // In Plaid, credit is negative.
        const incomeTransactions = allTransactions.filter(tx => tx.amount < 0);

        // Sort by date descending
        incomeTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Map to our UI format
        const deposits = incomeTransactions.map(tx => ({
            id: tx.transaction_id,
            description: tx.name,
            amount: Math.abs(tx.amount),
            date: new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            suggestedRecurrence: tx.personal_finance_category?.primary === 'INCOME' ? 'Every month' : 'One-time only',
            suggestedConfidence: 'CERTAIN'
        }));

        // For now, let's say "Classified" are those Plaid already tagged as INCOME
        const classified = deposits.filter(d => d.suggestedRecurrence === 'Every month');
        const unclassified = deposits.filter(d => d.suggestedRecurrence !== 'Every month');

        return NextResponse.json({ 
            deposits: unclassified, 
            classified: classified 
        });

    } catch (error: any) {
        console.error("Income Data Error:", error);
        return NextResponse.json({ error: "Failed to fetch income data" }, { status: 500 });
    }
}
