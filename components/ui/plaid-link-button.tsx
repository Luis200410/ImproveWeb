"use client";

import { useState, useEffect } from "react";
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from "react-plaid-link";
import { Button } from "./button";
import { Unplug, Cable } from "lucide-react";
import { toast } from "sonner";

export function PlaidLinkButton({ userId, onSuccess: onSyncSuccess }: { userId: string, onSuccess?: () => void }) {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch Link Token when component mounts
        const fetchLinkToken = async () => {
            try {
                if (!userId) return;

                const response = await fetch("/api/plaid/create-link-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setLinkToken(data.link_token);
                }
            } catch (err) {
                console.error("Failed to fetch link token:", err);
            }
        };

        fetchLinkToken();
    }, [userId]);

    const onSuccess = async (publicToken: string, metadata: any) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/plaid/exchange-public-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicToken, userId }),
            });

            if (response.ok) {
                toast.success("Bank account linked successfully!");
                if (onSyncSuccess) onSyncSuccess();
            } else {
                toast.error("Failed to link bank account. Please try again.");
            }
        } catch (error) {
            console.error("Link exchange failed:", error);
            toast.error("An error occurred during linking.");
        } finally {
            setIsLoading(false);
        }
    };

    const config: PlaidLinkOptions = {
        token: linkToken!,
        onSuccess,
    };

    const { open, ready } = usePlaidLink(config);

    if (!linkToken) {
        return (
            <Button disabled variant="outline" className="opacity-50 gap-2">
                <Cable className="w-4 h-4" />
                Initializing Plaid...
            </Button>
        );
    }

    return (
        <Button
            onClick={() => open()}
            disabled={!ready || isLoading}
            variant="outline"
            className="border-emerald-500/30 text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-100 transition shadow-[0_0_15px_rgba(16,185,129,0.2)] gap-2"
        >
            <Unplug className="w-4 h-4" />
            {isLoading ? "Linking..." : "Connect Bank"}
        </Button>
    );
}
