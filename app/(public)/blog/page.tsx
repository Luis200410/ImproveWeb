"use client";

import { useState, useEffect, useRef, useMemo } from 'react'
import { BLOG_POSTS, BlogPost, getAllMergedPosts } from '@/lib/blog'
import { Bebas_Neue, Playfair_Display } from '@/lib/font-shim'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, PlusCircle, ArrowRight } from 'lucide-react'
import { CircularGallery, GalleryItem } from '@/components/blog/circular-gallery'

const bebas = Bebas_Neue({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'] })

const CATEGORY_COLORS: Record<string, string> = {
    'Philosophy': 'text-white border-white/40',
    'Productivity': 'text-blue-400 border-blue-500/30',
    'Knowledge': 'text-purple-400 border-purple-500/30',
    'Wealth': 'text-emerald-400 border-emerald-500/30',
    'Body': 'text-orange-400 border-orange-500/30',
}

function BlogPostCard({ post, index }: { post: BlogPost; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="group relative"
        >
            <Link href={`/blog/${post.slug}`}>
                <div className="space-y-8">
                    {/* Image Container with Hover Effects */}
                    <div className="relative aspect-[16/10] overflow-hidden border border-white/5 bg-white/5">
                        <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-700" />
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                        />
                        {post.cards && post.cards.length > 0 && (
                            <div className="absolute top-4 right-4 z-20">
                                <span className="text-[9px] uppercase tracking-wider font-mono bg-purple-600/80 text-white px-2.5 py-1 rounded-full backdrop-blur-md border border-purple-400/30 font-semibold shadow-lg">
                                    3D Story ({post.cards.length})
                                </span>
                            </div>
                        )}
                        {/* Decorative Overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className={`text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border ${CATEGORY_COLORS[post.category] || 'text-white/40 border-white/10'}`}>
                                {post.category}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">{post.date}</span>
                        </div>
                        
                        <h3 className={`${playfair.className} text-3xl md:text-4xl font-bold leading-tight group-hover:text-white transition-colors duration-500`}>
                            {post.title}
                        </h3>
                        
                        <p className="text-white/40 text-sm leading-relaxed line-clamp-3 font-light italic">
                            "{post.excerpt}"
                        </p>

                        <div className="pt-4 flex items-center gap-2 group-hover:gap-4 transition-all duration-500">
                            <div className="h-px w-8 bg-white/20 group-hover:w-12 group-hover:bg-white transition-all" />
                            <span className={`${bebas.className} text-xs uppercase tracking-[0.4em] text-white/40 group-hover:text-white`}>
                                READ ARTICLE
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export default function BlogListingPage() {
    const containerRef = useRef(null)
    const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
    const [activePostIndex, setActivePostIndex] = useState(0);

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
        <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute top-0 left-1/4 w-px h-full bg-white/5" />
                <div className="absolute top-0 right-1/4 w-px h-full bg-white/5" />
            </div>

            <div className="relative z-10 pt-40 pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Massive Header */}
                    <header className="mb-16 text-center relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                        >
                            <h1 className={`${bebas.className} text-[15vw] md:text-[12vw] font-black italic tracking-tighter uppercase leading-[0.8] mb-8`}>
                                THE <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.15)] group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,0.4)] transition-all duration-500">INTEGRITY</span><br />
                                <span className="text-white">REPORTS</span>
                            </h1>
                            <div className="flex flex-col items-center gap-6">
                                <div className="h-20 w-px bg-gradient-to-b from-white to-transparent" />
                                <p className="text-white/40 text-xs uppercase tracking-[0.6em] max-w-xl leading-loose">
                                    Documenting the evolution of human performance through<br />
                                    <span className="text-white">Systematic Discipline</span> and <span className="text-white">Philosophy</span>.
                                </p>

                                <div className="pt-4 flex items-center gap-3">
                                    <Link
                                        href="/admin"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-xs text-white/90 transition-all font-mono uppercase tracking-wider shadow-lg"
                                    >
                                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                                        <span>Studio • Create 3D Post</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Decorative background text */}
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 -z-10 opacity-[0.03] select-none pointer-events-none">
                            <span className={`${bebas.className} text-[30vw] whitespace-nowrap`}>IMPROVE</span>
                        </div>
                    </header>

                    {/* 3D Circular Gallery Showcase */}
                    {posts.length > 0 && (
                        <section className="mb-32">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#34d399]" />
                                    <span className="text-xs font-mono uppercase tracking-[0.3em] text-white/80 font-bold">
                                        Live 3D Dispatch Cylinder • {posts.length} Reports
                                    </span>
                                </div>
                                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                    <span>Drag or scroll to rotate</span>
                                    <span className="text-white/20">•</span>
                                    <span>Click card to open report</span>
                                </div>
                            </div>

                            <div className="relative border border-white/10 rounded-[36px] bg-gradient-to-b from-white/[0.03] to-black/80 backdrop-blur-2xl p-4 sm:p-8 overflow-hidden shadow-2xl">
                                <CircularGallery
                                    items={galleryItems}
                                    radius={posts.length <= 4 ? 460 : 560}
                                    autoRotateSpeed={0.015}
                                    onActiveIndexChange={(idx) => setActivePostIndex(idx)}
                                />

                                {/* Focused Card Quick Spotlight */}
                                {activePost && (
                                    <motion.div
                                        key={activePost.slug}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.35 }}
                                        className="mt-6 p-6 sm:p-8 rounded-[24px] border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
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
                                            <Link href={`/blog/${activePost.slug}`} className="w-full lg:w-auto">
                                                <button className="w-full lg:w-auto px-8 py-4 rounded-xl bg-white text-black font-bebas text-base tracking-[0.2em] uppercase hover:bg-white/90 transition-all cursor-pointer flex items-center justify-center gap-2 group">
                                                    <span>Enter Report</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* All Reports Directory Archive */}
                    <div className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-6 gap-4">
                        <div className="space-y-2">
                            <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-white/40">ARCHIVE DIRECTORY</span>
                            <h2 className={`${bebas.className} text-4xl sm:text-5xl font-black tracking-tight`}>
                                ALL TRANSMISSIONS
                            </h2>
                        </div>
                        <span className="text-xs font-mono text-white/40">
                            Showing {posts.length} entries
                        </span>
                    </div>

                    {/* Feed Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                        {posts.map((post, idx) => (
                            <BlogPostCard key={post.slug} post={post} index={idx} />
                        ))}
                    </div>

                    {/* Newsletter / CTA */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-64 relative py-32 px-12 overflow-hidden border border-white/10"
                    >
                        <div className="absolute inset-0 bg-white/[0.02] transform -skew-y-6 -translate-y-12" />
                        
                        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-12">
                            <div className="space-y-4">
                                <h3 className={`${bebas.className} text-6xl md:text-7xl font-black italic tracking-tighter uppercase`}>
                                    Join the <span className="text-white/20">Frequency</span>
                                </h3>
                                <p className="text-white/40 text-xs uppercase tracking-[0.5em] leading-relaxed">
                                    Bi-weekly transmissions of systems updates and integrity strategies.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input 
                                    type="email" 
                                    placeholder="ATHLETE@PERFORMANCE.COM" 
                                    className="flex-1 bg-black border border-white/20 px-8 py-5 font-bebas text-lg tracking-[0.2em] focus:outline-none focus:border-white transition-all text-center sm:text-left"
                                />
                                <button className="bg-white text-black font-bebas px-16 py-5 text-lg tracking-[0.3em] hover:bg-white/90 transition-all uppercase font-black">
                                    TRANSMIT
                                </button>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>

            {/* Global Grid Lines */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

        </div>
    )
}
