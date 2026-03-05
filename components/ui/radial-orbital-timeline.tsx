"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { InteractiveGlobe } from "./interactive-globe";

interface TimelineItem {
    id: number;
    title: string;
    date: string;
    content: string;
    category: string;
    icon: React.ElementType | any;
    rawIcon?: string;
    relatedIds: number[];
    status: "completed" | "in-progress" | "pending";
    energy: number;
}

interface RadialOrbitalTimelineProps {
    timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
    timelineData,
}: RadialOrbitalTimelineProps) {
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
        {}
    );
    const [viewMode, setViewMode] = useState<"orbital">("orbital");
    const [rotationAngle, setRotationAngle] = useState<number>(0);
    const [autoRotate, setAutoRotate] = useState<boolean>(true);
    const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
    const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
    const [isPoweredOn, setIsPoweredOn] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const orbitRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const router = useRouter();

    const handleSpin = () => {
        if (!isPoweredOn) {
            setIsPoweredOn(true);
        }
    };

    const calculateNodePosition = (index: number, total: number) => {
        const angle = ((index / total) * 360 + rotationAngle) % 360;
        const radius = 300;
        const radian = (angle * Math.PI) / 180;

        const x = radius * Math.cos(radian) + centerOffset.x;
        const y = radius * Math.sin(radian) + centerOffset.y;

        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        const opacity = Math.max(
            0.4,
            Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
        );

        return { x, y, angle, zIndex, opacity };
    };

    const globeMarkers = useMemo(() => {
        const DEFAULT_COORDS = [
            { lat: 37.78, lng: -122.42 }, // SF
            { lat: 51.51, lng: -0.13 },   // London
            { lat: 35.68, lng: 139.69 },  // Tokyo
            { lat: -33.87, lng: 151.21 }, // Sydney
            { lat: 1.35, lng: 103.82 },   // Singapore
            { lat: -23.55, lng: -46.63 }, // São Paulo
            { lat: 40.71, lng: -74.00 },  // NY
            { lat: 48.85, lng: 2.35 },    // Paris
            { lat: 25.20, lng: 55.27 },   // Dubai
            { lat: -34.60, lng: -58.38 }, // Buenos Aires
            { lat: 19.43, lng: -99.13 },  // Mexico City
            { lat: 55.75, lng: 37.61 },   // Moscow
            { lat: -1.29, lng: 36.82 },   // Nairobi
            { lat: 39.90, lng: 116.40 },  // Beijing
            { lat: -33.92, lng: 18.42 },  // Cape Town
            { lat: 28.61, lng: 77.20 },   // New Delhi
            { lat: 41.90, lng: 12.49 },   // Rome
            { lat: 1.29, lng: 103.85 },   // Singapore (Alt)
            { lat: 34.05, lng: -118.24 }, // LA
        ];
        return timelineData.map((item, i) => {
            const coords = DEFAULT_COORDS[i % DEFAULT_COORDS.length];
            return {
                lat: coords.lat,
                lng: coords.lng,
                label: item.title,
                id: item.id,
                emoji: item.rawIcon
            };
        });
    }, [timelineData]);

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === containerRef.current || e.target === orbitRef.current) {
            setExpandedItems({});
            setActiveNodeId(null);
            setPulseEffect({});
            setAutoRotate(true);
        }
    };

    const toggleItem = (id: number) => {
        setExpandedItems((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((key) => {
                if (parseInt(key) !== id) {
                    newState[parseInt(key)] = false;
                }
            });

            newState[id] = !prev[id];

            if (!prev[id]) {
                setActiveNodeId(id);
                setAutoRotate(false);

                const relatedItems = getRelatedItems(id);
                const newPulseEffect: Record<number, boolean> = {};
                relatedItems.forEach((relId) => {
                    newPulseEffect[relId] = true;
                });
                setPulseEffect(newPulseEffect);

                centerViewOnNode(id);
            } else {
                setActiveNodeId(null);
                setAutoRotate(true);
                setPulseEffect({});
            }

            return newState;
        });
    };

    useEffect(() => {
        let rotationTimer: NodeJS.Timeout;

        if (autoRotate && viewMode === "orbital") {
            rotationTimer = setInterval(() => {
                setRotationAngle((prev) => {
                    const newAngle = (prev + 0.3) % 360;
                    return Number(newAngle.toFixed(3));
                });
            }, 50);
        }

        return () => {
            if (rotationTimer) {
                clearInterval(rotationTimer);
            }
        };
    }, [autoRotate, viewMode]);

    const centerViewOnNode = (nodeId: number) => {
        if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

        const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
        const totalNodes = timelineData.length;
        const targetAngle = (nodeIndex / totalNodes) * 360;

        setRotationAngle(270 - targetAngle);
    };


    const getRelatedItems = (itemId: number): number[] => {
        const currentItem = timelineData.find((item) => item.id === itemId);
        return currentItem ? currentItem.relatedIds : [];
    };

    const isRelatedToActive = (itemId: number): boolean => {
        if (!activeNodeId) return false;
        const relatedItems = getRelatedItems(activeNodeId);
        return relatedItems.includes(itemId);
    };

    const getStatusStyles = (status: TimelineItem["status"]): string => {
        switch (status) {
            case "completed":
                return "text-white bg-black border-white";
            case "in-progress":
                return "text-black bg-white border-black";
            case "pending":
                return "text-white bg-black/40 border-white/50";
            default:
                return "text-white bg-black/40 border-white/50";
        }
    };

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center bg-transparent overflow-hidden"
            ref={containerRef}
            onClick={handleContainerClick}
        >
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                <div
                    className="absolute w-full h-[800px] flex items-center justify-center transition-all duration-1000"
                    ref={orbitRef}
                    style={{
                        perspective: "1000px",
                        transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
                    }}
                >
                    <div className="absolute z-10 flex items-center justify-center transition-all duration-1000" style={{ transform: isPoweredOn ? "scale(0.5)" : "scale(1)" }}>
                        {isPoweredOn && (
                            <>
                                <div className="absolute w-[620px] h-[620px] rounded-full border border-white/20 animate-ping opacity-70 pointer-events-none"></div>
                                <div
                                    className="absolute w-[680px] h-[680px] rounded-full border border-white/10 animate-ping opacity-50 pointer-events-none"
                                    style={{ animationDelay: "0.5s" }}
                                ></div>
                            </>
                        )}
                        <InteractiveGlobe
                            size={600}
                            markers={globeMarkers}
                            activeMarkerId={
                                Object.keys(expandedItems).find(
                                    (id) => expandedItems[Number(id)]
                                )
                                    ? Number(
                                        Object.keys(expandedItems).find(
                                            (id) => expandedItems[Number(id)]
                                        )
                                    )
                                    : undefined
                            }
                            onMarkerClick={(marker) => {
                                toggleItem(marker.id);
                            }}
                            onMarkerDoubleClick={(marker) => {
                                const item = timelineData.find(t => t.id === marker.id);
                                if (item && item.category) {
                                    router.push(`/systems/${item.category}`);
                                }
                            }}
                            onSpin={handleSpin}
                        />
                    </div>

                    <div className={`absolute w-[800px] h-[800px] rounded-full border border-white/10 pointer-events-none transition-opacity duration-1000 ${isPoweredOn ? 'opacity-100' : 'opacity-0'}`}></div>

                    {timelineData.map((item, index) => {
                        const isExpanded = expandedItems[item.id];
                        const position = isPoweredOn ? calculateNodePosition(index, timelineData.length) : { x: 0, y: 0, zIndex: 0, opacity: 0 };
                        const isRelated = isRelatedToActive(item.id);
                        const isPulsing = pulseEffect[item.id];
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.id}
                                ref={(el) => { nodeRefs.current[item.id] = el; }}
                                className={`absolute transition-all duration-700 pointer-events-none z-50 flex items-center justify-center w-full h-full ${isPoweredOn ? 'opacity-100' : 'opacity-0'}`}
                            >
                                {!isExpanded && isPoweredOn && (
                                    <div
                                        className="absolute transition-all duration-700 cursor-pointer pointer-events-auto"
                                        style={{
                                            transform: `translate(${position.x}px, ${position.y}px)`,
                                            zIndex: position.zIndex,
                                            opacity: position.opacity,
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleItem(item.id);
                                        }}
                                    >
                                        <div
                                            className={`absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse duration-1000" : ""}`}
                                            style={{
                                                background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
                                                width: `${item.energy * 0.5 + 40}px`,
                                                height: `${item.energy * 0.5 + 40}px`,
                                                left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                                                top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                                            }}
                                        ></div>

                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center bg-black text-white border-2 ${isRelated ? "border-white animate-pulse" : "border-white/40"} transition-all duration-300`}
                                        >
                                            <Icon size={16} />
                                        </div>

                                        <div className={`absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300 ${isRelated ? "text-white scale-125" : "text-white/70"}`}>
                                            {item.title}
                                        </div>
                                    </div>
                                )}

                                {isExpanded && (
                                    <>
                                        <div className="absolute top-[16%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] scale-125 pointer-events-auto z-[100] transition-all animate-in zoom-in duration-300">
                                            <Icon size={24} />
                                        </div>

                                        <Card className="absolute top-[16%] mt-10 left-1/2 -translate-x-1/2 w-80 bg-black/90 backdrop-blur-lg border-white/20 shadow-2xl shadow-black/50 overflow-visible pointer-events-auto z-[99]">
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50"></div>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-center">
                                                    <Badge
                                                        className={`px-2 text-xs ${getStatusStyles(
                                                            item.status
                                                        )}`}
                                                    >
                                                        {item.status === "completed"
                                                            ? "COMPLETE"
                                                            : item.status === "in-progress"
                                                                ? "IN PROGRESS"
                                                                : "PENDING"}
                                                    </Badge>
                                                    <span className="text-xs font-mono text-white/50">
                                                        {item.date}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-sm mt-2">
                                                    {item.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-xs text-white/80">
                                                <p>{item.content}</p>

                                                <div className="mt-4 pt-3 border-t border-white/10">
                                                    <div className="flex justify-between items-center text-xs mb-1">
                                                        <span className="flex items-center">
                                                            <Zap size={10} className="mr-1" />
                                                            Energy Level
                                                        </span>
                                                        <span className="font-mono">{item.energy}%</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                            style={{ width: `${item.energy}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-white/10 flex justify-center">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full flex items-center justify-center h-8 px-4 text-xs font-semibold rounded bg-white text-black hover:bg-white/80 hover:text-black transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] border-none uppercase tracking-widest"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (item.category) {
                                                                router.push(`/systems/${item.category}`);
                                                            }
                                                        }}
                                                    >
                                                        Enter {item.title} System
                                                        <ArrowRight
                                                            size={12}
                                                            className="ml-2"
                                                        />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
