import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const { publicToken, userId } = await req.json();

        if (!publicToken || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;

        const supabase = await createClient();

        // Store access token securely in Supabase.
        // It's recommended to encrypt this before storing, but for simplicity we store it directly.
        const { error } = await supabase
            .from('plaid_items')
            .insert([
                { user_id: userId, access_token: accessToken, item_id: itemId }
            ]);

        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, itemId });
    } catch (error: any) {
        console.error("Error exchanging public token:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
    }
}
