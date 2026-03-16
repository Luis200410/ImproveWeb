import type { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blog";

const siteUrl = "https://improve-club.com";

export const metadata: Metadata = {
    title: "The Integrity Reports | IMPROVE — Complete Integrity",
    description:
        "Deep dives into the systems, psychology, and philosophy of Complete Integrity. Documenting the evolution of human performance through systematic discipline.",
    keywords: [
        "IMPROVE blog",
        "Integrity Reports",
        "self improvement systems",
        "Complete Integrity protocol",
        "productivity architecture",
        "deep work psychology",
        "second brain optimization",
        "systematic discipline",
    ],
    alternates: {
        canonical: `${siteUrl}/blog`,
    },
    openGraph: {
        title: "The Integrity Reports — IMPROVE",
        description:
            "Strategic insights on building a life of Complete Integrity through modern systems and systematic discipline.",
        url: `${siteUrl}/blog`,
        type: "website",
        images: [
            {
                url: `${siteUrl}/blog-og.png`,
                width: 1200,
                height: 630,
                alt: "The Integrity Reports — IMPROVE",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "The Integrity Reports — IMPROVE",
        description: "Documenting human performance through Systematic Discipline.",
        images: [`${siteUrl}/blog-og.png`],
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    const jsonLdBlog = {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "The Integrity Reports",
        description: "Official publication of the IMPROVE Protocol.",
        publisher: {
            "@type": "Organization",
            name: "IMPROVE",
            logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/og-image.png`,
            },
        },
        blogPost: BLOG_POSTS.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: {
                "@type": "Person",
                name: post.author,
            },
            url: `${siteUrl}/blog/${post.slug}`,
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlog) }}
            />
            {children}
        </>
    );
}
