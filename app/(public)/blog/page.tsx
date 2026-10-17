"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BLOG_POSTS, BlogPost, getAllMergedPosts } from '@/lib/blog'
import { Bebas_Neue, Playfair_Display } from '@/lib/font-shim'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { GalleryItem } from '@/components/blog/circular-gallery'

const CircularGallery = dynamic(
    () => import('@/components/blog/circular-gallery').then((mod) => mod.CircularGallery),
    {
        ssr: false,
        loading: () => (
            <div className="relative w-full h-[500px] sm:h-[560px] md:h-[620px] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>
        ),
    }
)

const bebas = Bebas_Neue({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'] })

const CATEGORY_COLORS: Record<string, string> = {
    'Philosophy': 'text-white border-white/40',
    'Productivity': 'text-blue-400 border-blue-500/30',
    'Knowledge': 'text-purple-400 border-purple-500/30',
    'Wealth': 'text-emerald-400 border-emerald-500/30',
    'Body': 'text-orange-400 border-orange-500/30',
    'Mind': 'text-purple-400 border-purple-500/30',
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

function BlogGalleryCluster({
    posts,
    clusterIndex,
    totalClusters,
}: {
    posts: BlogPost[];
    clusterIndex: number;
    totalClusters: number;
}) {
    const [activePostIndex, setActivePostIndex] = useState(0);

    const handleActiveIndexChange = useCallback((idx: number) => {
        setActivePostIndex((prev) => (prev !== idx ? idx : prev));
    }, []);

    const galleryItems: GalleryItem[] = useMemo(() => {
        return posts.map((post) => ({
            id: post.slug,
            common: post.title,
            binomial: `${post.category} • ${post.readingTime}`,
            photo: {
                url: post.image,
                text: post.title,
                by: post.author || 'IMPROVE Research',
            },
            content: post.excerpt,
            href: `/blog/${post.slug}`,
            badge: post.cards && post.cards.length > 0 ? `3D Story (${post.cards.length})` : undefined,
            ctaText: 'Enter Report',
        }));
    }, [posts]);

    const activePost = posts[activePostIndex] || posts[0];

    return (
        <section className="relative">
            {/* Ambient Luminous Backlight Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[950px] h-[350px] md:h-[450px] bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="access-glass relative w-full p-4 sm:p-6 md:p-8 overflow-hidden">
                {totalClusters > 1 && (
                    <div className="flex items-center justify-between pb-3 px-2 border-b border-white/10 mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 font-bold">
                            CYLINDER {String(clusterIndex + 1).padStart(2, "0")} • {posts.length} REPORTS
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 hidden sm:inline-block">
                            Click card or controls to rotate
                        </span>
                    </div>
                )}

                <CircularGallery
                    items={galleryItems}
                    radius={posts.length <= 4 ? 440 : 540}
                    autoRotateSpeed={0.015}
                    onActiveIndexChange={handleActiveIndexChange}
                    onItemSelect={(_, idx) => handleActiveIndexChange(idx)}
                />

                {/* Focused Card Quick Spotlight */}
                {activePost && (
                    <motion.div
                        key={activePost.slug}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mt-6 p-5 sm:p-7 rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                    >
                        <div className="space-y-3 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-white/50">
                                <span className={`px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[activePost.category] || 'border-white/20 text-white'}`}>
                                    {activePost.category}
                                </span>
                                <span>EST. {activePost.readingTime}</span>
                                <span>•</span>
                                <span>{activePost.author}</span>
                                {activePost.cards && activePost.cards.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold">
                                        3D Multi-Card Experience ({activePost.cards.length} Cards)
                                    </span>
                                )}
                            </div>
                            <h3 className={`${playfair.className} text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight`}>
                                {activePost.title}
                            </h3>
                            <p className="text-white/60 text-sm font-light italic line-clamp-2 leading-relaxed">
                                "{activePost.excerpt}"
                            </p>
                        </div>

                        <div className="flex items-center gap-4 w-full lg:w-auto shrink-0">
                            <Link href={`/blog/${activePost.slug}`} className="w-full lg:w-auto block">
                                <span className="w-full lg:w-auto px-8 py-4 rounded-xl bg-white text-black font-bebas text-base tracking-[0.2em] uppercase hover:bg-white/90 transition-all cursor-pointer flex items-center justify-center gap-2 group">
                                    <span>Enter Report</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
}

export default function BlogListingPage() {
    const containerRef = useRef(null)
    const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);

    useEffect(() => {
        const merged = getAllMergedPosts();
        if (merged.length > 0) setPosts(merged);

        fetch('/api/blog/posts')
            .then((res) => res.json())
            .then((data) => {
                if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
                    setPosts(data.posts);
                }
            })
            .catch(() => {});
    }, []);

    // Chunk posts into groups of 5 maximum per 3D gallery cylinder
    const postClusters = useMemo(() => chunkArray(posts, 5), [posts]);

    return (
        <div ref={containerRef} className="min-h-screen bg-transparent text-white selection:bg-white selection:text-black">
            <div className="relative z-10 pt-4 sm:pt-6 pb-28 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto space-y-20">
                    {/* 3D Circular Gallery Clusters: maximum 5 posts per cylinder, creates new cylinder below when > 5 */}
                    {postClusters.map((cluster, idx) => (
                        <BlogGalleryCluster
                            key={`cluster-${cluster[0]?.slug || idx}`}
                            posts={cluster}
                            clusterIndex={idx}
                            totalClusters={postClusters.length}
                        />
                    ))}

                    {/* Empty State if all posts were cleared */}
                    {posts.length === 0 && (
                        <div className="access-glass p-12 sm:p-16 text-center space-y-5 rounded-[28px] max-w-2xl mx-auto">
                            <Sparkles className="w-10 h-10 text-white/40 mx-auto" />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white tracking-tight">No Reports Published Yet</h3>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    All blog entries have been cleared. Head over to the Admin Studio to compose and publish your first 3D report.
                                </p>
                            </div>
                            <div className="pt-2">
                                <Link href="/admin" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bebas text-sm tracking-[0.2em] uppercase hover:bg-white/90 transition-all">
                                    <span>Open Admin Studio</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Newsletter / CTA inside Unified access-glass Container */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="access-glass relative py-20 px-8 sm:px-12 md:px-16 overflow-hidden text-center"
                    >
                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <div className="space-y-3">
                                <h3 className={`${bebas.className} text-5xl sm:text-6xl md:text-7xl font-black italic tracking-tighter uppercase`}>
                                    Join the <span className="text-white/30">Frequency</span>
                                </h3>
                                <p className="text-white/50 text-xs uppercase tracking-[0.4em] leading-relaxed">
                                    Bi-weekly transmissions of systems updates and integrity strategies.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                                <input 
                                    type="email" 
                                    placeholder="ATHLETE@PERFORMANCE.COM" 
                                    className="flex-1 bg-white/[0.04] border border-white/20 px-6 py-4 rounded-xl font-mono text-xs tracking-wider text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-all text-center sm:text-left"
                                />
                                <button className="bg-white text-black font-bebas px-10 py-4 rounded-xl text-base tracking-[0.25em] hover:bg-white/90 transition-all uppercase font-black cursor-pointer">
                                    TRANSMIT
                                </button>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    )
}
