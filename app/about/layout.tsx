// About page is 'use client' so metadata must be exported from a separate file.
// Next.js supports metadata in layout.tsx wrapping the page, OR via a metadata.ts
// file. Since we can't have both 'use client' + metadata in the same page file,
// we use a separate approach: wrap in a layout that exports metadata.
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Manifesto — The Philosophy of Complete Integrity",
    description:
        "Discover the philosophy behind IMPROVE. In an age of distraction, we stand for discipline. In an era of mediocrity, we champion Complete Integrity. Read our manifesto.",
    keywords: [
        "improve manifesto",
        "philosophy of complete integrity",
        "self improvement philosophy",
        "discipline mindset",
        "personal development philosophy",
        "complete integrity",
        "improve yourself",
        "Improve Club",
        "improve club",
    ],
    openGraph: {
        title: "The Manifesto — IMPROVE",
        description:
            "In an age of distraction, we stand for discipline. In an era of mediocrity, we champion Complete Integrity. Discover the philosophy behind IMPROVE.",
        url: "https://improve-club.com/about",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "IMPROVE Manifesto — Complete Integrity",
            },
        ],
    },
    twitter: {
        title: "The Manifesto — IMPROVE",
        description:
            "In an age of distraction, we stand for discipline. In an era of mediocrity, we champion excellence.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://improve-club.com/about",
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
