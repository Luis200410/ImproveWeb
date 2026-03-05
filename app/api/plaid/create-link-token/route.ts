import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const createTokenResponse = await plaidClient.linkTokenCreate({
            user: {
                client_user_id: userId,
            },
            client_name: "ImproveWeb Apps",
            products: ['auth', 'transactions', 'investments'] as any[],
            language: "en",
            country_codes: ["US"] as any[],
        });

        return NextResponse.json(createTokenResponse.data);
    } catch (error: any) {
        console.error("Error creating Plaid link token:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
    }
}
