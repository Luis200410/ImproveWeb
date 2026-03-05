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

        // 1. Get all access tokens for this user
        const { data: items, error } = await supabase
            .from('plaid_items')
            .select('access_token')
            .eq('user_id', userId);

        if (error) throw error;
        if (!items || items.length === 0) {
            return NextResponse.json({
                accounts: [],
                holdings: []
            });
        }

        let allAccounts: any[] = [];
        let allHoldings: any[] = [];
        let allSecurities: any[] = [];

        // 2. Loop through items to fetch balances and potentially investments
        for (const item of items) {
            const accessToken = item.access_token;

            // Fetch Accounts & Balances
            try {
                const balanceResponse = await plaidClient.accountsBalanceGet({
                    access_token: accessToken,
                });

                // Keep track of institutional source if needed, but for now just accounts
                allAccounts = [...allAccounts, ...balanceResponse.data.accounts];
            } catch (err: any) {
                console.error("Error fetching balance:", err.response?.data || err.message);
            }

            // Fetch Investments (if supported by this item)
            try {
                const investmentResponse = await plaidClient.investmentsHoldingsGet({
                    access_token: accessToken,
                });
                allHoldings = [...allHoldings, ...investmentResponse.data.holdings];
                allSecurities = [...allSecurities, ...investmentResponse.data.securities];
            } catch (err: any) {
                // Not all items will have investments, so ignore this error
                if (err.response?.data?.error_code !== "INVALID_PRODUCT") {
                    console.error("Error fetching investments:", err.response?.data || err.message);
                }
            }
        }

        // 3. Format Investments by attaching security info to holdings
        const formattedHoldings = allHoldings.map(holding => {
            const security = allSecurities.find(s => s.security_id === holding.security_id);
            return {
                ...holding,
                ticker_symbol: security?.ticker_symbol || "Unknown",
                name: security?.name || "Unknown Asset",
                type: security?.type || "cash",
            };
        });

        // 4. Return aggregated data
        return NextResponse.json({
            accounts: allAccounts,
            holdings: formattedHoldings
        });

    } catch (error: any) {
        console.error("Error fetching user accounts:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }
}
