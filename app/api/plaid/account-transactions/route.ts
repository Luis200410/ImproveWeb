import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/utils/supabase/server";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');
        const accountId = url.searchParams.get('accountId');
        const forceRefresh = url.searchParams.get('refresh') === 'true';

        if (!userId || !accountId) {
            return NextResponse.json({ error: "Missing userId or accountId" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Get all access tokens for this user
        const { data: items, error } = await supabase
            .from('plaid_items')
            .select('access_token')
            .eq('user_id', userId);

        if (error) throw error;
        if (!items || items.length === 0) {
            return NextResponse.json({ transactions: [] });
        }

        let accountTransactions: any[] = [];

        const now = new Date();
        const start = new Date();
        start.setMonth(now.getMonth() - 3); // latest 3 months should be fine for sidebar

        const startDateStr = start.toISOString().split('T')[0];
        const endDateStr = now.toISOString().split('T')[0];

        // 2. Loop through items to fetch transactions. Only the item possessing the accountId will succeed.
        const fetchPromises = items.map(async (item) => {
            try {
                const txResponse = await plaidClient.transactionsGet({
                    access_token: item.access_token,
                    start_date: startDateStr,
                    end_date: endDateStr,
                    options: {
                        account_ids: [accountId],
                        count: 50 // Limit to 50 latest 
                    }
                });
                return txResponse.data.transactions;
            } catch (err: any) {
                // If the account doesn't belong to this item, Plaid will throw an INVALID_ACCOUNT_ID error, which we ignore
                if (err.response?.data?.error_code !== "INVALID_ACCOUNT_ID") {
                    console.error("Error fetching transactions:", err.response?.data || err.message);
                }
                return [];
            }
        });
        const txResults = await Promise.all(fetchPromises);
        for (const txs of txResults) {
            accountTransactions = [...accountTransactions, ...txs];
        }

        // Sort by date descending
        accountTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const responseData = {
            transactions: accountTransactions
        };

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error("Account Transactions GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch account transactions" }, { status: 500 });
    }
}
