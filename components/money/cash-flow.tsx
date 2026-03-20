'use client'

import React from 'react'
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    ReferenceLine, 
    ResponsiveContainer, 
    Tooltip, 
    Cell,
    Line
} from 'recharts'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'

export function CashFlowChart({ isDemo }: { isDemo?: boolean }) {
    const [showWhatIf, setShowWhatIf] = React.useState(false)
    const [hoveredDay, setHoveredDay] = React.useState<number | null>(null)

    const minBuffer = 2000

    const [chartData, setChartData] = React.useState<any[]>([])
    const [stats, setStats] = React.useState({ low30: 0, low60: 0, low90: 0 })
    const [loading, setLoading] = React.useState(!isDemo)
    const supabase = createClient()

    React.useEffect(() => {
        if (isDemo) {
            // keep the demo shape statically injected here if prop exists for landing page previews 
            // but the application itself removes the flag.
        } else {
            const fetchCashFlow = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    try {
                        const response = await fetch(`/api/plaid/cashflow-data?userId=${user.id}`);
                        const data = await response.json();
                        if (data.chartData) setChartData(data.chartData);
                        if (data.stats) setStats(data.stats);
                    } catch (err) {
                        console.error("Error fetching live cash flow:", err);
                    } finally {
                        setLoading(false)
                    }
                }
            }
            fetchCashFlow()
        }
    }, [isDemo, supabase])

    const [visibleDataCount, setVisibleDataCount] = React.useState(0)

    React.useEffect(() => {
        if (!isDemo && chartData.length > 0) {
            setVisibleDataCount(chartData.length)
            return
        }
        if (!isDemo) return

        setVisibleDataCount(0)
        let count = 0
        const interval = setInterval(() => {
            count += 3
            if (count > chartData.length) {
                count = chartData.length
                clearInterval(interval)
            }
            setVisibleDataCount(count)
        }, 50)
        return () => clearInterval(interval)
    }, [isDemo, chartData.length])

    const displayData = isDemo ? chartData.slice(0, visibleDataCount) : chartData

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const isWhatIfLine = payload[0].dataKey === 'whatIf'
            const currentVal = isWhatIfLine ? data.whatIf : data.balance

            return (
                <div className="bg-[#0A0A0A] border border-neutral-800 p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                    <div className="flex items-center justify-between gap-8 mb-3">
                        <p className="text-neutral-500 font-mono text-[9px] uppercase tracking-[0.2em] font-bold">
                            {data.date}
                        </p>
                        {isWhatIfLine && (
                            <span className="bg-teal-500/10 text-teal-500 border border-teal-500/20 text-[8px] font-mono px-1 py-0.5">HYPOTHETICAL</span>
                        )}
                    </div>
                    
                    <p className="text-neutral-100 font-mono text-xl tracking-tighter mb-4">
                        £{currentVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>

                    {data.event && (
                        <div className="pt-3 border-t border-neutral-800/50">
                            {data.isActionable ? (
                                <Link 
                                    href={data.link}
                                    className="text-teal-400 font-mono text-xs uppercase tracking-widest underline decoration-teal-500/40 underline-offset-4 hover:text-teal-300 transition-colors"
                                >
                                    {data.event} →
                                </Link>
                            ) : (
                                <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">
                                    {data.event}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )
        }
        return null
    }

    if (loading) {
        return (
            <div className="w-full space-y-8 animate-in fade-in duration-700 font-mono flex items-center justify-center p-32">
                <Loader2 className="size-8 animate-spin text-neutral-800" />
            </div>
        )
    }

    if (chartData.length === 0 && !loading) {
        return (
            <div className="w-full space-y-8 animate-in fade-in duration-700 font-mono flex items-center justify-center p-32 border border-neutral-900 border-dashed">
                <p className="text-neutral-500 text-xs uppercase tracking-widest">Connect Plaid Item to construct models.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* Header & What-if Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-900 pb-8">
                <div className="space-y-1">
                    <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-bold flex items-center gap-2">
                        Horizon Line <span className="w-1 h-1 rounded-full bg-neutral-700" /> 90D Projection
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-neutral-600 font-mono text-xs italic">Buffer Minimum: £{minBuffer.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-neutral-900/50 p-1.5 border border-neutral-800/50">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest px-3">
                        Show impact of pending decisions
                    </span>
                    <button 
                        onClick={() => setShowWhatIf(!showWhatIf)}
                        className={`w-12 h-6 flex items-center transition-colors duration-300 rounded-none border ${showWhatIf ? 'bg-teal-500/20 border-teal-500/50' : 'bg-neutral-800 border-neutral-700'}`}
                    >
                        <div className={`w-3 h-3 bg-neutral-100 transition-transform duration-300 translate-x-1 ${showWhatIf ? 'translate-x-7 bg-teal-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-[450px] w-full relative group">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                        data={displayData} 
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                        onMouseMove={(e) => {
                            if (e && e.activeTooltipIndex !== undefined) setHoveredDay(e.activeTooltipIndex as number)
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                    >
                        <defs>
                            <mask id="dangerMask">
                                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            </mask>
                            <linearGradient id="dangerFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        
                        <XAxis 
                            dataKey="date" 
                            stroke="#262626" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                            minTickGap={60}
                            fontFamily="monospace"
                            dy={15}
                        />
                        <YAxis 
                            stroke="#262626" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(v) => v === 0 ? '' : `£${v}`} // Remove $0 label
                            fontFamily="monospace"
                            orientation="right"
                            dx={10}
                        />
                        
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ stroke: '#404040', strokeWidth: 1 }} 
                        />
                        
                        <ReferenceLine 
                            y={minBuffer} 
                            stroke="#404040" 
                            strokeDasharray="4 4" 
                            label={{ position: 'top', value: 'BUFFER MINIMUM', fill: '#525252', fontSize: 9, fontFamily: 'monospace', dy: -10, letterSpacing: 2 }} 
                        />

                        {/* Danger Zone Fill - Area between line and threshold */}
                        <Area
                            type="stepAfter"
                            dataKey="dangerLine"
                            stroke="none"
                            fill="url(#dangerFill)"
                            baseValue={minBuffer}
                            isAnimationActive={false}
                        />

                        {/* Main Balance Line */}
                        <Area 
                            type="stepAfter" 
                            dataKey="balance" 
                            stroke={hoveredDay !== null ? '#737373' : '#a3a3a3'} 
                            strokeWidth={2}
                            fill="transparent"
                            strokeOpacity={hoveredDay !== null ? 0.3 : 1}
                            activeDot={{ r: 5, fill: '#fff', stroke: '#000', strokeWidth: 2 }}
                            className="transition-opacity duration-300"
                        />

                        {/* What-If Overlaid Line */}
                        {showWhatIf && (
                            <Area 
                                type="stepAfter" 
                                dataKey="whatIf" 
                                stroke="#14b8a6" 
                                strokeWidth={2}
                                strokeDasharray="3 3"
                                fill="transparent"
                                strokeOpacity={hoveredDay !== null ? 0.3 : 0.6}
                                activeDot={{ r: 5, fill: '#14b8a6', stroke: '#000', strokeWidth: 2 }}
                                className="transition-opacity duration-300"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-3 gap-0 border border-neutral-900 bg-neutral-900/10">
                <div className="p-8 space-y-3 border-r border-neutral-900">
                    <div className="text-neutral-500 font-mono text-[9px] uppercase tracking-[0.3em] font-bold">Horizon Limit (30D)</div>
                    <div className="text-neutral-100 font-mono text-2xl tracking-tighter">£{stats.low30.toLocaleString()}</div>
                    <div className="text-[10px] font-mono uppercase text-neutral-600 tracking-widest">Trajectory Valid</div>
                </div>
                <div className="p-8 space-y-3 border-r border-neutral-900">
                    <div className="text-neutral-500 font-mono text-[9px] uppercase tracking-[0.3em] font-bold">Horizon Limit (60D)</div>
                    <div className="text-amber-500 font-mono text-2xl tracking-tighter">£{stats.low60.toLocaleString()}</div>
                    <div className="text-[10px] font-mono uppercase text-amber-600/60 tracking-widest">Buffer Warning</div>
                </div>
                <div className="p-8 space-y-3">
                    <div className="text-neutral-500 font-mono text-[9px] uppercase tracking-[0.3em] font-bold">Horizon Limit (90D)</div>
                    <div className="text-red-500 font-mono text-2xl tracking-tighter">£{stats.low90.toLocaleString()}</div>
                    <div className="text-[10px] font-mono uppercase text-red-600/60 tracking-widest">Structural Breach</div>
                </div>
            </div>

            <div className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700 pt-4">
                Plaid Synthetic Multi-Account Projection Engine v2.4
            </div>
        </div>
    )
}
