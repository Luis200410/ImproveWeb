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
            return NextResponse.json({ subscriptions: [] });
        }

        let allRecurring: any[] = [];

        const fetchPromises = items.map(async (item) => {
            try {
                // Plaid /recurring_transactions/get
                const recurringResponse = await plaidClient.transactionsRecurringGet({
                    access_token: item.access_token,
                });
                return recurringResponse.data.outflow_streams;
            } catch (err) {
                console.error("Error fetching Plaid recurring transactions:", err);
                return [];
            }
        });

        const recurringResults = await Promise.all(fetchPromises);
        for (const streams of recurringResults) {
            allRecurring = [...allRecurring, ...streams];
        }

        // Map to our UI format
        const subscriptions = allRecurring.map(stream => ({
            id: stream.stream_id,
            name: stream.merchant_name || stream.description,
            amount: Math.abs(stream.average_amount?.amount || 0),
            frequency: stream.frequency.toLowerCase() as any,
            lastCharge: stream.last_date ? new Date(stream.last_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown',
            nextPredicted: stream.last_date ? 'Soon' : 'Upcoming',
            status: stream.status === 'MATURE' ? 'active' : 'review'
        }));

        // Filter and sort by amount
        const activeSubscriptions = subscriptions.filter(s => s.amount > 0);
        activeSubscriptions.sort((a, b) => b.amount - a.amount);

        return NextResponse.json({ 
            subscriptions: activeSubscriptions 
        });

    } catch (error: any) {
        console.error("Subscriptions Data Error:", error);
        return NextResponse.json({ error: "Failed to fetch subscriptions data" }, { status: 500 });
    }
}
