import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Eight Systems. One Life. Infinite Potential — Complete System Overview",
    description:
        "Explore IMPROVE's eight life systems: Body, Money, Work, Productivity, Relationships, Mind & Emotions, Legacy, and Second Brain. The complete self-improvement operating system.",
    keywords: [
        "improve systems",
        "eight life systems",
        "body improvement system",
        "money management system",
        "productivity system",
        "work improvement",
        "relationship improvement",
        "mind improvement",
        "second brain system",
        "legacy system",
        "self improvement systems",
        "holistic self improvement",
        "improve app features",
    ],
    openGraph: {
        title: "Eight Systems. One Life. — IMPROVE",
        description:
            "Body, Money, Work, Productivity, Relationships, Mind, Legacy, and Second Brain. All eight dimensions of human excellence, systematized in one app.",
        url: "https://improveweb.app/sales",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "IMPROVE — Eight Systems for Human Excellence",
            },
        ],
    },
    twitter: {
        title: "Eight Systems. One Life. — IMPROVE",
        description:
            "All eight dimensions of human excellence systematized. Body, Money, Work, Productivity, Relationships, Mind, Legacy, Second Brain.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://improveweb.app/sales",
    },
};

export default function SalesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
