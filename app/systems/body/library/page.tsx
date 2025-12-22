'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Navigation } from '@/components/navigation'
import { dataStore, type Exercise, type FoodItem } from '@/lib/data-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Dumbbell, Utensils, ArrowLeft, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })
export default function LibraryPage() {
    const [exerciseQuery, setExerciseQuery] = useState('')
    const [foodQuery, setFoodQuery] = useState('')
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [foods, setFoods] = useState<FoodItem[]>([])
    const [loading, setLoading] = useState(false)
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
    const [editingFood, setEditingFood] = useState<FoodItem | null>(null)

    const resetExerciseForm = () => setEditingExercise({ id: '', name: '', primaryMuscles: [], secondaryMuscles: [], equipment: '', modality: 'reps' })
    const resetFoodForm = () => setEditingFood({ id: '', name: '' })

    const load = async () => {
        setLoading(true)
        const [exList, foodList] = await Promise.all([
            dataStore.listExercises({ search: exerciseQuery }),
            dataStore.listFoods({ search: foodQuery })
        ])
        setExercises(exList)
        setFoods(foodList)
        setLoading(false)
    }

    useEffect(() => {
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const saveExercise = async () => {
        if (!editingExercise || !editingExercise.name.trim()) return
        await dataStore.saveExercise(editingExercise)
        await load()
        setEditingExercise(null)
    }

    const saveFood = async () => {
        if (!editingFood || !editingFood.name.trim()) return
        await dataStore.saveFood(editingFood)
        await load()
        setEditingFood(null)
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-24 md:pt-28 pb-16 space-y-12">
                <div className="flex items-center gap-3 text-white/60">
                    <Link href="/systems/body" className="flex items-center gap-2 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="uppercase tracking-[0.3em] text-xs">Body Library</span>
                </div>

                <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/50">Explore</p>
                    <h1 className={`${playfair.className} text-5xl font-bold text-white`}>Exercises & Fuel</h1>
                    <p className={`${inter.className} text-white/60 max-w-3xl`}>
                        Browse everything we have. Drop exercises into blocks or meals into diet logs with a click.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Dumbbell className="w-5 h-5 text-white/60" />
                            <h2 className={`${playfair.className} text-2xl font-semibold`}>Exercises</h2>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={exerciseQuery}
                                onChange={(e) => setExerciseQuery(e.target.value)}
                                placeholder="Search movements, muscles, equipment..."
                                className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
                            />
                            <Button onClick={load} disabled={loading} className="bg-white text-black hover:bg-white/90">
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 space-y-3">
                                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Add / Edit Exercise</p>
                                <div className="space-y-2">
                                    <input
                                        value={editingExercise?.name || ''}
                                        onChange={(e) => setEditingExercise(prev => ({ ...(prev || { id: '' }), name: e.target.value }))}
                                        placeholder="Name"
                                        className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                    />
                                    <input
                                        value={editingExercise?.primaryMuscles?.join(', ') || ''}
                                        onChange={(e) => setEditingExercise(prev => ({ ...(prev || { id: '' }), primaryMuscles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                                        placeholder="Primary muscles (comma separated)"
                                        className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                    />
                                    <input
                                        value={editingExercise?.equipment || ''}
                                        onChange={(e) => setEditingExercise(prev => ({ ...(prev || { id: '' }), equipment: e.target.value }))}
                                        placeholder="Equipment"
                                        className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            value={editingExercise?.modality || 'reps'}
                                            onChange={(e) => setEditingExercise(prev => ({ ...(prev || { id: '' }), modality: e.target.value as 'reps' | 'time' }))}
                                            placeholder="Modality (reps/time)"
                                            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                        />
                                        <input
                                            value={editingExercise?.defaultReps || ''}
                                            onChange={(e) => setEditingExercise(prev => ({ ...(prev || { id: '' }), defaultReps: Number(e.target.value) || undefined }))}
                                            placeholder="Default reps"
                                            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                            type="number"
                                        />
                                        <input
                                            value={editingExercise?.defaultDurationSec || ''}
                                            onChange={(e) => setEditingExercise(prev => ({ ...(prev || { id: '' }), defaultDurationSec: Number(e.target.value) || undefined }))}
                                            placeholder="Default sec"
                                            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                            type="number"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            value={editingExercise?.difficulty || ''}
                                            onChange={(e) => setEditingExercise(prev => ({ ...(prev || { id: '' }), difficulty: e.target.value as Exercise['difficulty'] }))}
                                            placeholder="Difficulty (easy/medium/hard)"
                                            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                        />
                                        <input
                                            value={editingExercise?.energyBand || ''}
                                            onChange={(e) => setEditingExercise(prev => ({ ...(prev || { id: '' }), energyBand: e.target.value as Exercise['energyBand'] }))}
                                            placeholder="Energy (low/medium/high)"
                                            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                        />
                                    </div>
                                    <input
                                        value={editingExercise?.videoUrl || ''}
                                        onChange={(e) => setEditingExercise(prev => ({ ...(prev || { id: '' }), videoUrl: e.target.value }))}
                                        placeholder="Video URL"
                                        className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={saveExercise} disabled={loading || !editingExercise?.name.trim()} className="bg-white text-black hover:bg-white/90">
                                            Save Exercise
                                        </Button>
                                        <Button variant="ghost" onClick={() => { setEditingExercise(null); resetExerciseForm() }} className="border border-white/12 bg-white/5 text-white hover:border-white/30">
                                            New
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {exercises.map((ex) => (
                                        <motion.div
                                            key={ex.id}
                                            className="rounded-2xl border border-white/12 bg-white/[0.03] p-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-white font-semibold">{ex.name}</p>
                                                    <p className="text-white/50 text-sm">
                                                        {ex.primaryMuscles?.join(', ')} {ex.equipment ? `• ${ex.equipment}` : ''}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setEditingExercise(ex)}
                                                        className="text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white"
                                                    >
                                                        Edit
                                                    </button>
                                                    {ex.videoUrl && (
                                                        <a href={ex.videoUrl} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/50">
                                                {ex.modality && <span className="px-2 py-1 rounded-full border border-white/15">Mode: {ex.modality}</span>}
                                                {ex.difficulty && <span className="px-2 py-1 rounded-full border border-white/15">Difficulty: {ex.difficulty}</span>}
                                                {ex.energyBand && <span className="px-2 py-1 rounded-full border border-white/15">Energy: {ex.energyBand}</span>}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {exercises.length === 0 && (
                                        <p className="text-white/50 text-sm">No exercises yet. Seed the library to see results.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Utensils className="w-5 h-5 text-white/60" />
                            <h2 className={`${playfair.className} text-2xl font-semibold`}>Foods</h2>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={foodQuery}
                                onChange={(e) => setFoodQuery(e.target.value)}
                                placeholder="Search foods, brands, tags..."
                                className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
                            />
                            <Button onClick={load} disabled={loading} className="bg-white text-black hover:bg-white/90">
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 space-y-3">
                                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Add / Edit Food</p>
                                <div className="space-y-2">
                                    <input
                                        value={editingFood?.name || ''}
                                        onChange={(e) => setEditingFood(prev => ({ ...(prev || { id: '' }), name: e.target.value }))}
                                        placeholder="Name"
                                        className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            value={editingFood?.calories || ''}
                                            onChange={(e) => setEditingFood(prev => ({ ...(prev || { id: '' }), calories: Number(e.target.value) || undefined }))}
                                            placeholder="Calories"
                                            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                            type="number"
                                        />
                                        <input
                                            value={editingFood?.defaultServingGrams || ''}
                                            onChange={(e) => setEditingFood(prev => ({ ...(prev || { id: '' }), defaultServingGrams: Number(e.target.value) || undefined }))}
                                            placeholder="Serving (g)"
                                            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                            type="number"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            value={editingFood?.protein || ''}
                                            onChange={(e) => setEditingFood(prev => ({ ...(prev || { id: '' }), protein: Number(e.target.value) || undefined }))}
                                            placeholder="Protein (g)"
                                            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                            type="number"
                                        />
                                        <input
                                            value={editingFood?.carbs || ''}
                                            onChange={(e) => setEditingFood(prev => ({ ...(prev || { id: '' }), carbs: Number(e.target.value) || undefined }))}
                                            placeholder="Carbs (g)"
                                            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                            type="number"
                                        />
                                        <input
                                            value={editingFood?.fats || ''}
                                            onChange={(e) => setEditingFood(prev => ({ ...(prev || { id: '' }), fats: Number(e.target.value) || undefined }))}
                                            placeholder="Fats (g)"
                                            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                            type="number"
                                        />
                                    </div>
                                    <input
                                        value={editingFood?.tags?.join(', ') || ''}
                                        onChange={(e) => setEditingFood(prev => ({ ...(prev || { id: '' }), tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                                        placeholder="Tags (comma separated)"
                                        className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                    />
                                    <input
                                        value={editingFood?.sourceUrl || ''}
                                        onChange={(e) => setEditingFood(prev => ({ ...(prev || { id: '' }), sourceUrl: e.target.value }))}
                                        placeholder="Source URL"
                                        className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={saveFood} disabled={loading || !editingFood?.name.trim()} className="bg-white text-black hover:bg-white/90">
                                            Save Food
                                        </Button>
                                        <Button variant="ghost" onClick={() => { setEditingFood(null); resetFoodForm() }} className="border border-white/12 bg-white/5 text-white hover:border-white/30">
                                            New
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {foods.map(food => (
                                        <motion.div
                                            key={food.id}
                                            className="rounded-2xl border border-white/12 bg-white/[0.03] p-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-white font-semibold">{food.name}</p>
                                                    <p className="text-white/50 text-sm">
                                                        {food.calories ? `${food.calories} kcal` : '—'} {food.protein ? `• ${food.protein}g protein` : ''}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setEditingFood(food)}
                                                        className="text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white"
                                                    >
                                                        Edit
                                                    </button>
                                                    {food.sourceUrl && (
                                                        <a href={food.sourceUrl} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/50">
                                                {food.tags?.slice(0, 4).map(tag => (
                                                    <span key={tag} className="px-2 py-1 rounded-full border border-white/15">{tag}</span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {foods.length === 0 && (
                                        <p className="text-white/50 text-sm">No foods yet. Seed the library to see results.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
