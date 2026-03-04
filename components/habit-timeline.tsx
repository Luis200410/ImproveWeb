'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Entry, dataStore } from '@/lib/data-store'
import { sileo } from 'sileo'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Check, Edit2, Trash2, ArrowLeft, ArrowRight, Zap, Play } from 'lucide-react'
import { Timeline } from '@/components/ui/timeline'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

function HabitStreakShape({ entry, visibleDate }: { entry: Entry, visibleDate: Date }) {
    const todayKey = new Date().toISOString().split('T')[0];
    const completedDates = entry.data['completedDates'] || [];

    const getWeekRange = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        const week = [];
        for (let i = 0; i < 7; i++) {
            const next = new Date(monday);
            next.setDate(monday.getDate() + i);
            week.push(next);
        }
        return week;
    }

    const weekDates = getWeekRange(visibleDate);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const frequency = entry.data['frequency'] || 'daily';
    const repeatDays = entry.data['repeatDays'] || [];

    const scheduledDates = weekDates.filter(d => {
        if (frequency === 'daily') return true;
        const dayName = weekdays[d.getDay()];
        return repeatDays.includes(dayName);
    });

    const statuses = scheduledDates.map(dateObj => {
        const dateStr = dateObj.toISOString().split('T')[0];
        const isCompleted = completedDates.includes(dateStr);
        if (isCompleted) return 'completed';
        if (dateStr > todayKey) return 'future';
        return 'missed';
    });

    const weeklyProgress = statuses.filter(s => s === 'completed').length;

    const N = statuses.length;
    const size = 56;
    const center = size / 2;
    const radius = size / 2 - 4;

    const getColor = (status: string) => {
        if (status === 'completed') return '#10b981';
        if (status === 'missed') return '#ef4444';
        return '#3f3f46';
    }

    const renderShapeContent = () => {
        if (N === 0) {
            return (
                <svg width={size} height={size}>
                    <circle cx={center} cy={center} r={radius} stroke="#3f3f46" strokeWidth={4} fill="none" strokeDasharray="4 4" />
                    <text x={center} y={center + 1} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="16" className="font-mono font-bold">{weeklyProgress}</text>
                </svg>
            );
        }

        if (N === 1) {
            return (
                <svg width={size} height={size}>
                    <circle cx={center} cy={center} r={radius} stroke={getColor(statuses[0])} strokeWidth={4} fill="none" />
                    <text x={center} y={center + 1} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="16" className="font-mono font-bold">{weeklyProgress}</text>
                </svg>
            );
        }

        if (N === 2) {
            return (
                <svg width={size} height={size}>
                    <path d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`} stroke={getColor(statuses[0])} strokeWidth={4} fill="none" strokeLinecap="round" />
                    <path d={`M ${center + radius} ${center} A ${radius} ${radius} 0 0 1 ${center - radius} ${center}`} stroke={getColor(statuses[1])} strokeWidth={4} fill="none" strokeLinecap="round" />
                    <text x={center} y={center + 1} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="16" className="font-mono font-bold">{weeklyProgress}</text>
                </svg>
            );
        }

        const vertices: { x: number, y: number }[] = [];
        for (let i = 0; i < N; i++) {
            const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
            vertices.push({
                x: center + radius * Math.cos(angle),
                y: center + radius * Math.sin(angle)
            });
        }

        return (
            <svg width={size} height={size}>
                {statuses.map((status, i) => {
                    const p1 = vertices[i];
                    const p2 = vertices[(i + 1) % N];
                    return (
                        <line
                            key={i}
                            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                            stroke={getColor(status)}
                            strokeWidth={4}
                            strokeLinecap="round"
                        />
                    );
                })}
                <text x={center} y={center + 1} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="16" className="font-mono font-bold">
                    {weeklyProgress}
                </text>
            </svg>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2 group relative z-10 mx-auto w-fit cursor-help">
            {renderShapeContent()}
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black text-xs text-white p-3 rounded-lg border border-white/20 z-50 pointer-events-none shadow-xl flex flex-col gap-1.5">
                <div className="text-white/40 mb-1 font-mono uppercase tracking-widest border-b border-white/10 pb-1">Weekly Polygon Progress</div>
                {scheduledDates.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 font-mono">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(statuses[i]) }} />
                        {weekdays[d.getDay()]}
                    </div>
                ))}
            </div>
        </div>
    )
}

function DailyHabitShape({ N, status, size = 20 }: { N: number, status: 'completed' | 'missed' | 'future', size?: number }) {
    const center = size / 2;
    const radius = size / 2 - 2;

    const getColor = () => {
        if (status === 'completed') return '#10b981';
        if (status === 'missed') return '#ef4444';
        return '#3f3f46';
    };

    const color = getColor();
    const fill = status === 'future' ? 'none' : color;
    const stroke = color;
    const strokeW = 1.5;

    if (N <= 1) {
        return (
            <svg width={size} height={size} className="mx-auto block">
                <circle cx={center} cy={center} r={radius} fill={fill} stroke={stroke} strokeWidth={strokeW} />
            </svg>
        );
    }

    if (N === 2) {
        return (
            <svg width={size} height={size} className="mx-auto block">
                <path d={`M ${center - radius} ${center} Q ${center} ${center - radius + 4} ${center + radius} ${center} Q ${center} ${center + radius - 4} ${center - radius} ${center}`} fill={fill} stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />
            </svg>
        );
    }

    const points: { x: number, y: number }[] = [];
    for (let i = 0; i < N; i++) {
        const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
        points.push({
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle)
        });
    }

    return (
        <svg width={size} height={size} className="mx-auto block">
            <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill={fill} stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />
        </svg>
    );
}

interface HabitTimelineProps {
     
    entries: Entry[]
    linkedProjects?: Entry[]
    systemFilter?: string
    onToggleStatus: (entry: Entry) => void
    onEdit: (entry: Entry) => void
    onSelect?: (entry: Entry) => void
    onDelete?: (id: string, skipConfirm?: boolean) => void
    onFocusComplete?: (durationMinutes: number, entry: Entry) => void
    onProjectClick?: (project: Entry) => void
    viewMode: 'day' | 'week' | 'list' | 'overview'
    onChangeViewMode: (mode: 'day' | 'week' | 'list' | 'overview') => void
    onAdaptRoutine?: () => void
    hideControls?: boolean
}

export function HabitTimeline({ entries, linkedProjects = [], systemFilter, onToggleStatus, onEdit, onSelect, onDelete, onFocusComplete, onProjectClick, viewMode, onChangeViewMode, onAdaptRoutine, hideControls }: HabitTimelineProps) {
    const [visibleDate, setVisibleDate] = useState(new Date())

    // Derived date values
    const todayKey = visibleDate.toISOString().split('T')[0]
    const todayDayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][visibleDate.getDay()]
    const isActualToday = new Date().toDateString() === visibleDate.toDateString()

    // Delete Modal State
    const [deleteCandidate, setDeleteCandidate] = useState<Entry | null>(null);

    // Timer for current time line + notifications
    const [currentTime, setCurrentTime] = useState(new Date())
    const [currentTimePercent, setCurrentTimePercent] = useState(0)
    const [expandedLaw, setExpandedLaw] = useState<string | null>(null)

    // 48 half-hour slots (0, 0.5, 1, 1.5 ... 23.5)
    const TOTAL_SLOTS = 48
    const SLOT_HEIGHT_HOURS = 0.5
    const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i * SLOT_HEIGHT_HOURS)

    // Navigation Helpers
    const nextDay = () => {
        const next = new Date(visibleDate)
        next.setDate(visibleDate.getDate() + 1)
        setVisibleDate(next)
    }
    const prevDay = () => {
        const prev = new Date(visibleDate)
        prev.setDate(visibleDate.getDate() - 1)
        setVisibleDate(prev)
    }
    const goToToday = () => setVisibleDate(new Date())

    // Track which habits have already shown a notification today
    const notifiedRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        const interval = setInterval(() => {
            const currentNow = new Date()
            setCurrentTime(currentNow)

            // Update the time-bar position
            const currentHour = currentNow.getHours()
            const currentMinute = currentNow.getMinutes()
            setCurrentTimePercent(((currentHour + currentMinute / 60) / 24) * 100)

            // Check notifications once per minute (when seconds === 0)
            if (currentNow.getSeconds() !== 0) return

            const actualTodayKey = currentNow.toISOString().split('T')[0]
            const actualTodayDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentNow.getDay()]
            const currentMins = currentHour * 60 + currentMinute

            // Build sorted list of active habits for today
            const todayHabits = entries
                .filter(e => {
                    if (e.data['Type'] === 'adaptation' || e.data['archived']) return false
                    const freq = e.data['frequency'] || 'daily'
                    if (freq === 'specific_days') {
                        const days: string[] = e.data['repeatDays'] || []
                        if (!days.includes(actualTodayDay)) return false
                    }
                    const excluded: string[] = e.data['excludedDates'] || []
                    if (excluded.includes(actualTodayKey)) return false
                    const done: string[] = e.data['completedDates'] || []
                    if (done.includes(actualTodayKey)) return false
                    return true
                })
                .map(e => {
                    const daySched = e.data['schedule']?.[actualTodayDay]
                    const rawTime = (typeof daySched === 'object' ? daySched?.time : daySched) || e.data['Time'] || ''
                    if (!rawTime) return null
                    const clean = String(rawTime).replace(/[^0-9:]/g, '')
                    const [hStr, mStr] = clean.split(':')
                    let h = parseInt(hStr || '0', 10)
                    let m = parseInt(mStr || '0', 10)
                    if (isNaN(h)) h = 0; if (isNaN(m)) m = 0
                    if (String(rawTime).toLowerCase().includes('pm') && h < 12) h += 12
                    if (String(rawTime).toLowerCase().includes('am') && h === 12) h = 0
                    return { entry: e, mins: h * 60 + m }
                })
                .filter(Boolean)
                .sort((a, b) => a!.mins - b!.mins) as { entry: Entry; mins: number }[]

            for (let i = 0; i < todayHabits.length; i++) {
                const { entry, mins } = todayHabits[i]
                const minutesUntil = mins - currentMins
                // Fire at T-5, T-4, T-3, T-2, T-1, and T-0
                if (minutesUntil < 0 || minutesUntil > 5) continue

                // Key = habitId + today + which window (5min or 0min)
                const windowKey = minutesUntil === 0 ? 'now' : '5min'
                const key = `${entry.id}_${actualTodayKey}_${windowKey}`
                if (notifiedRef.current.has(key)) continue
                notifiedRef.current.add(key)

                const nextItem = todayHabits.slice(i + 1)[0]
                const minsToDisp = (m: number) => {
                    const h = Math.floor(m / 60) % 24, min = m % 60
                    return `${h % 12 || 12}:${min.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
                }
                const nextHint = nextItem
                    ? `Next: "${nextItem.entry.data['Habit Name'] || 'Habit'}" at ${minsToDisp(nextItem.mins)}`
                    : '✓ Last habit of the day'
                const habitName = entry.data['Habit Name'] || 'Habit'
                const label = minutesUntil === 0 ? `Starting now! · ${minsToDisp(mins)}` : `In ${minutesUntil} min · ${minsToDisp(mins)}`

                const markDone = async () => {
                    try {
                        const today = new Date().toISOString().split('T')[0]
                        const existing: string[] = Array.isArray(entry.data['completedDates']) ? [...entry.data['completedDates']] : []
                        if (!existing.includes(today)) {
                            existing.push(today)
                            await dataStore.updateEntry(entry.id, {
                                ...entry.data,
                                completedDates: existing,
                                Streak: (Number(entry.data['Streak'] || 0)) + 1,
                            })
                            onToggleStatus(entry)
                        }
                        sileo.success({ title: '✓ Logged', description: `${habitName} marked complete.`, duration: 3000 })
                    } catch {
                        sileo.error({ description: 'Failed to mark habit as done.' })
                    }
                }

                sileo.action({
                    title: `⏰ ${habitName}`,
                    description: `${label}\n${nextHint}`,
                    duration: 5 * 60 * 1000,
                    button: { title: minutesUntil === 0 ? '✓ Done' : 'Mark Done', onClick: markDone },
                })
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [entries, onToggleStatus])



    // Helper to determine if an entry is active on a specific date string / day of week
    const isEntryActive = (entry: Entry, targetDateKey: string, targetDayKey: string) => {
        if (entry.data['Type'] === 'adaptation') return false;

        // 0. Check System Filter Mapping
        if (systemFilter) {
            const category = entry.data['Category'] || 'General';
            const categoryToSystem: Record<string, string> = {
                'Study': 'second-brain',
                'Work': 'work',
                'Health': 'body',
                'Creative': 'mind-emotions',
                'Legacy': 'legacy-fun'
            };
            if (categoryToSystem[category] !== systemFilter) return false;
        }

        // 1. Check Frequency
        const freq = entry.data['frequency'] || 'daily'
        let isActive = true;
        if (freq === 'specific_days') {
            const repeatDays = entry.data['repeatDays'] || []
            isActive = repeatDays.includes(targetDayKey)
        }

        // 2. Check Excluded Dates
        const excludedDates = entry.data['excludedDates'] || [];
        if (excludedDates.includes(targetDateKey)) isActive = false;

        // 3. Check Archived
        if (entry.data['archived']) isActive = false;

        return isActive;
    };

    // Calculate dates for today and yesterday
    const yesterdayDate = new Date(visibleDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = yesterdayDate.toISOString().split('T')[0];
    const yesterdayDayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][yesterdayDate.getDay()];

    const activeEntriesToday = entries.filter(e => isEntryActive(e, todayKey, todayDayKey));
    const activeEntriesYesterday = entries.filter(e => isEntryActive(e, yesterdayKey, yesterdayDayKey));

    // Sort entries by time and duration
    // We need to calculate start/end for layout
    const dailyAdaptation = entries.find(e => e.data['Type'] === 'adaptation' && e.data['Date'] === todayKey);
    const adaptedSchedule = dailyAdaptation?.data['Adapted Schedule'] || {};

    const parseEntryToPosition = (entry: Entry, targetDateKey: string, targetDayKey: string) => {
        // If we are parsing for today, check adaptation
        const adaptation = targetDateKey === todayKey ? adaptedSchedule[entry.id] : undefined;

        const daySched = entry.data['schedule']?.[targetDayKey];
        const rawTime = adaptation?.time || (typeof daySched === 'object' ? daySched.time : daySched) || entry.data['Time'] || '00:00';

        const timeStrRaw = String(rawTime).replace(/[^0-9:]/g, ''); // Strip AM/PM for basic calculation
        const [hStr, mStr] = timeStrRaw.split(':');

        // Handle 12-hour format loosely if PM was in raw string
        let h = parseInt(hStr || '0', 10);
        let m = parseInt(mStr || '0', 10);
        if (isNaN(h)) h = 0;
        if (isNaN(m)) m = 0;
        if (String(rawTime).toLowerCase().includes('pm') && h < 12) h += 12;
        if (String(rawTime).toLowerCase().includes('am') && h === 12) h = 0;

        const start = h + (m / 60);

        // Format to AM/PM string for displaying
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        const timeStr = `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;

        const preDuration = typeof daySched === 'object' ? (Number(daySched.preHabitDuration) || 0) : (Number(entry.data['preHabitDuration']) || 0);
        const coreDuration = typeof daySched === 'object' ? (Number(daySched.duration) || 30) : (Number(entry.data['duration']) || 30);
        const postDuration = typeof daySched === 'object' ? (Number(daySched.rewardDuration) || 0) : (Number(entry.data['rewardDuration']) || 0);

        const baseEntryDuration = preDuration + coreDuration + postDuration;
        const duration = Number(adaptation?.duration || baseEntryDuration || entry.data['Duration (minutes)'] || 60);
        const end = start + (duration / 60);

        const effectiveCoreDuration = duration === baseEntryDuration ? coreDuration : Math.max(0, duration - preDuration - postDuration);

        return {
            ...entry,
            start,
            end,
            timeStr,
            duration,
            preDuration,
            coreDuration: effectiveCoreDuration,
            postDuration,
            isAdapted: !!adaptation,
            rationale: adaptation?.rationale,
            isEventBlock: false
        };
    };

    const positionedToday = activeEntriesToday.map(entry => parseEntryToPosition(entry, todayKey, todayDayKey));

    // Add overnight overflow block from yesterday's scheduled habits
    const positionedYesterday = activeEntriesYesterday.map(entry => parseEntryToPosition(entry, yesterdayKey, yesterdayDayKey));
    const overnightSpillovers = positionedYesterday.filter(p => p.end > 24).map(p => {
        const spilloverDuration = (p.end - 24) * 60;
        let skip = p.duration - spilloverDuration;

        // Skip parts of the habit that happened before midnight
        let pre = p.preDuration;
        const deductPre = Math.min(pre, skip);
        pre -= deductPre; skip -= deductPre;

        let core = p.coreDuration;
        const deductCore = Math.min(core, skip);
        core -= deductCore; skip -= deductCore;

        let post = p.postDuration;
        const deductPost = Math.min(post, skip);
        post -= deductPost; skip -= deductPost;

        return {
            ...p,
            id: p.id + '_overflow', // unique key
            start: 0, // starts at midnight on "today" timeline
            end: p.end - 24,
            duration: spilloverDuration,
            preDuration: pre,
            coreDuration: core,
            postDuration: post,
            timeStr: '00:00', // Visually starts at midnight for today
            isAdapted: false,
            rationale: "Continued from yesterday"
        }
    });

    // For any of today's habits that go past midnight, cap them visually to 24 on today's timeline
    // The actual duration might still say 450m, but layout engine will just crop to 24 if we cap end.
    // Actually, capping `end` to 24 makes the `heightPercent` calculation easier if we use `end - start` below, 
    // but right now `heightPercent` just uses `duration`. Capping `duration` visually:
    const finalPositionedToday = positionedToday.map(p => {
        if (p.start + (p.duration / 60) > 24) {
            const overflowHours = (p.start + (p.duration / 60)) - 24;
            const keptDuration = p.duration - (overflowHours * 60);

            // Keep parts of the habit that fit before midnight
            let r = keptDuration;
            const newPre = Math.min(p.preDuration, r);
            r -= newPre;
            const newCore = Math.min(p.coreDuration, r);
            r -= newCore;
            const newPost = Math.min(p.postDuration, r);

            return {
                ...p,
                end: 24,
                duration: keptDuration, // Visually limit duration for today's view
                preDuration: newPre,
                coreDuration: newCore,
                postDuration: newPost
            }
        }
        return p;
    });

    const positionedEntries = [...finalPositionedToday, ...overnightSpillovers];

    // Add synthetic event block
    if (dailyAdaptation && dailyAdaptation.data['Event Title'] && dailyAdaptation.data['Event Time']) {
        const rawTime = dailyAdaptation.data['Event Time'];
        let start = 12; // Default
        let displayTimeStr = String(rawTime);
        try {
            const timeStrRaw = String(rawTime).replace(/[^0-9:]/g, '');
            const [hStr, mStr] = timeStrRaw.split(':');
            let h = parseInt(hStr || '0', 10);
            let m = parseInt(mStr || '0', 10);
            if (isNaN(h)) h = 12;
            if (isNaN(m)) m = 0;
            if (String(rawTime).toLowerCase().includes('pm') && h < 12) h += 12;
            if (String(rawTime).toLowerCase().includes('am') && h === 12) h = 0;
            start = h + (m / 60);

            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            displayTimeStr = `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
        } catch (e) { }
        const duration = Number(dailyAdaptation.data['Event Duration']);
        const safeDuration = isNaN(duration) ? 60 : duration;
        const end = start + (safeDuration / 60);

        positionedEntries.push({
            id: 'unexpected-event-block',
            data: {
                'Habit Name': dailyAdaptation.data['Event Title'],
                'Category': 'Unexpected Event',
                'Time': String(rawTime),
                'Duration (minutes)': safeDuration
            },
            userId: 'system',
            type: 'event',
            createdAt: new Date(),
            updatedAt: new Date(),
            start,
            end,
            timeStr: displayTimeStr,
            duration: safeDuration,
            preDuration: 0,
            coreDuration: safeDuration,
            postDuration: 0,
            isAdapted: false,
            isEventBlock: true
        } as any);
    }

    positionedEntries.sort((a, b) => a.start - b.start);

    // Calculate Columns (Lanes) for Overlap
    const columns: { end: number }[] = [];
    const entriesWithLayout = positionedEntries.map((entry, idx) => {
        // Find first column that is free
        let colIndex = columns.findIndex(col => col.end <= entry.start);

        if (colIndex === -1) {
            // No free column, add new one
            colIndex = columns.length;
            columns.push({ end: entry.end });
        } else {
            // Update column end time
            columns[colIndex].end = entry.end;
        }

        // Check if there is a chronologically adjacent habit to connect to
        // If the very next habit starts within 5 minutes of this one ending, we visually connect them.
        const nextConnected = positionedEntries.slice(idx + 1).find(nextEntry => {
            const gap = nextEntry.start - entry.end;
            return gap >= 0 && gap <= (5 / 60);
        });
        const hasNextConnection = !!nextConnected;

        const prevConnected = positionedEntries.slice(0, idx).find(prevEntry => {
            const gap = entry.start - prevEntry.end;
            return gap >= 0 && gap <= (5 / 60);
        });
        const hasPrevConnection = !!prevConnected;

        return { ...entry, colIndex, totalCols: 0, hasNextConnection, hasPrevConnection }; // totalCols update later if needed, but simple left offset is enough
    });

    const getWeekDays = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return days
    }

    const [focusEntry, setFocusEntry] = useState<Entry | null>(null);

    return (
        <div className="space-y-8 relative">
            {/* View Toggle & Navigation */}
            {!hideControls && (
                <div className="flex flex-col md:flex-row justify-between items-center sticky top-24 z-30 gap-4">
                    {/* Date Nav */}
                    <div className="flex items-center gap-4 bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
                        <button onClick={prevDay} className="p-2 text-white/60 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="text-center min-w-[120px]">
                            <div className="text-xs text-white/40 uppercase tracking-widest">{visibleDate.getFullYear()}</div>
                            <div className={`${playfair.className} text-xl text-white`}>
                                {visibleDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                        <button onClick={nextDay} className="p-2 text-white/60 hover:text-white transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        {!isActualToday && (
                            <button onClick={goToToday} className="text-xs text-blue-400 hover:text-blue-300 ml-2 uppercase tracking-widest">
                                Today
                            </button>
                        )}
                    </div>

                    {/* View Mode */}
                    <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-1 flex">
                        <button
                            onClick={() => onChangeViewMode('day')}
                            className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors ${viewMode === 'day' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                        >
                            Daily Timeline
                        </button>
                        <button
                            onClick={() => onChangeViewMode('week')}
                            className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors ${viewMode === 'week' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                        >
                            Weekly Grid
                        </button>
                        <button
                            onClick={() => onChangeViewMode('list')}
                            className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                        >
                            All Habits
                        </button>
                        {onAdaptRoutine && (
                            <button
                                onClick={onAdaptRoutine}
                                className="ml-2 px-6 py-2 rounded-full text-sm text-black bg-yellow-400 hover:bg-yellow-500 uppercase tracking-widest transition-colors flex items-center gap-2 font-bold"
                            >
                                <Zap className="w-4 h-4" /> Unexpected Events
                            </button>
                        )}
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {viewMode === 'day' ? (
                    <motion.div
                        key="day"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative w-full"
                    >
                        <Timeline
                            title="Daily Timeline"
                            description="A chronological overview of your day's tasks, unexpected events, and habits."
                            data={(() => {
                                const now = new Date();
                                const currentH = now.getHours() + now.getMinutes() / 60;
                                const ampm = Math.floor(now.getHours()) >= 12 ? 'PM' : 'AM';
                                const displayH = Math.floor(now.getHours()) % 12 || 12;
                                const currentDisplayTimeStr = `${displayH}:${now.getMinutes().toString().padStart(2, '0')} ${ampm}`;

                                const timeMarker = {
                                    title: currentDisplayTimeStr,
                                    sortKey: currentH,
                                    content: (
                                        <div className="relative h-full flex flex-col pb-12 mb-2 items-center justify-center w-full">
                                            <div className="w-full flex items-center pr-12 md:pr-48 gap-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                                                <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] z-10 shrink-0 border-2 border-[#0A0A0A]" />
                                                <div className="w-full h-[2px] bg-gradient-to-r from-red-500 to-transparent" />
                                            </div>
                                            <div className="absolute -top-6 left-0 text-[10px] font-mono font-bold text-red-500/80 uppercase tracking-widest pl-2">Current Time</div>
                                        </div>
                                    )
                                };

                                const formattedEntries = entriesWithLayout.filter(e => !e.id.toString().endsWith('_overflow')).map((entry, index) => {
                                    const completedDates = entry.data['completedDates'] || [];
                                    const isCompletedToday = completedDates.includes(todayKey);

                                    return {
                                        title: entry.timeStr,
                                        sortKey: entry.start,
                                        content: (
                                            <div className="relative group/card h-full flex flex-col mb-12">
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                                <div className="relative bg-[#050505] border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-white/20 transition-all shadow-xl shadow-black group-hover/card:shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                                            <span className="text-[10px] text-emerald-500 uppercase tracking-[0.2em] font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                                                                {entry.data['Category'] || 'General'}
                                                            </span>
                                                            {entry.duration > 0 && (
                                                                <span className="text-[10px] text-white/40 font-mono tracking-widest bg-white/5 px-2 py-1 rounded whitespace-nowrap">
                                                                    {entry.duration} MIN
                                                                </span>
                                                            )}
                                                            {entry.isAdapted && (
                                                                <span className="text-[10px] text-yellow-500 uppercase tracking-[0.2em] font-bold bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 whitespace-nowrap">
                                                                    Adapted
                                                                </span>
                                                            )}
                                                            {entry.isEventBlock && (
                                                                <span className="text-[10px] text-red-500 uppercase tracking-[0.2em] font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 whitespace-nowrap">
                                                                    Unexpected Event
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className={`${playfair.className} text-3xl text-white mb-2 group-hover/card:text-emerald-100 transition-colors`}>{entry.data['Habit Name']}</h3>
                                                        <p className={`${inter.className} text-sm text-white/50 max-w-xl`}>{entry.data['Description'] || 'Daily focus task.'}</p>

                                                        {/* 4-law color bar */}
                                                        <div className="mt-4 flex gap-1 h-1 w-48 rounded-full overflow-hidden opacity-30 mt-6">
                                                            <div className="bg-cyan-500 flex-1" />
                                                            <div className="bg-purple-500 flex-1" />
                                                            <div className="bg-emerald-500 flex-1" />
                                                            <div className="bg-amber-500 flex-1" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 sm:flex-col lg:flex-row shadow-lg shrink-0 w-full sm:w-auto">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onToggleStatus({
                                                                    ...entry,
                                                                    data: {
                                                                        ...entry.data,
                                                                        completedDates: isCompletedToday
                                                                            ? completedDates.filter((d: string) => d !== todayKey)
                                                                            : [...completedDates, todayKey]
                                                                    }
                                                                });
                                                            }}
                                                            className={`w-full sm:w-auto px-8 py-3 rounded-full text-xs uppercase tracking-[0.2em] font-bold transition-all ${isCompletedToday ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-white text-black hover:bg-emerald-100 hover:scale-105 active:scale-95'}`}
                                                        >
                                                            {isCompletedToday ? 'Done ✓' : 'Complete'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    };
                                });

                                return [...formattedEntries, timeMarker].sort((a, b) => a.sortKey - b.sortKey);
                            })()}
                        />
                    </motion.div>

                ) : viewMode === 'week' ? (
                    <motion.div
                        key="week"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="overflow-x-auto"
                    >
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left py-4 px-4 text-xs font-mono text-white/40 uppercase tracking-widest">Habit</th>
                                    {getWeekDays().map(day => (
                                        <th key={day} className="py-4 px-2 text-center text-xs font-mono text-white/40 uppercase tracking-widest">{day}</th>
                                    ))}
                                    <th className="py-4 px-4 text-center text-xs font-mono text-white/40 uppercase tracking-widest">Weekly Shape & Streak</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entriesWithLayout.map((entry, index) => {
                                    if (entry.isEventBlock || entry.id.toString().endsWith('_overflow')) return null;

                                    const todayKey = new Date().toISOString().split('T')[0];
                                    const frequency = entry.data['frequency'] || 'daily';
                                    const repeatDays = entry.data['repeatDays'] || [];
                                    const completedDates = entry.data['completedDates'] || [];

                                    const weekStart = new Date(visibleDate);
                                    const day = weekStart.getDay();
                                    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
                                    weekStart.setDate(diff);

                                    const currentWeekDates = Array.from({ length: 7 }).map((_, i) => {
                                        const d = new Date(weekStart);
                                        d.setDate(weekStart.getDate() + i);
                                        return d;
                                    });
                                    const weekdaysFull = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                                    const scheduledCount = currentWeekDates.filter(d => {
                                        if (frequency === 'daily') return true;
                                        return repeatDays.includes(weekdaysFull[d.getDay()]);
                                    }).length;

                                    return (
                                        <motion.tr
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4 cursor-pointer" onClick={() => onSelect ? onSelect(entry) : onEdit(entry)}>
                                                <div className={`${playfair.className} text-xl text-white flex items-center gap-2`}>
                                                    {entry.data['Habit Name']}
                                                    <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-white/40" />
                                                </div>
                                                <div className="text-xs text-white/40 font-mono mt-1">{entry.data['Time']}</div>
                                            </td>

                                            {currentWeekDates.map((dateObj, i) => {
                                                const dayName = weekdaysFull[dateObj.getDay()];
                                                const isScheduled = frequency === 'daily' || repeatDays.includes(dayName);

                                                if (!isScheduled) {
                                                    return (
                                                        <td key={i} className="py-4 px-2 text-center">
                                                            <div className="w-1.5 h-1.5 rounded-full mx-auto bg-white/5" />
                                                        </td>
                                                    );
                                                }

                                                const dateStr = dateObj.toISOString().split('T')[0];
                                                const isCompleted = completedDates.includes(dateStr);
                                                let status: 'completed' | 'missed' | 'future' = 'missed';
                                                if (isCompleted) status = 'completed';
                                                else if (dateStr > todayKey) status = 'future';

                                                return (
                                                    <td key={i} className="py-4 px-2 text-center">
                                                        <DailyHabitShape N={scheduledCount} status={status} size={20} />
                                                    </td>
                                                );
                                            })}

                                            <td className="py-6 px-4">
                                                <HabitStreakShape entry={entry} visibleDate={visibleDate} />
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </motion.div>
                ) : viewMode === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="py-8"
                    >
                        {entries.filter(e => e.data['Type'] !== 'adaptation').length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-20">
                                <div className="text-center">
                                    <p className={`${playfair.className} text-2xl text-white/20 mb-2`}>No habits built yet</p>
                                    <p className={`${inter.className} text-white/10`}>Start forging your new identity.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {entries.filter(e => e.data['Type'] !== 'adaptation').map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => onSelect?.(entry)}
                                        className="bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 p-6 rounded-xl transition-all group flex flex-col cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-xs uppercase tracking-widest text-white/40 mb-1">{entry.data['Category'] || 'General'}</div>
                                                <h3 className={`${playfair.className} text-2xl text-white`}>{String(entry.data['Habit Name'] || 'Untitled')}</h3>
                                            </div>
                                            <div className="flex bg-black/50 rounded-lg overflow-hidden border border-white/10">
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }} className="p-2 text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); if (onDelete) setDeleteCandidate(entry); }} className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors border-l border-white/10">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-3 flex-1">
                                            {/* Linked Projects */}
                                            {linkedProjects.filter(p => p.data['Habit'] === entry.id).length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {linkedProjects.filter(p => p.data['Habit'] === entry.id).map(p => (
                                                        <button
                                                            key={p.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (onProjectClick) onProjectClick(p);
                                                            }}
                                                            className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                                                        >
                                                            🎯 {p.data['title'] || p.data['Title'] || p.data['Project Name'] || 'Project'}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm text-white/60">
                                                <span>Frequency:</span>
                                                <span className="text-white capitalize whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] text-right">
                                                    {entry.data['frequency'] === 'daily' ? 'Every Day' : (entry.data['repeatDays']?.join(', ') || 'Not Set')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-white/60">
                                                <span>Schedule:</span>
                                                <span className="text-white font-mono">{entry.data['Time'] || 'Variable'} ({(parseInt(entry.data['preHabitDuration'] || 0) + parseInt(entry.data['duration'] || 30) + parseInt(entry.data['rewardDuration'] || 0))}m)</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-white/60 border-t border-white/10 pt-3">
                                                <span>Current Streak:</span>
                                                <span className="font-mono text-emerald-400 font-bold">{entry.data['Streak'] || 0} 🔥</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : viewMode === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="py-12 px-4 w-full"
                    >
                        <Timeline
                            title="Productivity Overview"
                            description="A high level snapshot of today's tasks and routine."
                            data={(() => {
                                const formattedEntries = entriesWithLayout.filter(e => !e.id.toString().endsWith('_overflow')).map((entry, index) => {
                                    const completedDates = entry.data['completedDates'] || [];
                                    const isCompletedToday = completedDates.includes(todayKey);

                                    return {
                                        title: entry.timeStr,
                                        sortKey: entry.start,
                                        content: (
                                            <div className="relative group/card h-full flex flex-col mb-12">
                                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                                <div className="relative bg-[#050505] border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-white/20 transition-all shadow-xl shadow-black group-hover/card:shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                                            <span className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 whitespace-nowrap">
                                                                {entry.data['Category'] || 'General'}
                                                            </span>
                                                            {entry.duration > 0 && (
                                                                <span className="text-[10px] text-white/40 font-mono tracking-widest bg-white/5 px-2 py-1 rounded whitespace-nowrap">
                                                                    {entry.duration} MIN
                                                                </span>
                                                            )}
                                                            {entry.isAdapted && (
                                                                <span className="text-[10px] text-yellow-500 uppercase tracking-[0.2em] font-bold bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 whitespace-nowrap">
                                                                    Adapted
                                                                </span>
                                                            )}
                                                            {entry.isEventBlock && (
                                                                <span className="text-[10px] text-red-500 uppercase tracking-[0.2em] font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 whitespace-nowrap">
                                                                    Unexpected Event
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className={`${playfair.className} text-3xl text-white mb-2 group-hover/card:text-amber-100 transition-colors`}>{entry.data['Habit Name']}</h3>
                                                        <p className={`${inter.className} text-sm text-white/50 max-w-xl`}>{entry.data['Description'] || 'Daily focus task.'}</p>
                                                    </div>
                                                    <div className="flex gap-3 sm:flex-col lg:flex-row shadow-lg shrink-0 w-full sm:w-auto">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onToggleStatus({
                                                                    ...entry,
                                                                    data: {
                                                                        ...entry.data,
                                                                        completedDates: isCompletedToday
                                                                            ? completedDates.filter((d: string) => d !== todayKey)
                                                                            : [...completedDates, todayKey]
                                                                    }
                                                                });
                                                            }}
                                                            className={`w-full sm:w-auto px-8 py-3 rounded-full text-xs uppercase tracking-[0.2em] font-bold transition-all ${isCompletedToday ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30' : 'bg-white text-black hover:bg-amber-100 hover:scale-105 active:scale-95'}`}
                                                        >
                                                            {isCompletedToday ? 'Done ✓' : 'Complete'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    };
                                });

                                return [...formattedEntries].sort((a, b) => a.sortKey - b.sortKey);
                            })()}
                        />
                    </motion.div>
                ) : null
                }
            </AnimatePresence >

            {/* Focus Session Modal */}
            <AnimatePresence>
                {
                    focusEntry && (
                        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-8">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="text-center max-w-2xl w-full"
                            >
                                <div className="text-white/40 uppercase tracking-[0.3em] mb-4 text-sm">Focus Mode</div>
                                <h2 className={`${playfair.className} text-6xl text-white mb-2`}>{focusEntry.data['Habit Name']}</h2>
                                <p className={`${inter.className} text-xl text-white/60 mb-12`}>No distractions. Just you and your goal.</p>

                                {/* Timer (Visual Only for now) */}
                                <div className="w-64 h-64 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-12 relative">
                                    <div className="absolute inset-0 rounded-full border-t-2 border-white animate-spin duration-[3000ms]" />
                                    <div className="text-6xl font-mono text-white">25:00</div>
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            if (onFocusComplete && focusEntry) onFocusComplete(25, focusEntry);
                                            setFocusEntry(null)
                                        }}
                                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full uppercase tracking-widest text-sm transition-colors border border-white/10"
                                    >
                                        End Session
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Custom Delete Modal */}
            <AnimatePresence>
                {
                    deleteCandidate && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-black border border-white/10 p-6 rounded-xl shadow-2xl max-w-sm w-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-900" />
                                <h3 className={`${playfair.className} text-2xl text-white mb-2`}>Delete Habit?</h3>
                                <p className={`${inter.className} text-white/60 mb-6 text-sm`}>
                                    You can remove {deleteCandidate.data['Habit Name']} for just today, or delete the habit entirely.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            // Update excludedDates
                                            const excludedDates = deleteCandidate.data['excludedDates'] || [];
                                            onToggleStatus({ // Reusing generic update handler
                                                ...deleteCandidate,
                                                data: {
                                                    ...deleteCandidate.data,
                                                    excludedDates: [...excludedDates, todayKey]
                                                }
                                            });
                                            setDeleteCandidate(null);
                                        }}
                                        className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-colors text-sm uppercase tracking-widest"
                                    >
                                        Remove for Today Only
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onDelete) onDelete(deleteCandidate.id, true);
                                            setDeleteCandidate(null);
                                        }}
                                        className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm uppercase tracking-widest"
                                    >
                                        Delete Habit Entirely
                                    </button>
                                    <button
                                        onClick={() => setDeleteCandidate(null)}
                                        className="w-full py-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest mt-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </div >
    )
}
