'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { DiveVoice, DiveVoicePlatform } from '@/components/dive/dive-voices';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Upload,
  Plus,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

function detectPlatform(url: string): DiveVoicePlatform {
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('x.com') || lower.includes('twitter.com')) return 'x';
  return 'other';
}

export function DiveVoicesManager() {
  const supabase = createClient();

  const [voices, setVoices] = useState<DiveVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [linkUrl, setLinkUrl] = useState('');
  const [platform, setPlatform] = useState<DiveVoicePlatform>('instagram');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [gifted, setGifted] = useState(false);
  const [published, setPublished] = useState(false);

  const loadVoices = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dive_voices')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        toast.error(error.message || 'Failed to load Dive voices');
        setVoices([]);
      } else {
        setVoices((data || []) as DiveVoice[]);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  const handleLinkChange = (val: string) => {
    setLinkUrl(val);
    if (val.trim()) {
      setPlatform(detectPlatform(val));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('dive-voices')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        toast.error(`Photo upload failed: ${uploadError.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('dive-voices')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        setPhotoUrl(urlData.publicUrl);
        toast.success('Photo uploaded to dive-voices bucket');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !linkUrl.trim() || !photoUrl.trim()) {
      toast.error('Name, link, and photo are required.');
      return;
    }
    if (published && !consent) {
      toast.error('Cannot publish without written permission (consent).');
      return;
    }
    const cleanCountry = countryCode.trim().toUpperCase();
    if (cleanCountry && cleanCountry.length !== 2) {
      toast.error('Country code must be 2 letters (e.g. US).');
      return;
    }

    setSaving(true);
    try {
      const nextOrder =
        voices.length > 0
          ? Math.max(...voices.map((v) => v.sort_order ?? 0)) + 1
          : 0;

      const { error } = await supabase.from('dive_voices').insert({
        name: name.trim(),
        city: city.trim() || null,
        country_code: cleanCountry || null,
        role: role.trim() || null,
        photo_url: photoUrl.trim(),
        link_url: linkUrl.trim(),
        platform,
        quote: quote.trim().slice(0, 140) || null,
        gifted,
        consent,
        published: consent ? published : false,
        sort_order: nextOrder,
      });

      if (error) {
        toast.error(error.message || 'Failed to save voice');
        return;
      }

      toast.success('Dive voice added');
      setLinkUrl('');
      setPlatform('instagram');
      setName('');
      setCity('');
      setCountryCode('');
      setRole('');
      setQuote('');
      setPhotoUrl('');
      setConsent(false);
      setGifted(false);
      setPublished(false);
      await loadVoices();
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (voice: DiveVoice) => {
    if (!voice.published && !voice.consent) {
      toast.error('A row cannot be published unless written permission (consent) is checked.');
      return;
    }

    const { error } = await supabase
      .from('dive_voices')
      .update({ published: !voice.published })
      .eq('id', voice.id);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(!voice.published ? 'Published' : 'Unpublished');
    await loadVoices();
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= voices.length) return;

    const current = voices[index];
    const target = voices[targetIndex];

    const currentOrder = current.sort_order ?? index;
    const targetOrder = target.sort_order ?? targetIndex;

    const newCurrentOrder = currentOrder === targetOrder ? targetIndex : targetOrder;
    const newTargetOrder = currentOrder === targetOrder ? index : currentOrder;

    const [res1, res2] = await Promise.all([
      supabase.from('dive_voices').update({ sort_order: newCurrentOrder }).eq('id', current.id),
      supabase.from('dive_voices').update({ sort_order: newTargetOrder }).eq('id', target.id),
    ]);

    if (res1.error || res2.error) {
      toast.error('Failed to reorder');
      return;
    }
    await loadVoices();
  };

  const handleDelete = async (voice: DiveVoice) => {
    if (!window.confirm(`Delete "${voice.name}"?`)) return;
    const { error } = await supabase.from('dive_voices').delete().eq('id', voice.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Deleted');
    await loadVoices();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Add New Voice Form */}
      <form
        onSubmit={handleCreate}
        className="lg:col-span-5 access-glass p-6 space-y-4 h-fit"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Add Dive Voice
          </h2>
          <span className="text-[11px] font-mono text-zinc-400">
            Renders when 3+ published
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Link URL *</label>
            <input
              type="url"
              required
              value={linkUrl}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as DiveVoicePlatform)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="x">X</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-zinc-400 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Austin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Country (2-let)</label>
              <input
                type="text"
                maxLength={2}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="US"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white uppercase placeholder-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Product designer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-zinc-400">Quote (optional)</label>
              <span className="text-[10px] font-mono text-zinc-500">
                {quote.length}/140
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={140}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Short quote in their words..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Portrait Photo *</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white flex items-center justify-center gap-2 cursor-pointer transition-colors">
                {uploading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploading ? 'Uploading...' : photoUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-10 h-12 rounded-lg object-cover border border-white/15"
                />
              )}
            </div>
          </div>

          <div className="pt-2 space-y-2.5 border-t border-white/10">
            <label className="flex items-center gap-2.5 text-xs text-white/90 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setConsent(checked);
                  if (!checked) setPublished(false);
                }}
                className="rounded border-white/20 bg-black/60"
              />
              <span>They gave written permission</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={gifted}
                onChange={(e) => setGifted(e.target.checked)}
                className="rounded border-white/20 bg-black/60"
              />
              <span>Got Dive for free</span>
            </label>

            <label
              className={`flex items-center gap-2.5 text-xs ${
                consent ? 'text-white/90 cursor-pointer' : 'text-zinc-500 cursor-not-allowed'
              }`}
            >
              <input
                type="checkbox"
                checked={published}
                disabled={!consent}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-white/20 bg-black/60 disabled:opacity-40"
              />
              <span>Publish on /dive (requires permission)</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{saving ? 'Saving...' : 'Save Dive Voice'}</span>
        </button>
      </form>

      {/* Right: Voices List */}
      <div className="lg:col-span-7 access-glass p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Dive Voices ({voices.length})
            </h2>
            <p className="text-xs text-zinc-400">
              {voices.filter((v) => v.published && v.consent).length} published &amp; consented
            </p>
          </div>
          <button
            type="button"
            onClick={loadVoices}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400">Loading voices...</div>
        ) : voices.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl">
            No Dive voices yet. Add your first voice on the left.
          </div>
        ) : (
          <div className="space-y-3">
            {voices.map((voice, idx) => (
              <div
                key={voice.id}
                className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-4"
              >
                <img
                  src={voice.photo_url}
                  alt={voice.name}
                  className="w-12 h-14 rounded-xl object-cover flex-none border border-white/10"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white truncate">
                      {voice.name}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                      {voice.platform}
                    </span>
                    {voice.gifted && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                        Gifted Dive
                      </span>
                    )}
                    {!voice.consent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        No consent
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 truncate mt-0.5">
                    {[voice.role, voice.city, voice.country_code].filter(Boolean).join(' · ') || 'No details'}
                  </div>
                  {voice.quote && (
                    <p className="text-xs text-zinc-300 italic truncate mt-1">
                      &ldquo;{voice.quote}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-none">
                  <a
                    href={voice.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open original post"
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    title="Move up"
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === voices.length - 1}
                    title="Move down"
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTogglePublished(voice)}
                    disabled={!voice.published && !voice.consent}
                    title={
                      !voice.consent
                        ? 'Needs written permission before publishing'
                        : voice.published
                          ? 'Click to unpublish'
                          : 'Click to publish'
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      voice.published
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/[0.05] text-zinc-400 border border-white/10 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{voice.published ? 'Published' : 'Draft'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(voice)}
                    title="Delete"
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-zinc-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
