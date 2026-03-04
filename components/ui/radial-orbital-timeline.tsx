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
    const containerRef = useRef<HTMLDivElement>(null);
    const orbitRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const router = useRouter();

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
                    className="absolute w-full h-[800px] flex items-center justify-center"
                    ref={orbitRef}
                    style={{
                        perspective: "1000px",
                        transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
                    }}
                >
                    <div className="absolute z-10 flex items-center justify-center">
                        <div className="absolute w-[470px] h-[470px] rounded-full border border-white/20 animate-ping opacity-70"></div>
                        <div
                            className="absolute w-[530px] h-[530px] rounded-full border border-white/10 animate-ping opacity-50"
                            style={{ animationDelay: "0.5s" }}
                        ></div>
                        <InteractiveGlobe
                            size={460}
                            markers={globeMarkers}
                            onMarkerClick={(marker) => {
                                toggleItem(marker.id);
                            }}
                            onMarkerDoubleClick={(marker) => {
                                const item = timelineData.find(t => t.id === marker.id);
                                if (item && item.category) {
                                    router.push(`/systems/${item.category}`);
                                }
                            }}
                        />
                    </div>

                    <div className="absolute w-[680px] h-[680px] rounded-full border border-white/10"></div>

                    {timelineData.map((item) => {
                        const isExpanded = expandedItems[item.id];
                        if (!isExpanded) return null;

                        const Icon = item.icon;

                        return (
                            <div
                                key={item.id}
                                className="absolute transition-all duration-700 pointer-events-none z-50 flex items-center justify-center w-full h-full"
                            >
                                <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center bg-white text-black border-2 border-white shadow-lg shadow-white/30 scale-150 pointer-events-auto z-[100] transition-all animate-in zoom-in">
                                    <Icon size={18} />
                                </div>

                                <Card className="absolute top-[600px] left-1/2 -translate-x-1/2 w-80 bg-black/90 backdrop-blur-lg border-white/30 shadow-xl shadow-white/10 overflow-visible pointer-events-auto z-[99]">
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

                                        {item.relatedIds.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-white/10">
                                                <div className="flex items-center mb-2">
                                                    <Link size={10} className="text-white/70 mr-1" />
                                                    <h4 className="text-xs uppercase tracking-wider font-medium text-white/70">
                                                        Connected Nodes
                                                    </h4>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.relatedIds.map((relatedId) => {
                                                        const relatedItem = timelineData.find(
                                                            (i) => i.id === relatedId
                                                        );
                                                        return (
                                                            <Button
                                                                key={relatedId}
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex items-center h-6 px-2 py-0 text-xs rounded-none border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleItem(relatedId);
                                                                }}
                                                            >
                                                                {relatedItem?.title}
                                                                <ArrowRight
                                                                    size={8}
                                                                    className="ml-1 text-white/60"
                                                                />
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
