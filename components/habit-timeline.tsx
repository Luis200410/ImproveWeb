'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Entry } from '@/lib/data-store'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Check, Edit2, Trash2, ArrowLeft, ArrowRight, Zap } from 'lucide-react'

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const hours = Array.from({ length: 24 }, (_, i) => i) // 0 to 23

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

    useEffect(() => {
        // Request notification permission
        if (typeof window !== 'undefined' && 'Notification' in window) {
            Notification.requestPermission();
        }

        const interval = setInterval(() => {
            const currentNow = new Date();
            setCurrentTime(currentNow);

            // Calculate current time position %
            const currentHour = currentNow.getHours();
            const currentMinute = currentNow.getMinutes();
            const currentHourIndex = currentHour;
            const newTimePercent = ((currentHourIndex + (currentMinute / 60)) / hours.length) * 100;
            setCurrentTimePercent(newTimePercent);

            // Check for notifications (always based on actual current time, not visibleDate)
            const timeString = currentNow.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            const actualTodayKey = currentNow.toISOString().split('T')[0];
            const actualTodayDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentNow.getDay()];

            entries.forEach(entry => {
                // Check if habit is for today (actual today)
                const freq = entry.data['frequency'] || 'daily';
                const repeatDays = entry.data['repeatDays'] || [];
                if (freq === 'specific_days' && !repeatDays.includes(actualTodayDay)) return;

                // Check if excluded for today (actual today)
                const excludedDates = entry.data['excludedDates'] || [];
                if (excludedDates.includes(actualTodayKey)) return;

                // Check if already done today (optional: suppress notification if done)
                const completedDates = entry.data['completedDates'] || [];
                if (completedDates.includes(actualTodayKey)) return;

                const habitTime = entry.data['schedule']?.[actualTodayDay] || entry.data['Time'];
                if (habitTime === timeString && currentNow.getSeconds() === 0) {
                    // Trigger Notification
                    if (Notification.permission === 'granted') {
                        new Notification(`Time for ${entry.data['Habit Name']}`, {
                            body: entry.data['Cue'] || 'Time to build your habit!',
                        });
                    }
                }
            });

        }, 1000);
        return () => clearInterval(interval);
    }, [entries, hours.length]);


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
        let [hStr, mStr] = timeStrRaw.split(':');

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
            let [hStr, mStr] = timeStrRaw.split(':');
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

        return { ...entry, colIndex, totalCols: 0, hasNextConnection }; // totalCols update later if needed, but simple left offset is enough
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
                        className="relative min-h-[2000px] border-l border-white/10 ml-8 md:ml-16 py-8"
                    >
                        {/* Current Time Line */}
                        {currentTimePercent >= 0 && currentTimePercent <= 100 && (
                            <div
                                className="absolute left-[-20px] md:left-[-40px] right-0 h-px bg-red-500/50 z-0 flex items-center pointer-events-none"
                                style={{ top: `${currentTimePercent}%` }}
                            >
                                <div className="absolute -left-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            </div>
                        )}

                        {entriesWithLayout.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className={`${playfair.className} text-2xl text-white/20 mb-2`}>No habits for today</p>
                                    <p className={`${inter.className} text-white/10`}>Enjoy your free time or add a new one.</p>
                                </div>
                            </div>
                        )}

                        {/* Time Markers */}
                        {hours.map(h => (
                            <div key={h} className="absolute left-[-40px] md:left-[-60px]" style={{ top: `${(h / hours.length) * 100}%` }}>
                                <span className="text-xs font-mono text-white/20">{h === 0 ? '12AM' : h === 12 ? '12PM' : h > 12 ? `${h - 12}PM` : `${h}AM`}</span>
                            </div>
                        ))}

                        {/* Habits */}
                        {entriesWithLayout.map((entry, index) => {
                            // Positioning logic
                            const startHourIndex = entry.start;
                            const topPercent = Math.max(0, Math.min(100, (startHourIndex / hours.length) * 100));

                            // Height based on duration
                            // total hours = 19. duration is in minutes.
                            // height % = (duration / 60) / 19 * 100
                            const heightPercent = ((entry.duration / 60) / hours.length) * 100;

                            // Horizontal offset based on column
                            // We can use fixed widths or percentages. Let's use % to keep it responsive.
                            // 90% available width, split by columns?
                            // Or just simple indentation.
                            const leftOffset = entry.colIndex * 20; // 20% shift per column
                            const widthPercent = Math.max(40, 90 - leftOffset); // Shrink width slightly

                            // Check Status Logic (Array based)
                            const completedDates = entry.data['completedDates'] || [];
                            const isCompletedToday = completedDates.includes(todayKey);

                            // Check Category
                            const category = entry.data['Category'] || 'General';
                            const isProductivity = ['Work', 'Study'].includes(category);

                            // Color mapping based on Law/Category? Or just clean dark/light
                            // User mention "each color or area of each habit".
                            // Let's use the category or a generated color for the border/accent

                            const isCompact = entry.duration <= 45;

                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="absolute z-10"
                                    style={{
                                        top: `${topPercent}%`,
                                        height: `${heightPercent}%`,
                                        left: `${leftOffset + 2}%`, // base offset + column shift
                                        right: '2%', // or width
                                        width: `${96 - leftOffset}%` // dynamic width
                                    }}
                                >
                                    <div className="relative group/card h-full flex flex-col">
                                        {/* Activity Line to Axis - adjust to point to timeline */}
                                        <div className="absolute left-[-20px] md:left-[-40px] top-0 w-[20px] md:w-[40px] h-px bg-white/10" style={{ left: `-${leftOffset + 4}%`, width: `${leftOffset + 4}%` }} />
                                        {/* Ideally the line should reach the axis. calculated roughly above */}

                                        {/* Card content - full height */}
                                        {entry.isEventBlock ? (
                                            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-lg p-3 md:p-4 h-full flex flex-col relative overflow-hidden justify-center">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
                                                <div className="flex justify-between items-center relative z-10 w-full">
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className="text-xs font-mono text-red-400/80 shrink-0 flex items-center gap-2">
                                                            {entry.timeStr}
                                                            <span className="text-red-400/40">({entry.duration}m)</span>
                                                            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-red-500/20 text-[10px] uppercase tracking-wider text-red-400/80 font-bold whitespace-nowrap bg-red-500/10">Unexpected Event</span>
                                                        </div>
                                                        <h3 className={`${playfair.className} text-lg md:text-xl text-red-100 truncate`}>{entry.data['Habit Name']}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`bg-transparent backdrop-blur-md rounded-lg h-full flex flex-col relative overflow-hidden group/block shadow-[0_4px_30px_rgba(0,0,0,0.1)] ${isCompletedToday ? 'border-l-4 border-l-white' : ''}`}>
                                                {/* Pre Habit block */}
                                                {entry.preDuration > 0 && (
                                                    <div className="bg-white/5 border border-white/10 w-full shrink-0 flex items-center justify-center relative overflow-hidden group-hover/block:bg-white/10 transition-colors rounded-t-lg" style={{ height: `${(entry.preDuration / entry.duration) * 100}%` }}>
                                                        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }}></div>
                                                        {(entry.preDuration / entry.duration) * 100 > 15 && <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 z-10 px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm">Pre-Habit</span>}
                                                    </div>
                                                )}

                                                {/* Core Habit block */}
                                                <div className={`flex flex-col flex-1 bg-white/5 ${entry.preDuration === 0 ? 'rounded-t-lg border-t' : 'border-t-0'} ${entry.postDuration === 0 ? 'rounded-b-lg border-b' : 'border-b-0'} border-l border-r border-white/10 ${isCompact ? 'p-2 px-3 justify-center' : 'p-4'} group-hover/block:bg-white/10 transition-colors z-10 w-full`} style={{ height: `${(entry.coreDuration / entry.duration) * 100}%` }}>
                                                    {entry.rationale === "Continued from yesterday" ? (
                                                        <div className="flex flex-col items-center justify-center h-full opacity-50 select-none">
                                                            <span className="text-white/40 italic text-sm">Continued</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className={`flex ${isCompact ? 'flex-row items-center gap-4 flex-1 w-full' : 'justify-between items-start mb-2'}`}>
                                                                <div className={`cursor-pointer ${isCompact ? 'flex flex-row items-center gap-3 shrink min-w-0 flex-1' : 'flex-1'}`} onClick={() => onEdit(entry)}>
                                                                    <div className={`text-xs font-mono text-white/40 group-hover/block:text-white/60 transition-colors flex items-center gap-2 shrink-0 ${isCompact ? 'mb-0' : 'mb-1'}`}>
                                                                        {!entry.isAdapted ? (entry.data['schedule']?.[todayDayKey]?.time || entry.data['Time']) : <span className="text-yellow-400">{entry.timeStr}</span>}
                                                                        <span className={entry.isAdapted ? "text-yellow-400/60" : "text-white/20"}>({entry.coreDuration}m)</span>
                                                                        {!isCompact && <span className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] uppercase tracking-wider text-white/40">{category}</span>}
                                                                        {entry.isAdapted && !isCompact && (
                                                                            <span className="px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[10px] uppercase tracking-wider flex items-center gap-1 group relative">
                                                                                <Zap className="w-3 h-3" /> Adapted
                                                                                {entry.rationale && (
                                                                                    <span className="absolute left-0 top-full mt-2 w-48 p-2 bg-black border border-white/10 text-white/80 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 normal-case tracking-normal">
                                                                                        {entry.rationale}
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                        <Edit2 className="w-3 h-3 opacity-0 group-hover/block:opacity-100 transition-opacity" />
                                                                    </div>
                                                                    <h3 className={`${playfair.className} ${isCompact ? 'text-lg' : 'text-xl'} text-white truncate`}>{entry.data['Habit Name']}</h3>

                                                                    {/* Linked Projects */}
                                                                    {!isCompact && linkedProjects.filter(p => p.data['Habit'] === entry.id).length > 0 && (
                                                                        <div className="mt-2 flex flex-wrap gap-2">
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
                                                                </div>

                                                                <div className={`flex items-center gap-2 shrink-0 z-10 relative`}>
                                                                    {/* Focus Button */}
                                                                    {isProductivity && !isCompletedToday && !isCompact && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setFocusEntry(entry);
                                                                            }}
                                                                            className="px-3 py-1.5 bg-white/10 border border-white/20 text-xs text-white uppercase tracking-widest rounded hover:bg-white hover:text-black transition-colors mr-2 hidden md:block"
                                                                        >
                                                                            Start Focus
                                                                        </button>
                                                                    )}

                                                                    {/* Trash Button */}
                                                                    {onDelete && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                // Open Custom Modal
                                                                                setDeleteCandidate(entry);
                                                                            }}
                                                                            className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover/block:opacity-100 transition-all"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    )}

                                                                    {/* Toggle Button - IMPROVED SMOOTHNESS */}
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            // Prevent toggling the ghost copy independently
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
                                                                        className={`${isCompact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 ${isCompletedToday ? 'bg-white border-white text-black hover:bg-white/90' : 'border-white/20 text-transparent hover:border-white/50 hover:bg-white/5'}`}
                                                                    >
                                                                        <Check className={`${isCompact ? 'w-4 h-4' : 'w-6 h-6'}`} />
                                                                    </motion.button>
                                                                </div>
                                                            </div>

                                                            <div className={`${isCompact ? 'absolute bottom-0 left-0 right-0 grid grid-cols-4 h-1' : 'grid grid-cols-4 gap-1 h-3 group-hover/block:h-auto transition-all duration-300 mt-auto'}`}>
                                                                {([
                                                                    { label: 'Cue', color: 'bg-cyan-500', text: entry.data['Cue'] },
                                                                    { label: 'Craving', color: 'bg-purple-500', text: entry.data['Craving'] },
                                                                    { label: 'Response', color: 'bg-emerald-500', text: entry.data['Response'] },
                                                                    { label: 'Reward', color: 'bg-amber-500', text: entry.data['Reward'] }
                                                                ] as const).map(law => {
                                                                    const isExpanded = expandedLaw === `${entry.id}-${law.label}`;
                                                                    return (
                                                                        <div
                                                                            key={law.label}
                                                                            onClick={() => setExpandedLaw(isExpanded ? null : `${entry.id}-${law.label}`)}
                                                                            className={`relative group/law h-full rounded-sm overflow-visible ${isCompact ? '' : 'min-h-[12px] cursor-pointer'}`}
                                                                        >
                                                                            <div className={`absolute inset-0 ${law.color} ${isCompletedToday ? 'opacity-100' : 'opacity-40 group-hover/block:opacity-60 group-hover/law:opacity-100'} transition-opacity ${isCompact ? 'rounded-none' : 'rounded-sm'}`} />
                                                                            {!isCompact && (
                                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/law:opacity-100 transition-opacity">
                                                                                    <span className="text-[10px] font-bold text-black uppercase tracking-wider truncate px-1">{law.label}</span>
                                                                                </div>
                                                                            )}
                                                                            {(isExpanded && !isCompact) && (
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, y: 10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    className="absolute top-full left-0 mt-2 w-48 p-3 bg-black border border-white/20 rounded-lg shadow-2xl text-xs text-white z-50"
                                                                                >
                                                                                    <span className="font-bold block mb-1 uppercase tracking-wider text-white/40">{law.label}</span>
                                                                                    {law.text}
                                                                                </motion.div>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Post Habit block */}
                                                {entry.postDuration > 0 && (
                                                    <div className="bg-white/5 border border-white/10 w-full shrink-0 flex items-center justify-center relative overflow-hidden group-hover/block:bg-white/10 transition-colors rounded-b-lg" style={{ height: `${(entry.postDuration / entry.duration) * 100}%` }}>
                                                        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }}></div>
                                                        {(entry.postDuration / entry.duration) * 100 > 15 && <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 z-10 px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm">Reward / Post-Habit</span>}
                                                    </div>
                                                )}

                                                {/* Sequence Connector */}
                                                {entry.hasNextConnection && (
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-[20px] sm:h-[30px] z-[5] flex justify-center text-white/20 -mt-px pointer-events-none">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full opacity-50">
                                                            <path d="M12 0v24M5 17l7 7 7-7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
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
                        className="py-12 px-4 overflow-x-auto hide-scrollbar"
                    >
                        {entriesWithLayout.length === 0 ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="text-center">
                                    <p className={`${playfair.className} text-2xl text-white/20 mb-2`}>No tasks in the pipeline today</p>
                                    <p className={`${inter.className} text-white/10`}>The workflow is clear.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-8 min-w-max pb-8 pt-12 relative w-full pr-12">
                                {/* The connecting spine line */}
                                <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-1 bg-white/10 rounded-full" />

                                {entriesWithLayout.map((entry, index) => {
                                    if (entry.id.toString().endsWith('_overflow')) return null;
                                    const completedDates = entry.data['completedDates'] || [];
                                    const isCompletedToday = completedDates.includes(todayKey);

                                    return (
                                        <div key={entry.id} className="relative z-10 flex flex-col items-center group/node shrink-0 w-64">
                                            {/* Top Label: Time */}
                                            <div className="mb-4 text-xs font-mono text-white/60 tracking-widest bg-black px-3 py-1 border border-white/10 rounded shadow-sm shadow-black z-20">
                                                {entry.timeStr} <span className="text-white/20 ml-1">({entry.duration}m)</span>
                                            </div>

                                            {/* Node Circle */}
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-500 cursor-pointer z-20 ${isCompletedToday ? 'bg-white border-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'bg-[#0A0A0A] border-white/20 text-white/40 shadow-[0_0_15px_rgba(0,0,0,0.8)] group-hover/node:border-white/50 group-hover/node:text-white'}`}
                                                onClick={() => onSelect?.(entry)}
                                            >
                                                {isCompletedToday ? <Check className="w-8 h-8" /> : <div className="text-xl font-mono">{index + 1}</div>}
                                            </motion.div>

                                            {/* Bottom Card */}
                                            <div className="mt-6 bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl text-center w-full relative z-20 group-hover/node:bg-white/5 group-hover/node:border-white/20 transition-all shadow-xl shadow-black">
                                                {/* Arrow pointing up */}
                                                <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0A0A0A] border-t border-l border-white/10 rotate-45 group-hover/node:bg-[#0f0f0f] group-hover/node:border-white/20 transition-colors" />

                                                <h3 className={`${playfair.className} text-lg text-white mb-2 truncate group-hover/node:text-yellow-100 transition-colors`}>{entry.data['Habit Name']}</h3>

                                                <div className="flex justify-center items-center gap-2 mb-3">
                                                    <span className="text-[10px] text-white/40 uppercase tracking-widest px-2 py-0.5 border border-white/10 rounded-full">{entry.data['Category'] || 'General'}</span>
                                                    {entry.isAdapted && (
                                                        <span className="text-[10px] text-yellow-400 uppercase tracking-widest px-2 py-0.5 border border-yellow-400/20 bg-yellow-400/10 rounded-full flex items-center gap-1">
                                                            <Zap className="w-3 h-3" /> Adapted
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Toggle Button Inside Card */}
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
                                                    className={`w-full py-2 rounded-lg text-xs uppercase tracking-widest font-bold transition-all ${isCompletedToday ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white' : 'bg-white text-black hover:bg-white/90'}`}
                                                >
                                                    {isCompletedToday ? 'Undo' : 'Mark Done'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Focus Session Modal */}
            <AnimatePresence>
                {focusEntry && (
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
                )}
            </AnimatePresence>

            {/* Custom Delete Modal */}
            <AnimatePresence>
                {deleteCandidate && (
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
                )}
            </AnimatePresence>
        </div>
    )
}
