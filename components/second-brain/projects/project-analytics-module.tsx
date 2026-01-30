
'use client'

import { motion } from 'framer-motion'
import { AnalyticsMetrics } from './project-analytics'
import { Activity, AlertTriangle, TrendingUp, HelpCircle, AlertOctagon, Target, Calendar } from 'lucide-react'

interface ProjectAnalyticsModuleProps {
    metrics: AnalyticsMetrics;
}

export function ProjectAnalyticsModule({ metrics }: ProjectAnalyticsModuleProps) {
    const { velocity, volatility, spi, forecastDate, daysLate, biasFactor, completionPercentage } = metrics;

    // Helper to determine SPI color
    const getSpiColor = (val: number) => {
        if (val >= 1.0) return 'text-emerald-500';
        if (val >= 0.8) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getSpiLabel = (val: number) => {
        if (val >= 1.1) return 'AHEAD';
        if (val >= 0.95) return 'ON TRACK';
        if (val >= 0.8) return 'AT RISK';
        return 'DELAYED';
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                    <Activity className="w-3 h-3 text-blue-500" />
                    Neural Analytics Engine
                </div>
                {/* Tech decoration */}
                <div className="flex gap-1">
                    <div className="w-1 h-3 bg-blue-500/20 rounded-sm animate-pulse" />
                    <div className="w-1 h-3 bg-blue-500/10 rounded-sm" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">

                {/* 1. SPI (Schedule Performance Index) */}
                <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] uppercase tracking-wider text-white/40">SPI Index</span>
                        <Target className={`w-3 h-3 ${getSpiColor(spi)}`} />
                    </div>
                    <div>
                        <div className={`text-2xl font-bold leading-none ${getSpiColor(spi)}`}>{spi.toFixed(2)}</div>
                        <div className="text-[9px] text-white/30 mt-1 uppercase font-bold tracking-widest">{getSpiLabel(spi)}</div>
                    </div>
                    {/* Tiny gauge bar */}
                    <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                        <div
                            className={`h-full ${getSpiColor(spi).replace('text-', 'bg-')}`}
                            style={{ width: `${Math.min(100, spi * 100)}%` }}
                        />
                    </div>
                </div>

                {/* 2. Velocity & Volatility */}
                <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] uppercase tracking-wider text-white/40">Velocity (σ)</span>
                        <TrendingUp className="w-3 h-3 text-purple-500" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">{velocity}</span>
                            <span className="text-[10px] text-white/40">tasks/day</span>
                        </div>
                        <div className="text-[9px] text-white/30 mt-1">σ (Sigma): <span className="text-white/50">{volatility}</span></div>
                    </div>
                    {/* Volatility Stability Bar (Inverse of sigma) */}
                    <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden flex justify-center">
                        {/* Centered marker for stability */}
                        <div className="w-[1px] h-full bg-white/20" />
                    </div>
                </div>

                {/* 3. Forecasting */}
                <div className="col-span-2 p-3 bg-white/5 border border-white/5 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Calendar className="w-12 h-12" />
                    </div>

                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-[9px] uppercase tracking-wider text-white/40">Completion Forecast</span>
                    </div>

                    <div className="flex items-end gap-4 relative z-10">
                        <div>
                            {forecastDate ? (
                                <div className="text-lg font-bold text-white">
                                    {new Date(forecastDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            ) : (
                                <div className="text-lg font-bold text-white/30">Calculating...</div>
                            )}
                            <div className="text-[10px] text-white/40 mt-0.5">Predicted Finish</div>
                        </div>

                        {daysLate > 500 ? (
                            <div className="text-right ml-auto">
                                <div className="text-lg font-bold text-white/30 mb-0.5">--</div>
                                <div className="text-[9px] text-white/20 uppercase tracking-wider font-bold bg-white/5 px-1.5 py-0.5 rounded">Awaiting Data</div>
                            </div>
                        ) : daysLate > 0 ? (
                            <div className="text-right ml-auto">
                                <div className="text-lg font-bold text-rose-500 mb-0.5">+{daysLate} Days</div>
                                <div className="text-[9px] text-rose-500/50 uppercase tracking-wider font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">Deadline Miss</div>
                            </div>
                        ) : (
                            <div className="text-right ml-auto">
                                <div className="text-lg font-bold text-emerald-500 mb-0.5">On Target</div>
                                <div className="text-[9px] text-emerald-500/50 uppercase tracking-wider font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Buffer Active</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Bias Algorithm */}
                <div className="col-span-2 p-2 px-3 border border-dashed border-white/10 rounded-lg flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Estimation Bias</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${biasFactor > 1.1 ? 'text-amber-500' : biasFactor < 0.9 ? 'text-blue-500' : 'text-emerald-500'}`}>
                            {biasFactor.toFixed(2)}x
                        </span>
                        <span className="text-[9px] text-white/20 uppercase">
                            {biasFactor > 1.1 ? '(Optimist)' : biasFactor < 0.9 ? '(Pessimist)' : '(Realist)'}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
