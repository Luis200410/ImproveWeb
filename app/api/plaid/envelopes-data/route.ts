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

        // 1. Check 15-minute staleness cache
        const { data: cacheRow } = await supabase
            .from('entries')
            .select('*')
            .eq('user_id', userId)
            .eq('microapp_id', 'plaid-cache-envelopes')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (cacheRow) {
            const ageMinutes = (new Date().getTime() - new Date(cacheRow.updated_at || cacheRow.created_at).getTime()) / (1000 * 60);
            if (ageMinutes <= 15) {
                console.log("Serving envelopes from 15-min cache");
                return NextResponse.json(cacheRow.data);
            }
        }

        // 2. Get access tokens
        const { data: items, error } = await supabase
            .from('plaid_items')
            .select('access_token')
            .eq('user_id', userId);

        if (error) throw error;
        if (!items || items.length === 0) {
            return NextResponse.json({ envelopes: [] });
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
                console.error("Error fetching Plaid transactions for envelopes:", err);
                return [];
            }
        });

        const txResults = await Promise.all(fetchPromises);
        for (const txs of txResults) {
            allTransactions = [...allTransactions, ...txs];
        }

        // Fetch User Custom Re-categories
        const { data: customRules } = await supabase
            .from('entries')
            .select('*')
            .eq('user_id', userId)
            .eq('microapp_id', 'envelope-recategorization');

        const recatMap: Record<string, string> = {};
        if (customRules) {
            customRules.forEach(r => {
                recatMap[r.data.merchant] = r.data.targetEnvelope;
            });
        }

        // Categorize into envelopes (similar logic to budget-data)
        const categories = {
            'Groceries': ['FOOD_AND_DRINK', 'GROCERIES'],
            'Dining': ['FOOD_AND_DRINK', 'RESTAURANTS'],
            'Transport': ['TRANSPORTATION', 'TRAVEL'],
            'Entertainment': ['ENTERTAINMENT', 'SHOPPING'],
            'Utilities': ['RENT_AND_UTILITIES'],
        };

        const envelopesMap: Record<string, any> = {};

        allTransactions.forEach(tx => {
            if (tx.amount <= 0) return;
            const primaryCat = tx.personal_finance_category?.primary || '';
            const description = tx.name;
            const merchantName = tx.merchant_name || tx.name;

            let envelopeName = 'Other';

            // 1. Check custom user rules built by POST first
            if (recatMap[merchantName]) {
                envelopeName = recatMap[merchantName];
            } else {
                // 2. Fallback to Plaid native classification matrix
                for (const [name, pfc_categories] of Object.entries(categories)) {
                    if (pfc_categories.some(cat => primaryCat.includes(cat))) {
                        envelopeName = name;
                        break;
                    }
                }
            }

            if (!envelopesMap[envelopeName]) {
                envelopesMap[envelopeName] = { 
                    id: envelopeName.toLowerCase(),
                    name: envelopeName,
                    currentSpent: 0,
                    transactions: [],
                    daysInCycle: 30 // hardcoded for the current logic
                };
            }

            envelopesMap[envelopeName].currentSpent += tx.amount;
            envelopesMap[envelopeName].transactions.push({
                id: tx.transaction_id,
                merchant: tx.merchant_name || tx.name,
                amount: tx.amount,
                date: tx.date,
                category: tx.personal_finance_category?.primary || 'Uncategorized'
            });
        });

        const envelopes = Object.values(envelopesMap).map(env => {
            const usualPacePerWeek = (env.currentSpent / 8) || 0; // average over 8 weeks
            const velocity = 1.0; 
            const paceStatus = velocity > 1.2 ? 'Fast' : velocity < 0.8 ? 'Slow' : 'On track';
            
            return {
                ...env,
                paceStatus,
                velocity,
                usualPacePerWeek,
                transactions: env.transactions.slice(0, 5) // limit to 5 illustrative transactions
            };
        });

        const responseData = { 
            envelopes: envelopes.sort((a, b) => b.currentSpent - a.currentSpent)
        };

        // Cache the new result
        await supabase.from('entries').upsert({
            id: cacheRow?.id || crypto.randomUUID(),
            user_id: userId,
            microapp_id: 'plaid-cache-envelopes',
            data: responseData,
            updated_at: new Date().toISOString()
        });

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error("Envelopes Data Error:", error);
        return NextResponse.json({ error: "Failed to fetch envelopes data" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, merchant, targetEnvelope } = body;

        if (!userId || !merchant || !targetEnvelope) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = await createClient();

        // Save the custom map definition in the generic entries json cache architecture avoiding explicit schemas
        await supabase.from('entries').upsert({
            id: crypto.randomUUID(), // we could use a stable ID like name hash to prevent infinite growth
            user_id: userId,
            microapp_id: 'envelope-recategorization',
            data: { merchant, targetEnvelope, updated_at: new Date().toISOString() },
            updated_at: new Date().toISOString()
        });

        // Delete the 15-minute 90-day envelopes cache forcing the subsequent GET logic above to run the hard recalculation against Plaid Transactions combining our new rules
        await supabase.from('entries')
            .delete()
            .eq('user_id', userId)
            .eq('microapp_id', 'plaid-cache-envelopes');

        return NextResponse.json({ status: "success" });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
