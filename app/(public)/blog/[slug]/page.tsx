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
import { motion, useScroll, useSpring } from "framer-motion";
import { toast } from "sonner";
import { BLOG_POSTS, BlogPost, getAllMergedPosts, findMergedPost } from "@/lib/blog";
import { CircularGallery, GalleryItem } from "@/components/blog/circular-gallery";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
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
      if (found.cards && found.cards.length > 0) {
        setActiveCardId(found.cards[0].id);
      }
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-6" style={{ fontFamily: "var(--font-ios)" }}>
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

  const nextPost = allPosts[(allPosts.indexOf(post) + 1) % allPosts.length] || BLOG_POSTS[0];

  // Convert post.cards into CircularGallery items
  const galleryItems: GalleryItem[] = (post.cards || []).map((card, idx) => ({
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

  const handleShare = async () => {
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
        <section className="relative w-full overflow-hidden my-4">
          <div className="text-center space-y-2 mb-2">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/50 font-semibold">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Interactive 3D Visual Gallery • {galleryItems.length} Key Perspectives</span>
            </div>
            <p className="text-xs text-[var(--label-3)]">
              Drag to spin or click any card to focus and jump to its chapter below.
            </p>
          </div>

          {/* 3D Rotating Cylinder */}
          <CircularGallery
            items={galleryItems}
            radius={post.galleryRadius || 600}
            autoRotateSpeed={0.015}
            activeId={activeCardId || undefined}
            onItemSelect={(item) => {
              setActiveCardId(item.id || null);
              if (item.id) {
                const el = document.getElementById(`section-${item.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
            }}
          />
        </section>
      )}

      {/* WRITTEN CONTENT SECTIONS BELOW THE ANIMATION */}
      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-12">
        {/* If post has cards, render each card's dedicated written story */}
        {post.cards && post.cards.length > 0 ? (
          <div className="space-y-12">
            {post.cards.map((card, idx) => (
              <article
                key={card.id || idx}
                id={`section-${card.id}`}
                className="access-glass p-8 sm:p-12 md:p-14 space-y-6 scroll-mt-28 relative overflow-hidden group transition-all duration-300"
              >
                {/* Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/15">
                      Card {String(idx + 1).padStart(2, "0")} / {String(post.cards?.length).padStart(2, "0")}
                    </span>
                    {card.subtitle && (
                      <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
                        {card.subtitle}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={scrollToTop}
                    className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>To 3D Gallery</span>
                    <ArrowUp className="w-3 h-3" />
                  </button>
                </div>

                {/* Card Title */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  {card.title}
                </h2>

                {/* Media preview thumbnail banner */}
                {card.imageUrl && (
                  <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={card.imageUrl}
                      alt={card.imageAlt || card.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-102 transition-all duration-700"
                    />
                    {card.credit && (
                      <span className="absolute bottom-3 right-4 px-2.5 py-1 rounded-md text-[10px] bg-black/70 backdrop-blur-md text-white/60">
                        {card.credit}
                      </span>
                    )}
                  </div>
                )}

                {/* Written text content */}
                <div className="text-sm sm:text-base md:text-lg text-[var(--label-2)] leading-relaxed space-y-4 whitespace-pre-wrap font-light">
                  {card.content}
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Fallback Classic Narrative Content */
          <article className="access-glass p-8 sm:p-12 md:p-14 space-y-6">
            <div className="text-base sm:text-lg text-[var(--label-2)] leading-relaxed whitespace-pre-wrap font-light space-y-4">
              {post.content}
            </div>
          </article>
        )}

        {/* Next Article Card */}
        <div className="pt-16">
          <Link
            href={`/blog/${nextPost.slug}`}
            className="access-glass p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-white/30 transition-all block"
          >
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
                CONTINUE ANALYSIS • NEXT ARTICLE
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
        </div>
      </main>
    </div>
  );
}
