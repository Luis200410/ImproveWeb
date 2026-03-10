"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bebas_Neue } from "@/lib/font-shim";

const bebas = Bebas_Neue({ subsets: ["latin"] });

// --- Data for the Eight Systems ---
const accordionItems = [
    {
        id: 1,
        title: 'Body',
        tagline: 'Physical Excellence',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop',
    },
    {
        id: 2,
        title: 'Money',
        tagline: 'Financial Mastery',
        imageUrl: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 3,
        title: 'Work',
        tagline: 'Professional Growth',
        imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 4,
        title: 'Productivity',
        tagline: 'Peak Performance',
        imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop',
    },
    {
        id: 5,
        title: 'Relationships',
        tagline: 'Deep Connections',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 6,
        title: 'Mind',
        tagline: 'Mental Clarity',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1999&auto=format&fit=crop',
    },
    {
        id: 7,
        title: 'Legacy',
        tagline: 'Meaningful Life',
        imageUrl: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=2126&auto=format&fit=crop',
    },
    {
        id: 8,
        title: 'Knowledge',
        tagline: 'Wisdom Building',
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop',
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
        relative h-[450px] rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-700 ease-in-out border border-white/10
        ${isActive ? 'w-[300px] md:w-[450px] border-white/30' : 'w-[60px] md:w-[80px]'}
      `}
            onMouseEnter={onMouseEnter}
        >
            {/* Background Image */}
            <img
                src={item.imageUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/400x450/2d3748/ffffff?text=Image+Error'; }}
            />
            {/* Dark overlay for better text readability */}
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-700 ${isActive ? 'opacity-20' : 'opacity-60'}`}></div>

            {/* Caption Text */}
            <div
                className={`
          absolute w-full px-6
          transition-all duration-500 ease-in-out
          ${isActive
                        ? 'bottom-8 left-0 opacity-100' // Active state: horizontal, bottom
                        : 'bottom-24 left-1/2 -translate-x-1/2 rotate-90 opacity-40' // Inactive state
                    }
        `}
            >
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <span className={`${bebas.className} text-white text-xl md:text-3xl font-bold whitespace-nowrap`}>
                        {item.title}
                    </span>
                    {isActive && (
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${bebas.className} text-white/60 text-xs md:text-sm mt-2 uppercase tracking-[0.2em]`}
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
export function EightSystemsAccordion() {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleItemHover = (index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className="w-full py-12">
            <div className="flex flex-row items-center justify-center gap-2 md:gap-4 overflow-hidden p-4">
                {accordionItems.map((item, index) => (
                    <AccordionItem
                        key={item.id}
                        item={item}
                        isActive={index === activeIndex}
                        onMouseEnter={() => handleItemHover(index)}
                    />
                ))}
            </div>
        </div>
    );
}
