// About page is 'use client' so metadata must be exported from a separate file.
// Next.js supports metadata in layout.tsx wrapping the page, OR via a metadata.ts
// file. Since we can't have both 'use client' + metadata in the same page file,
// we use a separate approach: wrap in a layout that exports metadata.
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Manifesto — The Philosophy of Excellence",
    description:
        "Discover the philosophy behind IMPROVE. In an age of distraction, we stand for discipline. In an era of mediocrity, we champion excellence. Read our manifesto.",
    keywords: [
        "improve manifesto",
        "philosophy of excellence",
        "self improvement philosophy",
        "discipline mindset",
        "personal development philosophy",
        "school of excellence",
        "improve yourself",
    ],
    openGraph: {
        title: "The Manifesto — IMPROVE",
        description:
            "In an age of distraction, we stand for discipline. In an era of mediocrity, we champion excellence. Discover the philosophy behind IMPROVE.",
        url: "https://improveweb.app/about",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "IMPROVE Manifesto — The School of Excellence",
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
        canonical: "https://improveweb.app/about",
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
