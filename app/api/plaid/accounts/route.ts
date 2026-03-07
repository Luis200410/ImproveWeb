import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/utils/supabase/server";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
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

        // 2. Map items to fetch promises and run in parallel
        const fetchPromises = items.map(async (item) => {
            const accessToken = item.access_token;
            let itemAccounts: any[] = [];
            let itemHoldings: any[] = [];
            let itemSecurities: any[] = [];

            // Fetch Accounts & Balances
            const balancePromise = plaidClient.accountsBalanceGet({ access_token: accessToken })
                .then(res => { itemAccounts = res.data.accounts; })
                .catch((err: any) => console.error("Error fetching balance:", err.response?.data || err.message));

            // Fetch Investments (if supported by this item)
            const investmentPromise = plaidClient.investmentsHoldingsGet({ access_token: accessToken })
                .then(res => {
                    itemHoldings = res.data.holdings;
                    itemSecurities = res.data.securities;
                })
                .catch((err: any) => {
                    if (err.response?.data?.error_code !== "INVALID_PRODUCT") {
                        console.error("Error fetching investments:", err.response?.data || err.message);
                    }
                });

            await Promise.all([balancePromise, investmentPromise]);

            return { itemAccounts, itemHoldings, itemSecurities };
        });

        const results = await Promise.all(fetchPromises);

        for (const result of results) {
            allAccounts = [...allAccounts, ...result.itemAccounts];
            allHoldings = [...allHoldings, ...result.itemHoldings];
            allSecurities = [...allSecurities, ...result.itemSecurities];
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
        const responseData = {
            accounts: allAccounts,
            holdings: formattedHoldings
        };

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error("Error fetching user accounts:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }
}
