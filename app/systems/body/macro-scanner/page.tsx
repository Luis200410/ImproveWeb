'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
    ArrowLeft,
    Camera,
    CameraOff,
    Flame,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    ScanLine,
    Minus,
    Plus,
    X,
    Zap,
    Activity,
    Upload,
    Image as ImageIcon
} from 'lucide-react'
import { dataStore } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'

/* ─── Types ─────────────────────────────────────────────────── */
interface FoodItem {
    name: string
    weight_g: number
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    confidence: number
}

interface ScanResult {
    items: FoodItem[]
    total_calories: number
    total_protein_g: number
    total_carbs_g: number
    total_fat_g: number
    fuel_grade: number
    summary: string
    portion_reference: string
}

type ScanState = 'idle' | 'scanning' | 'analysing' | 'result' | 'logged'

/* ─── Helpers ────────────────────────────────────────────────── */
function gradeColor(grade: number) {
    if (grade >= 8) return '#22c55e'  // green-500
    if (grade >= 6) return '#eab308'  // yellow-500
    if (grade >= 4) return '#f97316'  // orange-500
    return '#ef4444'                  // red-500
}

function gradeLabel(grade: number) {
    if (grade >= 8) return 'Pro-level Fuel ✅'
    if (grade >= 6) return 'Solid Fuel ⚡'
    if (grade >= 4) return 'Average Fuel ⚠️'
    return 'Weak Fuel ❌'
}

function toLocalIso(d: Date): string {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = Math.min(100, (value / max) * 100)
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/60 uppercase tracking-widest">
                <span>{label}</span>
                <span className="text-white font-semibold">{Math.round(value)}g</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                />
            </div>
        </div>
    )
}

