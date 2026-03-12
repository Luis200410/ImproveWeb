"use client";
import {
    useScroll,
    useTransform,
    motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
    title: string;
    content: React.ReactNode;
    sortKey?: number; // 0-24
    durationHours?: number; // Added to set explicit height for proportional items
}

export const Timeline = ({ data, title = "The Journey", description = "A chronological overview of your habit landscape and progression.", isDailyProportional = false }: { data: TimelineEntry[], title?: string, description?: string, isDailyProportional?: boolean }) => {
    const ref = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    const [currentTimePct, setCurrentTimePct] = useState(0);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver(() => {
            if (ref.current) {
                setHeight(ref.current.getBoundingClientRect().height);
            }
        });

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isDailyProportional) return;
        const updateTime = () => {
            const now = new Date();
            const pct = (now.getHours() + now.getMinutes() / 60) / 24;
            setCurrentTimePct(pct);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [isDailyProportional]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 10%", "end 50%"],
    });

    const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    const isClient = typeof window !== 'undefined';
    const computedHeight = isDailyProportional ? height * currentTimePct : heightTransform;
    const computedOpacity = isDailyProportional ? 1 : opacityTransform;

    return (
        <div
            className="w-full bg-transparent font-sans md:px-10"
            ref={containerRef}
        >
            <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
                <h2 className="text-lg md:text-5xl mb-4 text-white max-w-4xl font-serif">
                    {title}
                </h2>
                <p className="text-white/50 text-sm md:text-base max-w-sm">
                    {description}
                </p>
            </div>

            <div ref={ref} className={`relative max-w-7xl mx-auto ${isDailyProportional ? 'h-[7200px] mt-10' : 'pb-20'}`}>
                {isDailyProportional && (
                    <div className="absolute top-0 bottom-0 left-8 md:left-8 w-full z-0 flex flex-col pointer-events-none">
                        {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} className="absolute w-full border-t border-white/5" style={{ top: `${(i / 24) * 100}%` }}>
                                <span className="absolute -left-14 -top-3 text-[10px] text-white/30 font-mono bg-[#0A0A0A] p-1">
                                    {i}:00
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {data.map((item, index) => {
                    const topPosition = isDailyProportional && item.sortKey !== undefined
                        ? `${(item.sortKey / 24) * 100}%`
                        : undefined;

                    const heightPosition = isDailyProportional && item.durationHours !== undefined
                        ? `${(item.durationHours / 24) * 100}%`
                        : undefined;

                    return (
                        <div
                            key={index}
                            className={`flex justify-start ${isDailyProportional ? 'absolute w-full' : 'pt-10 md:pt-40 md:gap-10'}`}
                            style={isDailyProportional ? { top: topPosition, height: heightPosition } : {}}
                        >
                            <div className={`${isDailyProportional ? 'absolute left-0 top-0 -translate-y-[20px] pb-0' : 'sticky top-40'} flex flex-col md:flex-row z-40 items-center self-start max-w-xs lg:max-w-sm md:w-full`}>
                                <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-[#0a0a0a] flex items-center justify-center">
                                    <div className="h-4 w-4 rounded-full bg-white/20 border border-white/10 p-2" />
                                </div>
                                <h3 className="hidden md:block text-xl md:pl-20 md:text-3xl font-bold text-white/40 font-serif">
                                    {item.title}
                                </h3>
                            </div>

                            <div className={`relative pl-20 ${isDailyProportional ? 'md:pl-20 h-full' : 'pt-10 mt-2 pr-4 md:pl-4'} w-full`}>
                                <h3 className="md:hidden block text-xl mb-2 text-left font-bold text-white/40 font-serif">
                                    {item.title}
                                </h3>
                                {item.content}
                            </div>
                        </div>
                    );
                })}

                <div
                    style={{
                        height: height + "px",
                    }}
                    className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-white/10 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
                >
                    {isClient && (
                        <motion.div
                            style={{
                                height: computedHeight,
                                opacity: computedOpacity,
                            }}
                            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-emerald-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
