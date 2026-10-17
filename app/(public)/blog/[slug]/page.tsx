"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Share2, 
  Printer, 
  Sparkles, 
  MoveRight, 
  ArrowUp, 
  Layers, 
  Eye, 
  Clock, 
  User, 
  Calendar 
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { BLOG_POSTS, BlogPost, getAllMergedPosts, findMergedPost } from "@/lib/blog";
import type { GalleryItem } from "@/components/blog/circular-gallery";

const CircularGallery = dynamic(
  () => import("@/components/blog/circular-gallery").then((mod) => mod.CircularGallery),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[500px] sm:h-[560px] md:h-[620px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    ),
  }
);

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(() => {
    return findMergedPost(slug) || BLOG_POSTS.find((p) => p.slug === slug) || null;
  });
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [allPosts, setAllPosts] = useState<BlogPost[]>(BLOG_POSTS);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    // Attempt to load from merged store (API + localStorage + built-ins)
    const found = findMergedPost(slug) || BLOG_POSTS.find((p) => p.slug === slug);
    if (found) {
      setPost(found);
    }

    // Fetch latest from API
    fetch("/api/blog/posts")
      .then((res) => res.json())
      .then((data) => {
        if (data.posts && Array.isArray(data.posts)) {
          setAllPosts(data.posts);
          const apiPost = data.posts.find((p: BlogPost) => p.slug === slug);
          if (apiPost) {
            setPost(apiPost);
          }
        }
      })
      .catch(() => {
        // Fallback to static
      });
  }, [slug]);

  // Convert post.cards into memoized CircularGallery items (called unconditionally before early returns)
  const galleryItems: GalleryItem[] = React.useMemo(() => {
    if (!post || !post.cards) return [];
    return post.cards.map((card, idx) => ({
      id: card.id,
      common: card.title,
      binomial: card.subtitle || `Pillar ${idx + 1}`,
      photo: {
        url: card.imageUrl,
        text: card.imageAlt || card.title,
        by: card.credit || "IMPROVE Research",
      },
      content: card.content,
    }));
  }, [post?.cards]);

  const handleActiveIndexChange = React.useCallback((idx: number) => {
    setActiveCardIndex((prev) => (prev !== idx ? idx : prev));
  }, []);

  const otherPosts = React.useMemo(() => {
    if (!post) return allPosts;
    return allPosts.filter((p) => p.slug !== post.slug);
  }, [allPosts, post?.slug]);

  const nextPost = otherPosts.length > 0 ? otherPosts[0] : null;

  const handleShare = async () => {
    if (!post) return;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      // Ignored
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent text-white px-6" style={{ fontFamily: "var(--font-ios)" }}>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold">Article Not Found</h1>
          <p className="text-sm text-zinc-400">The requested article could not be located.</p>
          <div className="pt-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 bg-white text-black text-xs font-bold hover:bg-white/90 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Blog Hub</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white selection:bg-white selection:text-black pb-32" style={{ fontFamily: "var(--font-ios)" }}>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-white z-[110] origin-left shadow-[0_0_12px_rgba(255,255,255,0.7)]"
        style={{ scaleX }}
      />

      {/* Floating Back Button (Desktop) */}
      <div className="fixed top-28 left-8 z-[100] hidden xl:block">
        <button
          onClick={() => router.back()}
          className="group flex flex-col items-center gap-3 text-white/30 hover:text-white transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full border border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:border-white/40 group-hover:-translate-y-1 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] [writing-mode:vertical-rl] [text-orientation:mixed] font-semibold">
            BACK
          </span>
        </button>
      </div>

      {/* Article Header Container */}
      <header className="relative pt-36 pb-12 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs uppercase tracking-wider text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{post.category} Focus</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-white max-w-4xl mx-auto">
          {post.title}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[var(--label-2)] max-w-2xl mx-auto leading-relaxed font-light">
          {post.excerpt}
        </p>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-[var(--label-3)]">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <strong className="text-white">{post.author}</strong>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.date}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readingTime}</span>
          </span>
          <span>•</span>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-white hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* TOP 3D CIRCULAR GALLERY (IF POST HAS CARDS) */}
      {galleryItems.length > 0 && (
        <section className="relative w-full max-w-6xl mx-auto my-6 px-4">
          <div className="access-glass p-6 sm:p-8 overflow-hidden">
            <div className="text-center space-y-2 mb-2">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/50 font-semibold">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Interactive 3D Visual Gallery • {galleryItems.length} Key Perspectives</span>
              </div>
              <p className="text-xs text-[var(--label-3)]">
                Drag to spin or click any card to focus its chapter below.
              </p>
            </div>

            {/* 3D Rotating Cylinder */}
            <CircularGallery
              items={galleryItems}
              radius={post.galleryRadius || 600}
              autoRotateSpeed={0.015}
              activeIndex={activeCardIndex}
              onActiveIndexChange={handleActiveIndexChange}
              onItemSelect={(_, idx) => setActiveCardIndex(idx)}
            />
          </div>
        </section>
      )}

      {/* SINGLE DYNAMIC WRITTEN CONTENT SECTION BELOW THE ANIMATION */}
      <main id="active-card-section" className="max-w-4xl mx-auto px-6 pt-10 space-y-12">
        {post.cards && post.cards.length > 0 ? (
          (() => {
            const activeCard = post.cards[activeCardIndex] || post.cards[0];
            if (!activeCard) return null;

            return (
              <article className="access-glass p-8 sm:p-12 md:p-14 space-y-8 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCard.id || activeCardIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8"
                  >
                    {/* Header Badge & Pillar Dots */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/15">
                          Card {String(activeCardIndex + 1).padStart(2, "0")} / {String(post.cards.length).padStart(2, "0")}
                        </span>
                        {activeCard.subtitle && (
                          <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
                            {activeCard.subtitle}
                          </span>
                        )}
                      </div>

                      {/* Step Dots Selector */}
                      {post.cards.length > 1 && (
                        <div className="flex items-center gap-2">
                          {post.cards.map((c, i) => (
                            <button
                              key={c.id || i}
                              type="button"
                              onClick={() => setActiveCardIndex(i)}
                              className={`transition-all duration-300 rounded-full cursor-pointer ${
                                activeCardIndex === i
                                  ? "w-7 h-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                                  : "w-1.5 h-1.5 bg-white/20 hover:bg-white/50"
                              }`}
                              aria-label={`Switch to ${c.title}`}
                              title={c.title}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Title */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                      {activeCard.title}
                    </h2>

                    {/* Media Preview Thumbnail Banner */}
                    {activeCard.imageUrl && (
                      <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <img
                          src={activeCard.imageUrl}
                          alt={activeCard.imageAlt || activeCard.title}
                          className="w-full h-full object-cover opacity-90 transition-all duration-700"
                        />
                        {activeCard.credit && (
                          <span className="absolute bottom-3 right-4 px-2.5 py-1 rounded-md text-[10px] bg-black/70 backdrop-blur-md text-white/60">
                            {activeCard.credit}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Written Text Content */}
                    <div className="text-sm sm:text-base md:text-lg text-[var(--label-2)] leading-relaxed space-y-4 whitespace-pre-wrap font-light">
                      {activeCard.content}
                    </div>

                    {/* Previous / Next Card Navigation Buttons */}
                    {post.cards.length > 1 && (
                      <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                        <button
                          type="button"
                          disabled={activeCardIndex === 0}
                          onClick={() => setActiveCardIndex((prev) => Math.max(0, prev - 1))}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Previous Card</span>
                        </button>

                        <span className="text-xs font-mono text-zinc-400">
                          {activeCardIndex + 1} of {post.cards.length}
                        </span>

                        <button
                          type="button"
                          disabled={activeCardIndex === post.cards.length - 1}
                          onClick={() => setActiveCardIndex((prev) => Math.min(post.cards!.length - 1, prev + 1))}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          <span>Next Card</span>
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </article>
            );
          })()
        ) : (
          /* Fallback Classic Narrative Content */
          <article className="access-glass p-8 sm:p-12 md:p-14 space-y-6">
            <div className="text-base sm:text-lg text-[var(--label-2)] leading-relaxed whitespace-pre-wrap font-light space-y-4">
              {post.content}
            </div>
          </article>
        )}

        {/* Next Report or Return Hub */}
        <div className="pt-8">
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="access-glass p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-white/30 transition-all block"
            >
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
                  CONTINUE ANALYSIS • NEXT REPORT
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                  {nextPost.title}
                </h3>
                <p className="text-xs text-[var(--label-2)] line-clamp-1">
                  {nextPost.excerpt}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:translate-x-1.5 transition-transform shrink-0">
                <span>Read Next</span>
                <MoveRight className="w-4 h-4" />
              </div>
            </Link>
          ) : (
            <div className="text-center pt-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs uppercase tracking-wider text-white font-mono transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Blog Hub</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