/* ─── Component ─────────────────────────────────────────────── */
export default function MacroScannerPage() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const [scanState, setScanState] = useState<ScanState>('idle')
    const [cameraActive, setCameraActive] = useState(false)
    const [result, setResult] = useState<ScanResult | null>(null)
    const [editableItems, setEditableItems] = useState<FoodItem[]>([])
    const [error, setError] = useState<string | null>(null)
    const [userId, setUserId] = useState('defaultUser')
    const [scanProgress, setScanProgress] = useState(0)
    const [cameraError, setCameraError] = useState(false)
    const startingCameraRef = useRef(false)

    const fileInputRefUpload = useRef<HTMLInputElement>(null)
    const fileInputRefCapture = useRef<HTMLInputElement>(null)



    const startCamera = useCallback(async () => {
        setCameraError(false)
        setError(null)
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API not supported or requires secure HTTPS connection.");
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                // Trigger play with a retry if it fails
                try {
                    await videoRef.current.play()
                } catch (playErr) {
                    console.warn('First play try failed, retrying...', playErr)
                    // Sometimes on mobile it needs a second to catch
                    setTimeout(() => {
                        videoRef.current?.play().catch(e => console.error('Play retry still failed:', e))
                    }, 500)
                }
            }
            setCameraActive(true)
        } catch (e: any) {
            console.error(e)
            setCameraError(true)
            setError(e.message || 'Camera access denied. Please allow camera permissions.')
        } finally {
            startingCameraRef.current = false
        }
    }, [])

    const stopCamera = useCallback(() => {
        if (captureIntervalRef.current) clearInterval(captureIntervalRef.current)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setCameraActive(false)
        setScanState('idle')
        setScanProgress(0)
    }, [])

    useEffect(() => {
        let mounted = true
        const load = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user && mounted) {
                setUserId(user.id)
            }
            // Only start if not active and not already starting
            if (!streamRef.current && !startingCameraRef.current && mounted) {
                startingCameraRef.current = true
                startCamera();
            }
        }
        load()
        return () => {
            mounted = false
            stopCamera()
        }
    }, [startCamera, stopCamera])

    /* ── Capture frame → base64 ── */
    const captureFrame = useCallback((): string | null => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || video.readyState < 2) return null

        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        const ctx = canvas.getContext('2d')
        if (!ctx) return null
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75)
        return dataUrl.split(',')[1] // strip "data:image/jpeg;base64,"
    }, [])

    /* ── Analyze Base64 ── */
    const analyzeBase64 = async (base64: string) => {
        setError(null)
        setScanProgress(0)
        setResult(null)
        setEditableItems([])
        setScanState('analysing')

        try {
            const res = await fetch('/api/ai/macro-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Analysis failed')

            setResult(data)
            setEditableItems(data.items.map((i: FoodItem) => ({ ...i })))
            setScanState('result')
            stopCamera() // Stop camera if it was running, to show results properly
        } catch (err: any) {
            setError(err.message || 'Something went wrong.')
            setScanState('idle')
        }
    }

    /* ── Handle File Upload / Camera Capture ── */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64String = reader.result as string
            const base64Data = base64String.split(',')[1] // remove data prefix
            analyzeBase64(base64Data)
        }
        reader.readAsDataURL(file)
        e.target.value = '' // reset input
    }

    /* ── Trigger scan ── */
    const handleScanLive = useCallback(async () => {
        if (!cameraActive) return
        setError(null)
        setScanProgress(0)

        const base64 = captureFrame()
        if (!base64) {
            setError('Failed to capture frame from camera.')
            setScanState('idle')
            return
        }
        analyzeBase64(base64)
    }, [cameraActive, captureFrame])

    /* ── Edit weight ── */
    const adjustWeight = (idx: number, delta: number) => {
        setEditableItems(prev => {
            const updated = [...prev]
            const item = { ...updated[idx] }
            const newWeight = Math.max(5, item.weight_g + delta)
            const ratio = newWeight / item.weight_g
            item.calories = Math.round(item.calories * ratio)
            item.protein_g = Math.round(item.protein_g * ratio * 10) / 10
            item.carbs_g = Math.round(item.carbs_g * ratio * 10) / 10
            item.fat_g = Math.round(item.fat_g * ratio * 10) / 10
            item.weight_g = newWeight
            updated[idx] = item
            return updated
        })
    }

    const removeItem = (idx: number) => {
        setEditableItems(prev => prev.filter((_, i) => i !== idx))
    }

    /* ── Computed totals (live from editable items) ── */
    const totals = editableItems.reduce(
        (acc, item) => ({
            calories: acc.calories + item.calories,
            protein_g: acc.protein_g + item.protein_g,
            carbs_g: acc.carbs_g + item.carbs_g,
            fat_g: acc.fat_g + item.fat_g,
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    )

    /* ── Log meal ── */
    const handleLog = async () => {
        if (!result) return
        const today = toLocalIso(new Date())

        try {
            // ── Purge diet entries older than 30 days ──────────────────
            // We only keep 1 month of macro data to track monthly progress.
            // After that window, data has served its purpose and is deleted.
            const supabase = createClient()
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - 30)
            await supabase
                .from('entries')
                .delete()
                .eq('microapp_id', 'diet')
                .eq('user_id', userId)
                .lt('created_at', cutoff.toISOString())
            // Silent — no error thrown if this fails; logging still continues

            await dataStore.addEntry(userId, 'diet', {
                Date: today,
                Meal: result.summary,
                'Plate Build': editableItems.map(i => i.name).join(', '),
                Calories: Math.round(totals.calories),
                'Protein (g)': Math.round(totals.protein_g),
                'Carbs (g)': Math.round(totals.carbs_g),
                'Fats (g)': Math.round(totals.fat_g),
                'Prep Time (min)': 0,
                'Mood After': '',
                'Hydration (glasses)': 0,
                Notes: `AI Scanned · Fuel Grade ${result.fuel_grade}/10 · ${editableItems.length} components identified`
            })
            setScanState('logged')
        } catch (err: any) {
            setError('Failed to save meal: ' + err.message)
        }
    }

    /* ── Reset ── */
    const handleReset = () => {
        setResult(null)
        setEditableItems([])
        setError(null)
        setScanProgress(0)
        setScanState('idle')
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-black to-black" />
                <div className="absolute -left-16 top-24 w-[520px] h-[520px] bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.08),transparent_60%)] blur-3xl" />
                <div className="absolute right-0 top-40 w-[400px] h-[400px] bg-[radial-gradient(circle_at_70%_20%,rgba(234,179,8,0.05),transparent_60%)] blur-3xl" />
            </div>

            <Navigation />
            <div className="h-16" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 text-white/60 mb-8 mt-2">
                    <Link href="/systems/body" className="flex items-center gap-2 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" /> Body
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="uppercase tracking-[0.3em] text-xs">Macro Scanner</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    {/* Hero text */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <ScanLine className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-[0.35em]">Vision-First · Scan-and-Delete</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Live Macro<br />
                            <span className="text-white/40">Scanner</span>
                        </h1>
                        <p className="text-white/55 max-w-xl">
                            Point your camera at any meal. AI identifies every component, estimates weights,
                            and gives you your Basketball Fuel Grade — no photo stored, ever.
                        </p>
                    </div>

                    {/* ─── Camera Viewfinder ───────────────────────── */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] w-full max-h-[70vh] aspect-[4/5] md:aspect-video">

                        {/* Video feed */}
                        <video
                            ref={videoRef}
                            playsInline
                            muted
                            className={`w-full h-full object-cover transition-opacity duration-500 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
                        />

                        {/* Canvas (hidden, used for frame capture) */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Hidden File Inputs */}
                        <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRefCapture} onChange={handleFileSelect} />
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRefUpload} onChange={handleFileSelect} />

                        {/* Idle / error state */}
                        {!cameraActive && scanState === 'idle' && !result && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/60 backdrop-blur-sm z-10 px-4">
                                <div className="w-16 h-16 rounded-full border border-white/15 bg-white/5 flex items-center justify-center mb-2">
                                    {cameraError
                                        ? <CameraOff className="w-7 h-7 text-red-400" />
                                        : <Camera className="w-7 h-7 text-white/60" />
                                    }
                                </div>
                                <div className="text-center">
                                    <p className="text-white/80 font-medium">
                                        {cameraError ? 'Camera Unavailable' : 'Starting Camera...'}
                                    </p>
                                    {cameraError && (
                                        <p className="text-white/40 text-sm mt-2 max-w-[280px] mx-auto leading-relaxed">
                                            Please use the buttons below to upload or take a photo instead.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Scanning overlay */}
                        {cameraActive && scanState === 'idle' && (
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Corner guides */}
                                {[
                                    'top-4 left-4 border-t-2 border-l-2',
                                    'top-4 right-4 border-t-2 border-r-2',
                                    'bottom-4 left-4 border-b-2 border-l-2',
                                    'bottom-4 right-4 border-b-2 border-r-2',
                                ].map((cls, i) => (
                                    <div key={i} className={`absolute w-7 h-7 border-white/50 rounded-sm ${cls}`} />
                                ))}
                                {/* Privacy badge */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[10px] uppercase tracking-widest text-white/60">No image stored</span>
                                </div>
                            </div>
                        )}

                        {/* Scanning animation */}
                        {(scanState === 'scanning' || scanState === 'analysing') && (
                            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4">
                                {scanState === 'scanning' && (
                                    <>
                                        <motion.div
                                            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                                            animate={{ top: ['10%', '90%', '10%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        />
                                        <div className="text-center z-10">
                                            <p className="text-emerald-400 font-medium tracking-widest uppercase text-sm">Scanning...</p>
                                            <div className="mt-3 h-1 w-48 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-emerald-400 rounded-full"
                                                    style={{ width: `${scanProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {scanState === 'analysing' && (
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                                        <p className="text-white/80 font-medium tracking-widest uppercase text-sm">Analysing nutrients...</p>
                                        <p className="text-white/40 text-xs mt-2">AI is identifying components & estimating portions</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Scan / Stop buttons & Additional Inputs */}
                    {scanState !== 'logged' && (
                        <div className="space-y-4">
                            {cameraActive && (
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleScanLive}
                                        disabled={scanState === 'analysing' || scanState === 'scanning'}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-14 text-base tracking-wide"
                                    >
                                        <ScanLine className="w-5 h-5 mr-2" />
                                        {scanState === 'result' ? 'Scan Again' : 'Scan Live View'}
                                    </Button>
                                    <Button
                                        onClick={stopCamera}
                                        variant="outline"
                                        className="border-white/15 text-white hover:bg-white/10 h-14 px-5"
                                    >
                                        <CameraOff className="w-5 h-5" />
                                    </Button>
                                </div>
                            )}

                            {/* Manual Inputs Always Available */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => fileInputRefCapture.current?.click()}
                                    disabled={scanState === 'analysing' || scanState === 'scanning'}
                                    variant="outline"
                                    className="flex-1 border-white/15 bg-white/5 hover:bg-white/10 h-14"
                                >
                                    <Camera className="w-4 h-4 mr-2 text-white/60" />
                                    Take Photo
                                </Button>
                                <Button
                                    onClick={() => fileInputRefUpload.current?.click()}
                                    disabled={scanState === 'analysing' || scanState === 'scanning'}
                                    variant="outline"
                                    className="flex-1 border-white/15 bg-white/5 hover:bg-white/10 h-14"
                                >
                                    <ImageIcon className="w-4 h-4 mr-2 text-white/60" />
                                    Upload
                                </Button>
                                {!cameraActive && !cameraError && scanState !== 'result' && (
                                    <Button
                                        onClick={startCamera}
                                        disabled={scanState === 'analysing' || scanState === 'scanning'}
                                        variant="outline"
                                        className="border-white/15 bg-white/5 hover:bg-white/10 h-14 px-5"
                                    >
                                        <ScanLine className="w-4 h-4 text-emerald-400" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4"
                        >
                            <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-red-300 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* ─── Result Panel ──────────────────────────── */}
                    <AnimatePresence>
                        {scanState === 'result' && result && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-4"
                            >
                                {/* Fuel Grade Hero */}
                                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-1">Fuel Grade</p>
                                            <div className="flex items-baseline gap-2">
                                                <span
                                                    className="text-6xl font-black"
                                                    style={{ color: gradeColor(result.fuel_grade) }}
                                                >
                                                    {result.fuel_grade.toFixed(1)}
                                                </span>
                                                <span className="text-white/40 text-2xl">/10</span>
                                            </div>
                                            <p className="text-white/70 font-medium mt-1">{gradeLabel(result.fuel_grade)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Total</p>
                                            <p className="text-4xl font-bold">{Math.round(totals.calories)}</p>
                                            <p className="text-white/50 text-sm">kcal</p>
                                        </div>
                                    </div>

                                    <p className="text-white/60 text-sm mt-4 border-t border-white/10 pt-4">
                                        {result.summary}
                                    </p>

                                    {/* Macro bars */}
                                    <div className="mt-4 space-y-2">
                                        <MacroBar label="Protein" value={totals.protein_g} max={200} color="#22c55e" />
                                        <MacroBar label="Carbs" value={totals.carbs_g} max={300} color="#eab308" />
                                        <MacroBar label="Fat" value={totals.fat_g} max={100} color="#f97316" />
                                    </div>

                                    {/* Privacy confirm */}
                                    <div className="mt-4 flex items-center gap-2 text-[11px] text-white/35 uppercase tracking-widest">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
                                        Visual data deleted · metadata only
                                    </div>
                                </div>

                                {/* Food Items (editable) */}
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-[0.3em] text-white/50 px-1">
                                        Identified Components · tap ±25g to adjust
                                    </p>
                                    {editableItems.length === 0 && (
                                        <p className="text-white/40 text-sm px-1">No food items detected. Try scanning again.</p>
                                    )}
                                    {editableItems.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                                                <p className="text-white/50 text-xs">
                                                    {item.calories} kcal · P {item.protein_g}g · C {item.carbs_g}g · F {item.fat_g}g
                                                </p>
                                            </div>

                                            {/* Weight adjuster */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => adjustWeight(idx, -25)}
                                                    className="w-7 h-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center hover:border-white/40 transition text-white/70"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-14 text-center text-sm text-white/80 font-mono">{item.weight_g}g</span>
                                                <button
                                                    onClick={() => adjustWeight(idx, +25)}
                                                    className="w-7 h-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center hover:border-white/40 transition text-white/70"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(idx)}
                                                className="w-7 h-7 shrink-0 rounded-full border border-white/10 flex items-center justify-center hover:border-red-500/50 hover:text-red-400 transition text-white/30"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleLog}
                                        disabled={editableItems.length === 0}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-14 text-base"
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Log This Meal
                                    </Button>
                                    <Button
                                        onClick={handleReset}
                                        variant="outline"
                                        className="border-white/15 text-white hover:bg-white/10 h-14 px-5"
                                    >
                                        Discard
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ─── Logged State ───────────────────────────── */}
                    <AnimatePresence>
                        {scanState === 'logged' && result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.1 }}
                                    className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center"
                                >
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                </motion.div>
                                <div>
                                    <p className="text-2xl font-bold text-white">Meal Logged!</p>
                                    <p className="text-white/60 mt-1">
                                        {Math.round(totals.calories)} kcal added to today&apos;s fuel
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-6 text-sm">
                                    <div className="text-center">
                                        <p className="text-emerald-400 font-bold text-xl">{result.fuel_grade.toFixed(1)}/10</p>
                                        <p className="text-white/50 text-xs uppercase tracking-widest">Fuel Grade</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/15" />
                                    <div className="text-center">
                                        <p className="text-white font-bold text-xl">{Math.round(totals.protein_g)}g</p>
                                        <p className="text-white/50 text-xs uppercase tracking-widest">Protein</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/15" />
                                    <div className="text-center">
                                        <p className="text-white font-bold text-xl">{editableItems.length}</p>
                                        <p className="text-white/50 text-xs uppercase tracking-widest">Components</p>
                                    </div>
                                </div>

                                {/* Privacy confirmation */}
                                <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-400/70 uppercase tracking-widest">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Visual data deleted
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleReset}
                                        className="flex-1 bg-white text-black hover:bg-white/90"
                                    >
                                        <ScanLine className="w-4 h-4 mr-2" />
                                        Scan Another
                                    </Button>
                                    <Button asChild variant="outline" className="border-white/15 text-white hover:bg-white/10">
                                        <Link href="/systems/body/diet">
                                            View Diet Log
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ─── Info strip ─── */}
                    <div className="grid sm:grid-cols-3 gap-3 pt-2">
                        {[
                            { icon: <Flame className="w-4 h-4 text-orange-400" />, title: 'Fuel Grade', body: 'Every meal scored 1–10 based on your basketball journey nutrition targets.' },
                            { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, title: 'Scan & Delete', body: 'Zero image retention. Only macro numbers are stored — never your photo.' },
                            { icon: <Activity className="w-4 h-4 text-blue-400" />, title: 'Portion Scaling', body: 'AI uses plate or fork size as a reference to estimate grams accurately.' },
                        ].map((card, i) => (
                            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.03] p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    {card.icon}
                                    <span className="text-xs uppercase tracking-[0.25em] text-white/60">{card.title}</span>
                                </div>
                                <p className="text-white/50 text-xs leading-relaxed">{card.body}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick log tip */}
                    <div className="flex items-start gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-4">
                        <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-white/70 text-sm font-medium">Speed tip</p>
                            <p className="text-white/40 text-xs mt-0.5">
                                Place your fork or plate in frame for the most accurate portion estimates. Complex meals: tap ±25g per food item to fine-tune before logging.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
