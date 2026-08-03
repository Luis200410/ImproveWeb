'use client'

import { useParams, useRouter } from 'next/navigation'
import { BLOG_POSTS } from '@/lib/blog'
import { Bebas_Neue, Playfair_Display, Inter } from '@/lib/font-shim'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Share2, Printer, MapPin, Sparkles, MoveRight } from 'lucide-react'
import { useRef } from 'react'

const bebas = Bebas_Neue({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function BlogPostPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const post = BLOG_POSTS.find((p) => p.slug === slug)

    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    })

    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const y = useTransform(scrollYProgress, [0, 1], [0, 200])

    const { scrollYProgress: contentProgress } = useScroll()
    const scaleX = useSpring(contentProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
                <div className="text-center">
                    <h1 className={`${bebas.className} text-6xl mb-8`}>Article Not Found</h1>
                    <Link href="/blog" className="text-white/40 hover:text-white underline underline-offset-8 transition-colors">
                        Return to Blog
                    </Link>
                </div>
            </div>
        )
    }

    const nextPost = BLOG_POSTS[(BLOG_POSTS.indexOf(post) + 1) % BLOG_POSTS.length]
    
    const postJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.image,
        "datePublished": post.date,
        "author": {
            "@type": "Person",
            "name": post.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "IMPROVE",
            "logo": {
                "@type": "ImageObject",
                "url": "https://improve-club.com/og-image.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://improve-club.com/blog/${post.slug}`
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pb-32">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
            />
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] bg-white z-[110] origin-left"
                style={{ scaleX }}
            />

            {/* Navigation Overlay */}
            <div className="fixed top-24 left-8 z-[100] hidden lg:block">
                <button 
                    onClick={() => router.back()}
                    className="group flex flex-col items-center gap-4 text-white/20 hover:text-white transition-all duration-300"
                >
                    <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-white/40 group-hover:-translate-y-1 transition-all duration-300">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] [writing-mode:vertical-rl] [text-orientation:mixed]">BACK</span>
                </button>
            </div>

            {/* Immersive Hero Header */}
            <section ref={heroRef} className="relative h-screen w-full flex items-end justify-start overflow-hidden">
                <motion.div style={{ scale }} className="absolute inset-0">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
                </motion.div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-12 pb-32 w-full">
                    <motion.div
                        style={{ opacity, y }}
                        className="space-y-12 max-w-5xl"
                    >
                        <div className="flex items-center gap-6">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: 60 }} 
                                transition={{ delay: 0.5, duration: 1 }} 
                                className="h-px bg-white/40" 
                            />
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.6em] text-white/50">
                                <Sparkles className="w-3 h-3" />
                                <span>{post.category} Report</span>
                                <div className="w-1 h-1 bg-white/20 rounded-full" />
                                <span>{post.date}</span>
                            </div>
                        </div>

                        <h1 className={`${playfair.className} text-6xl md:text-[10vw] font-black italic tracking-tighter text-white uppercase italic leading-[0.8] mb-12`}>
                            {post.title}
                        </h1>

                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <p className="text-xl md:text-2xl text-white/60 max-w-2xl font-light leading-relaxed italic border-l border-white/20 pl-8">
                                "{post.excerpt}"
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Scroll Hint */}
                <div className="absolute bottom-12 right-12 flex flex-col items-center gap-12 opacity-40">
                    <span className="text-[10px] uppercase tracking-[0.5em] [writing-mode:vertical-rl] [text-orientation:mixed]">SCROLL TO READ</span>
                    <div className="h-24 w-px bg-gradient-to-b from-white to-transparent" />
                </div>
            </section>

            {/* Post Layout */}
            <div className="max-w-7xl mx-auto px-6 pt-32 lg:pt-48">
                <div className="grid lg:grid-cols-[1fr_300px] gap-20 xl:gap-40">
                    
                    {/* Sidebar left (Desktop) */}
                    <aside className="hidden lg:block space-y-16">
                        <section className="space-y-6 sticky top-40">
                            <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 border-b border-white/10 pb-4">Classification</h4>
                            <div className="space-y-2">
                                <p className={`${bebas.className} text-2xl`}>{post.author}</p>
                                <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">The IMPROVE Protocol</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 border-b border-white/10 pb-4">Data Stream</h4>
                                <p className={`${bebas.className} text-2xl`}>{post.readingTime}</p>
                                <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">Optimization Logic</p>
                            </div>

                            <section className="space-y-4 pt-12">
                                <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 border-b border-white/10 pb-4">Distribution</h4>
                                <div className="flex gap-6">
                                    <Share2 className="w-5 h-5 text-white/20 hover:text-white cursor-pointer transition-colors" />
                                    <Printer className="w-5 h-5 text-white/20 hover:text-white cursor-pointer transition-colors" />
                                    <MapPin className="w-5 h-5 text-white/20 hover:text-white cursor-pointer transition-colors" />
                                </div>
                            </section>
                        </section>
                    </aside>

                    {/* Main Content */}
                    <article className="prose prose-invert prose-lg max-w-none 
                        prose-p:text-white/70 prose-p:text-xl prose-p:leading-relaxed prose-p:mb-12
                        prose-headings:font-bold prose-headings:tracking-tighter prose-headings:uppercase prose-headings:italic
                        prose-h2:text-4xl prose-h2:mb-8 prose-h2:mt-24
                        prose-h3:text-2xl prose-h3:mb-6
                        prose-blockquote:border-l-2 prose-blockquote:border-white/20 prose-blockquote:italic prose-blockquote:bg-white/5 prose-blockquote:py-8 prose-blockquote:px-12 prose-blockquote:text-white
                        prose-li:text-white/60 prose-li:mb-4
                        prose-strong:text-white prose-strong:font-black
                        selection:bg-white selection:text-black
                        [&_h2]:tracking-[-0.05em]">
                        
                        <div className="whitespace-pre-wrap font-light tracking-wide text-white/80 leading-relaxed">
                            {post.content}
                        </div>
                    </article>
                </div>
            </div>

            {/* Immersive Footer / Next Link */}
            <section className="mt-64 relative min-h-[60vh] flex items-center justify-center overflow-hidden border-t border-white/10">
                <div className="absolute inset-0 bg-white/[0.02] -z-10" />
                <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <h4 className={`${bebas.className} text-xl uppercase tracking-[0.8em] text-white/20`}>CONTINUE ANALYSIS</h4>
                        <Link href={`/blog/${nextPost.slug}`} className="group block py-12">
                            <span className={`${playfair.className} text-6xl md:text-8xl font-black italic tracking-tighter uppercase inline-block group-hover:scale-105 transition-transform duration-700`}>
                                {nextPost.title}
                            </span>
                            <div className="mt-8 flex justify-center items-center gap-4 text-white/40 group-hover:text-white transition-colors duration-500">
                                <span className={`${bebas.className} text-lg tracking-[0.4em]`}>NEXT ARTICLE</span>
                                <MoveRight className="w-5 h-5 group-hover:translate-x-4 transition-transform duration-500" />
                            </div>
                        </Link>
                    </motion.div>
                </div>
                
                {/* Visual Anchor */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </section>

        </div>
    )
}
