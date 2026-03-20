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

        // Check Cache (15 min)
        const { data: cacheRow } = await supabase
            .from('entries')
            .select('*')
            .eq('user_id', userId)
            .eq('microapp_id', 'plaid-cache-cashflow')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (cacheRow) {
            const ageMinutes = (new Date().getTime() - new Date(cacheRow.updated_at || cacheRow.created_at).getTime()) / (1000 * 60);
            if (ageMinutes <= 15) {
                return NextResponse.json(cacheRow.data);
            }
        }

        const { data: items, error } = await supabase
            .from('plaid_items')
            .select('access_token')
            .eq('user_id', userId);

        if (error || !items) throw error;
        if (items.length === 0) return NextResponse.json({ chartData: [], stats: { low30: 0, low60: 0, low90: 0 } });

        // Build composite financial snapshot over 90 days.
        let totalBalance = 0;
        let recurringOutflows: any[] = [];
        let dailyDecay = 0; // The average daily spend derived from normal transactions.
        
        // Let's pull some core metrics using Plaid endpoints.
        const [balancesResponse, recurringResponse] = await Promise.all([
            plaidClient.accountsBalanceGet({ access_token: items[0].access_token }),
            plaidClient.transactionsRecurringGet({ access_token: items[0].access_token })
        ]);

        totalBalance = balancesResponse.data.accounts.reduce((sum, acc) => {
            if (acc.type === 'depository' && acc.subtype !== 'cd') {
                return sum + (acc.balances.available || acc.balances.current || 0);
            }
            if (acc.type === 'credit') {
                return sum - (acc.balances.current || 0);
            }
            return sum;
        }, 0);

        if (recurringResponse.data.outflow_streams) {
            recurringOutflows = recurringResponse.data.outflow_streams.map(stream => ({
                amount: stream.average_amount?.amount || 0,
                merchant: stream.merchant_name || stream.description,
                frequency: stream.frequency,
                nextDate: stream.last_date ? new Date((new Date(stream.last_date)).getTime() + 30*24*60*60*1000) : new Date() // rough assumption for math
            }));
        }

        // Just guess a generic daily decay of total un-tracked money to simulate real flow if no envelopes exist.
        // We will do a generic $25/day to keep the chart dynamically decreasing if there's no income defined.
        dailyDecay = 25; 

        // 90 Day Engine Projection
        const today = new Date();
        const chartData = [];
        let currentBalance = totalBalance;
        let whatIfBalance = totalBalance;
        const minBuffer = 2000;

        for (let i = 0; i < 90; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            
            let event = null;
            let isActionable = false;
            let link = '';

            // Subtract daily generic decay
            currentBalance -= dailyDecay;
            whatIfBalance -= dailyDecay;

            // Apply specific structural streams falling on these dates
            recurringOutflows.forEach(stream => {
                const streamDateStr = stream.nextDate.toISOString().split('T')[0];
                const loopDateStr = date.toISOString().split('T')[0];
                
                // Match exact dates (or simulate a monthly recurrence offset roughly)
                if (streamDateStr === loopDateStr || (i > 0 && i % 30 === 0)) {
                    currentBalance -= stream.amount;
                    event = stream.merchant;
                    isActionable = true;
                    link = '/systems/money/subscriptions';
                    
                    // What-if simulation (assumes user cancels it)
                    // So what-if balance DOES NOT get deducted. 
                } else {
                    // deduct what if anyway if no stream triggers
                }
            });

            // Mock generic Salary every 14 days
            if (i > 0 && i % 14 === 0) {
                currentBalance += 1500;
                whatIfBalance += 1500;
                event = 'Estimated Incoming';
            }

            chartData.push({
                day: i,
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                balance: currentBalance,
                whatIf: whatIfBalance,
                event,
                isActionable,
                link,
                dangerLine: Math.min(currentBalance, minBuffer)
            });
        }

        const l30 = Math.min(...chartData.slice(0, 30).map(d => d.balance));
        const l60 = Math.min(...chartData.slice(0, 60).map(d => d.balance));
        const l90 = Math.min(...chartData.slice(0, 90).map(d => d.balance));

        const responseData = { chartData, stats: { low30: l30, low60: l60, low90: l90 } };

        await supabase.from('entries').upsert({
            id: cacheRow?.id || crypto.randomUUID(),
            user_id: userId,
            microapp_id: 'plaid-cache-cashflow',
            data: responseData,
            updated_at: new Date().toISOString()
        });

        return NextResponse.json(responseData);
    } catch (e: any) {
        console.error("Cashflow error:", e);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
