"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bebas_Neue } from "@/lib/font-shim";

const bebas = Bebas_Neue({ subsets: ["latin"] });

// --- Data for the Eight Systems ---
const accordionItems = [
    {
        id: 1,
        title: 'Body Optimization',
        tagline: 'Physical optimization and peak performance.',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop',
    },
    {
        id: 8,
        title: 'Second Brain & Knowledge',
        tagline: 'Your digital cortex for knowledge management.',
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop',
    },
    {
        id: 2,
        title: 'Money & Wealth System',
        tagline: 'Financial intelligence and wealth architecture.',
        imageUrl: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 5,
        title: 'Relationships & Social Capital',
        tagline: 'Cultivating high-value social capital.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 6,
        title: 'Mind, Emotions & Clarity',
        tagline: 'Mental clarity and psychological resilience.',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1999&auto=format&fit=crop',
    },
    {
        id: 7,
        title: 'Legacy & Strategic Fun',
        tagline: 'Strategic recovery and long-term impact.',
        imageUrl: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=2126&auto=format&fit=crop',
    },
    {
        id: 4,
        title: 'Execution & Productivity',
        tagline: 'Workflow efficiency and deep execution.',
        imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop',
    },
    {
        id: 3,
        title: 'Professional Work Mastery',
        tagline: 'Professional excellence and project mastery.',
        imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
    },
];

interface AccordionItemData {
    id: number;
    title: string;
    tagline: string;
    imageUrl: string;
}

interface AccordionItemProps {
    item: AccordionItemData;
    isActive: boolean;
    onMouseEnter: () => void;
}

// --- Accordion Item Component ---
const AccordionItem = ({ item, isActive, onMouseEnter }: AccordionItemProps) => {
    return (
        <motion.div
            layout
            className={`
        relative overflow-hidden cursor-pointer
        transition-all duration-700 ease-in-out border border-white/10
        ${isActive 
            ? 'flex-[10] md:flex-[4] h-[400px] md:h-[500px] border-white/30 rounded-2xl' 
            : 'flex-[1] md:flex-[1] h-[60px] md:h-[500px] opacity-60 rounded-xl md:rounded-2xl'
        }
      `}
            onMouseEnter={onMouseEnter}
            onClick={onMouseEnter} // Also for touch
        >
            {/* Background Image */}
            <motion.img
                src={item.imageUrl}
                alt={item.title}
                initial={false}
                animate={{ scale: isActive ? 1.05 : 1.2 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-opacity"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/800x600/2d3748/ffffff?text=Image+Error'; }}
            />
            {/* Dark overlay for better text readability */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-700 ${isActive ? 'opacity-60' : 'opacity-80'}`}></div>

            {/* Caption Text */}
            <div
                className={`
          absolute w-full px-6 flex flex-col justify-end
          transition-all duration-700 ease-in-out
          ${isActive
                        ? 'bottom-6 md:bottom-10 left-0 opacity-100' // Active state
                        : 'bottom-0 top-0 left-0 right-0 flex items-center justify-center' // Inactive state
                    }
        `}
            >
                <div className={`flex flex-col ${isActive ? 'items-start text-left' : 'items-center text-center'}`}>
                    <span 
                        className={`
                            ${bebas.className} text-white font-bold leading-none uppercase tracking-tighter
                            ${isActive 
                                ? 'text-2xl md:text-5xl mb-2' 
                                : 'text-sm md:text-2xl md:-rotate-90 md:whitespace-nowrap'
                            }
                        `}
                    >
                        {item.title}
                    </span>
                    {isActive && (
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${bebas.className} text-white/70 text-[10px] md:text-lg uppercase tracking-[0.2em] max-w-[250px] md:max-w-md leading-tight`}
                        >
                            {item.tagline}
                        </motion.span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};


// --- Main App Component ---
export function EightSystemsAccordion({ activeTime = 0 }: { activeTime?: number }) {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [isManual, setIsManual] = React.useState(false);

    // Choreographed auto-display based on audio timing
    React.useEffect(() => {
        if (isManual) return; // Users can override with hover

        if (activeTime >= 50.0) setActiveIndex(7);
        else if (activeTime >= 49.0) setActiveIndex(6);
        else if (activeTime >= 47.0) setActiveIndex(5);
        else if (activeTime >= 46.0) setActiveIndex(4);
        else if (activeTime >= 45.0) setActiveIndex(3);
        else if (activeTime >= 44.0) setActiveIndex(2);
        else if (activeTime >= 43.0) setActiveIndex(1);
        else if (activeTime >= 41.0) setActiveIndex(0);
    }, [activeTime, isManual]);

    const handleItemHover = (index: number) => {
        setIsManual(true);
        setActiveIndex(index);
    };

    return (
        <div className="w-full py-8 md:py-12">
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-3 md:gap-4 max-w-[1400px] mx-auto px-4 min-h-[600px] md:h-[600px]">
                {accordionItems.map((item, index) => (
                    <AccordionItem
                        key={item.id}
                        item={index === activeIndex ? { ...item } : item}
                        isActive={index === activeIndex}
                        onMouseEnter={() => handleItemHover(index)}
                    />
                ))}
            </div>
        </div>
    );
}
