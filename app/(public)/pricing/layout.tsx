import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Membership Pricing — Origin, Momentum & Praxis Plans",
    description:
        "Choose your IMPROVE membership tier. From $10/month, unlock all 8 life systems: body, money, work, productivity, relationships, mind, legacy, and knowledge. Start improving today.",
    keywords: [
        "improve pricing",
        "self improvement app pricing",
        "productivity app subscription",
        "improve membership",
        "habit tracker pricing",
        "personal development app cost",
        "improve plans",
        "origin plan",
        "momentum plan",
        "praxis plan",
        "Improve Club",
        "improve club",
    ],
    openGraph: {
        title: "Membership Pricing — IMPROVE",
        description:
            "From $10/month, unlock all 8 life systems and start your journey to excellence. Choose Origin, Momentum, or Praxis.",
        url: "https://improve-club.com/pricing",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "IMPROVE Membership Pricing",
            },
        ],
    },
    twitter: {
        title: "Membership Pricing — IMPROVE",
        description:
            "From $10/month, unlock all 8 life systems and start your journey to excellence.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://improve-club.com/pricing",
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
