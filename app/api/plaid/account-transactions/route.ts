import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');
        const accountId = url.searchParams.get('accountId');

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
        for (const item of items) {
            const accessToken = item.access_token;

            try {
                const txResponse = await plaidClient.transactionsGet({
                    access_token: accessToken,
                    start_date: startDateStr,
                    end_date: endDateStr,
                    options: {
                        account_ids: [accountId],
                        count: 50 // Limit to 50 latest 
                    }
                });

                accountTransactions = [...accountTransactions, ...txResponse.data.transactions];
                break; // If we successfully got transactions for this account ID, we can stop searching other items
            } catch (err: any) {
                // If the account doesn't belong to this item, Plaid will throw an INVALID_ACCOUNT_ID error, which we ignore
                if (err.response?.data?.error_code !== "INVALID_ACCOUNT_ID") {
                    console.error("Error fetching transactions:", err.response?.data || err.message);
                }
            }
        }

        // Sort by date descending
        accountTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
            transactions: accountTransactions
        });

    } catch (error: any) {
        console.error("Account Transactions GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch account transactions" }, { status: 500 });
    }
}
