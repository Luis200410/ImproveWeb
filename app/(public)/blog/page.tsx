'use client'

import { BLOG_POSTS, BlogPost } from '@/lib/blog'
import { Bebas_Neue, Playfair_Display } from '@/lib/font-shim'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'

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
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

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
                    <header className="mb-40 text-center relative">
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
                                    <span className="text-white">Sytematic Discipline</span> and <span className="text-white">Philosophy</span>.
                                </p>
                            </div>
                        </motion.div>
                        
                        {/* Decorative background text */}
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 -z-10 opacity-[0.03] select-none pointer-events-none">
                            <span className={`${bebas.className} text-[30vw] whitespace-nowrap`}>IMPROVE</span>
                        </div>
                    </header>

                    {/* Featured Section */}
                    {BLOG_POSTS.length > 0 && (
                        <section className="mb-48">
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                                className="relative grid lg:grid-cols-[1fr_450px] gap-0 border border-white/10 group overflow-hidden"
                            >
                                <Link href={`/blog/${BLOG_POSTS[0].slug}`} className="relative h-[600px] lg:h-[700px] overflow-hidden">
                                    <Image
                                        src={BLOG_POSTS[0].image}
                                        alt={BLOG_POSTS[0].title}
                                        fill
                                        className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2s] ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                                    
                                    <div className="absolute inset-0 p-12 md:p-20 flex flex-col justify-end max-w-3xl">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] uppercase tracking-[0.5em] font-black bg-white text-black px-4 py-2">
                                                    FEATURED REPORT
                                                </span>
                                            </div>
                                            <h2 className={`${playfair.className} text-5xl md:text-7xl font-bold leading-tight`}>
                                                {BLOG_POSTS[0].title}
                                            </h2>
                                            <p className="text-white/60 text-xl font-light leading-relaxed line-clamp-2 italic">
                                                "{BLOG_POSTS[0].excerpt}"
                                            </p>
                                        </motion.div>
                                    </div>
                                </Link>

                                <div className="bg-white/5 backdrop-blur-xl p-12 flex flex-col justify-between border-l border-white/10">
                                    <div className="space-y-4">
                                        <h4 className={`${bebas.className} text-xl uppercase tracking-widest text-white/40`}>System Focus</h4>
                                        <div className="flex gap-2">
                                            {['Integrity', 'Discipline', 'Optimization'].map(tag => (
                                                <span key={tag} className="text-[10px] border border-white/20 px-3 py-1 uppercase tracking-widest text-white/60 font-black">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8 pt-20">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] uppercase tracking-[0.4em] text-white/30">
                                                <span>AUTHOR</span>
                                                <span className="text-white">{BLOG_POSTS[0].author}</span>
                                            </div>
                                            <div className="h-px bg-white/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] uppercase tracking-[0.4em] text-white/30">
                                                <span>EST. READ</span>
                                                <span className="text-white">{BLOG_POSTS[0].readingTime}</span>
                                            </div>
                                            <div className="h-px bg-white/10" />
                                        </div>
                                        
                                        <Link href={`/blog/${BLOG_POSTS[0].slug}`}>
                                            <button className="w-full bg-white text-black font-bebas text-lg tracking-[0.2em] py-5 hover:bg-white/90 transition-all uppercase">
                                                Enter Report
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </section>
                    )}

                    {/* Feed Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                        {BLOG_POSTS.slice(1).map((post, idx) => (
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
