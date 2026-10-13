"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Eye, 
  Code, 
  Save, 
  ExternalLink, 
  Layers, 
  Image as ImageIcon, 
  ArrowLeft, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown,
  Check,
  Sliders,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { BlogPost, BlogGalleryCard, BLOG_POSTS, saveStoredCustomPost, deleteStoredCustomPost } from "@/lib/blog";
import { CircularGallery, GalleryItem } from "@/components/blog/circular-gallery";

const PHOTO_PRESETS = [
  { label: "Technology / Circuits", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop" },
  { label: "Deep Work / Desk", url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop" },
  { label: "Knowledge / Books", url: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=1200&auto=format&fit=crop" },
  { label: "Mind / Meditation", url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop" },
  { label: "Network / People", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop" },
  { label: "Sovereign Cosmos", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("The Next Frontier of Intentional Systems");
  const [slug, setSlug] = useState("the-next-frontier-of-intentional-systems");
  const [category, setCategory] = useState("Productivity");
  const [author, setAuthor] = useState("IMPROVE Research");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [readingTime, setReadingTime] = useState("5 min");
  const [coverImage, setCoverImage] = useState(PHOTO_PRESETS[0].url);
  const [excerpt, setExcerpt] = useState("A deep exploration into local intelligence and purposeful execution.");
  const [galleryRadius, setGalleryRadius] = useState(600);

  // Cards State
  const [cards, setCards] = useState<BlogGalleryCard[]>([
    {
      id: "card-1",
      title: "01 · Intentional Shielding",
      subtitle: "Focus • Attention Sovereignty",
      imageUrl: PHOTO_PRESETS[1].url,
      imageAlt: "Intentional Shielding",
      credit: "Unsplash / High Focus",
      content: "### The Power of Silent Friction\n\nWhen distraction is structurally blocked before reaching consciousness, your focus velocity doubles. Here we analyze how on-device rules eliminate cognitive friction.",
    },
    {
      id: "card-2",
      title: "02 · Local Neural Cortex",
      subtitle: "Mind • On-Device AI",
      imageUrl: PHOTO_PRESETS[3].url,
      imageAlt: "Local Neural Cortex",
      credit: "Unsplash / Private Intelligence",
      content: "### Total Psychological Safety\n\nReflecting honestly requires knowing your words never leave the device. When thoughts stay on local silicon, clarity replaces performative logging.",
    },
    {
      id: "card-3",
      title: "03 · The Unified Habit Loop",
      subtitle: "Execution • Closed Circuit",
      imageUrl: PHOTO_PRESETS[0].url,
      imageAlt: "Unified Habit Loop",
      credit: "Unsplash / System Interconnect",
      content: "### Closing the Loop Between Thought and Action\n\nA Second Brain plans; the Productivity engine executes. Syncing them seamlessly ensures plans turn into finished work every day.",
    },
  ]);

  // Load existing posts from API
  const loadPosts = async () => {
    try {
      const res = await fetch("/api/blog/posts");
      const data = await res.json();
      if (data.posts && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch {
      setPosts(BLOG_POSTS);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!selectedSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSetCardCount = (targetCount: number) => {
    if (targetCount < 1) return;
    if (targetCount === cards.length) return;

    if (targetCount > cards.length) {
      const added: BlogGalleryCard[] = [];
      for (let i = cards.length; i < targetCount; i++) {
        const preset = PHOTO_PRESETS[i % PHOTO_PRESETS.length];
        added.push({
          id: `card-${Date.now()}-${i}`,
          title: `0${i + 1} · New Perspective`,
          subtitle: `Chapter ${i + 1} • Focus Area`,
          imageUrl: preset.url,
          imageAlt: `Perspective ${i + 1}`,
          credit: preset.label,
          content: `### Chapter ${i + 1} Analysis\n\nDetail your key insight, strategy, or breakdown for this pillar here.`,
        });
      }
      setCards([...cards, ...added]);
    } else {
      setCards(cards.slice(0, targetCount));
    }
  };

  const handleAddCard = () => {
    const nextIdx = cards.length;
    const preset = PHOTO_PRESETS[nextIdx % PHOTO_PRESETS.length];
    setCards([
      ...cards,
      {
        id: `card-${Date.now()}`,
        title: `0${nextIdx + 1} · New Perspective`,
        subtitle: `Chapter ${nextIdx + 1} • Key Idea`,
        imageUrl: preset.url,
        imageAlt: "New Perspective",
        credit: preset.label,
        content: `### Chapter ${nextIdx + 1} Analysis\n\nWrite the detailed explanation for this card.`,
      },
    ]);
  };

  const handleRemoveCard = (index: number) => {
    if (cards.length <= 1) {
      toast.error("You need at least 1 card in a post.");
      return;
    }
    const updated = cards.filter((_, i) => i !== index);
    setCards(updated);
  };

  const handleMoveCard = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= cards.length) return;
    const copy = [...cards];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setCards(copy);
  };

  const handleCardFieldChange = (
    index: number,
    field: keyof BlogGalleryCard,
    value: string
  ) => {
    const copy = [...cards];
    copy[index] = { ...copy[index], [field]: value };
    setCards(copy);
  };

  const handleSelectPostToEdit = (slugToLoad: string) => {
    if (!slugToLoad) {
      // Clear to new post
      setSelectedSlug("");
      setTitle("New Sovereign Article");
      setSlug("new-sovereign-article");
      setCategory("Productivity");
      setExcerpt("Summary of the key insights explored in this post.");
      handleSetCardCount(3);
      return;
    }

    const postToLoad = posts.find((p) => p.slug === slugToLoad);
    if (!postToLoad) return;

    setSelectedSlug(postToLoad.slug);
    setTitle(postToLoad.title);
    setSlug(postToLoad.slug);
    setCategory(postToLoad.category);
    setAuthor(postToLoad.author);
    setDate(postToLoad.date);
    setReadingTime(postToLoad.readingTime);
    setCoverImage(postToLoad.image);
    setExcerpt(postToLoad.excerpt);
    setGalleryRadius(postToLoad.galleryRadius || 600);
    setCards(postToLoad.cards || []);
    toast.success(`Loaded "${postToLoad.title}"`);
  };

  const handleSavePost = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and slug are required.");
      return;
    }

    if (cards.length === 0) {
      toast.error("Add at least 1 card to publish.");
      return;
    }

    setIsSaving(true);
    const newPost: BlogPost = {
      slug,
      title,
      excerpt,
      category,
      author,
      date,
      readingTime,
      image: coverImage,
      galleryRadius,
      cards,
    };

    try {
      // 1. Save to localStorage for instant client hydration
      saveStoredCustomPost(newPost);

      // 2. Persist to API
      const res = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (res.ok) {
        toast.success(`Published post "${title}" successfully!`);
        await loadPosts();
        setSelectedSlug(slug);
      } else {
        toast.warning("Saved locally, server sync failed.");
      }
    } catch (e) {
      toast.error("Failed to save post.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedSlug) return;
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      deleteStoredCustomPost(selectedSlug);
      await fetch(`/api/blog/posts?slug=${selectedSlug}`, { method: "DELETE" });
      toast.success("Post deleted.");
      await loadPosts();
      handleSelectPostToEdit("");
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  // Convert current cards to preview GalleryItem format
  const previewGalleryItems: GalleryItem[] = cards.map((c, idx) => ({
    id: c.id,
    common: c.title,
    binomial: c.subtitle || `Pillar ${idx + 1}`,
    photo: {
      url: c.imageUrl,
      text: c.imageAlt || c.title,
      by: c.credit || "Author",
    },
    content: c.content,
  }));

  return (
    <div className="min-h-screen text-white pb-32 pt-28 px-4 sm:px-6 md:px-8" style={{ fontFamily: "var(--font-ios)" }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Studio Bar */}
        <div className="access-glass p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-xl font-bold tracking-tight text-white">IMPROVE Blog Studio</h1>
              </div>
              <p className="text-xs text-[var(--label-3)]">
                Create & customize 3D Circular Gallery posts with dedicated chapters
              </p>
            </div>
          </div>

          {/* Mode Switcher & Save Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "edit"
                    ? "bg-white text-black shadow-md font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-white text-black shadow-md font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live 3D Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSavePost}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? "Saving..." : "Publish Post"}</span>
            </button>

            {slug && (
              <Link
                href={`/blog/${slug}`}
                target="_blank"
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <span>View Live</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Existing Post Selector Bar */}
        <div className="access-glass p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Load Post:</span>
            <select
              value={selectedSlug}
              onChange={(e) => handleSelectPostToEdit(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
            >
              <option value="">+ Create Brand New Post</option>
              {posts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title} ({p.cards?.length || 0} cards)
                </option>
              ))}
            </select>
          </div>

          {selectedSlug && (
            <button
              type="button"
              onClick={handleDeletePost}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete This Post</span>
            </button>
          )}
        </div>

        {/* TAB 1: EDITOR MODE */}
        {activeTab === "edit" && (
          <div className="space-y-8">
            {/* 1. Article Settings Grid */}
            <div className="access-glass p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>1. Article Meta & Overview</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-xs text-zinc-400 font-medium">Post Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter inspiring title..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Pillar / Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white/30 cursor-pointer"
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Mind">Mind</option>
                    <option value="Knowledge">Knowledge</option>
                    <option value="Relationships">Relationships</option>
                    <option value="Work">Work</option>
                    <option value="Body">Body</option>
                    <option value="Philosophy">Philosophy</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Reading Time</label>
                  <input
                    type="text"
                    value={readingTime}
                    onChange={(e) => setReadingTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                  <label className="text-xs text-zinc-400 font-medium">Excerpt (Preview sentence)</label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Clear, compelling synopsis of the article..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>

            {/* 2. Circular 3D Cards Controller */}
            <div className="access-glass p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>2. 3D Circular Cards & Chapter Text</span>
                  </h2>
                  <p className="text-xs text-[var(--label-2)]">
                    Each card spins in the top 3D circular cylinder AND has its own story typed below it!
                  </p>
                </div>

                {/* Amount of Cards Quick Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">Total Cards:</span>
                  <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                    {[3, 4, 5, 6, 7].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetCardCount(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          cards.length === num
                            ? "bg-white text-black shadow-md"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCard}
                    className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-6">
                {cards.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-5 relative group"
                  >
                    {/* Card Header Bar */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-white/10 text-white text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-white">Card #{idx + 1}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoveCard(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move card up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCard(idx, "down")}
                          disabled={idx === cards.length - 1}
                          className="p-1 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move card down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(idx)}
                          className="p-1 rounded-md text-red-400 hover:text-red-300 ml-2 cursor-pointer"
                          title="Delete card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Card Meta Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-medium">Card Title (in 3D Gallery)</label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => handleCardFieldChange(idx, "title", e.target.value)}
                          placeholder="e.g., 01 · Relational Capital"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-white/30 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 font-medium">Card Subtitle / Pillar Badge</label>
                        <input
                          type="text"
                          value={card.subtitle || ""}
                          onChange={(e) => handleCardFieldChange(idx, "subtitle", e.target.value)}
                          placeholder="e.g., Relationships • Social Cadence"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-white/30 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 font-medium">Photo Credit</label>
                        <input
                          type="text"
                          value={card.credit || ""}
                          onChange={(e) => handleCardFieldChange(idx, "credit", e.target.value)}
                          placeholder="e.g., Unsplash / Author"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-white/30 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 md:col-span-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-zinc-400 font-medium">Card Image URL</label>
                          <div className="flex items-center gap-1.5 overflow-x-auto">
                            <span className="text-[10px] text-zinc-500">Presets:</span>
                            {PHOTO_PRESETS.slice(0, 3).map((p, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => handleCardFieldChange(idx, "imageUrl", p.url)}
                                className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer"
                              >
                                {p.label.split("/")[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={card.imageUrl}
                          onChange={(e) => handleCardFieldChange(idx, "imageUrl", e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-white/30 font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    {/* THE WRITTEN STORY BELOW THAT ANIMATION */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>Written Story Below Animation for Card #{idx + 1}</span>
                        </label>
                        <span className="text-[10px] text-zinc-400">Supports Markdown / Paragraphs</span>
                      </div>
                      <textarea
                        rows={6}
                        value={card.content}
                        onChange={(e) => handleCardFieldChange(idx, "content", e.target.value)}
                        placeholder="Write the comprehensive analysis, insights, quotes, and takeaways for this card..."
                        className="w-full p-4 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-white/30 text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE 3D PREVIEW MODE */}
        {activeTab === "preview" && (
          <div className="space-y-12">
            <div className="access-glass p-8 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Interactive 3D Preview • {category}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white">{title}</h1>
              <p className="text-sm sm:text-base text-[var(--label-2)] max-w-2xl mx-auto">{excerpt}</p>
            </div>

            {/* Live 3D Circular Cylinder */}
            <div className="access-glass p-6 overflow-hidden">
              <CircularGallery items={previewGalleryItems} radius={galleryRadius} />
            </div>

            {/* Live Written Content Below */}
            <div className="space-y-8 max-w-4xl mx-auto">
              <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-400 text-center font-bold">
                WRITTEN CHAPTERS PREVIEW
              </h3>
              {cards.map((c, i) => (
                <div key={c.id || i} className="access-glass p-8 sm:p-12 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white">
                      Chapter 0{i + 1} / 0{cards.length}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
                      {c.subtitle}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">{c.title}</h3>
                  {c.imageUrl && (
                    <div className="aspect-[21/9] w-full rounded-xl overflow-hidden border border-white/10 bg-black/50">
                      <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="text-sm md:text-base text-[var(--label-2)] leading-relaxed whitespace-pre-wrap font-light pt-2">
                    {c.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
