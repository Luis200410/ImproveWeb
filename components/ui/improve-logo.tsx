"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bebas_Neue } from "@/lib/font-shim";

const bebas = Bebas_Neue({ subsets: ["latin"] });

interface ImproveLogoProps {
    className?: string;
    small?: boolean;
    hero?: boolean;
}

export function ImproveLogo({ className = "", small = false, hero = false }: ImproveLogoProps) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`relative ${small ? 'w-32 h-16' : hero ? 'w-[1000px] h-[500px]' : 'w-[400px] h-[200px]'}`}
            >
                <Image
                    src="/logo final.png"
                    alt="IMPROVE — Complete Integrity"
                    fill
                    className="object-contain"
                    priority
                />
            </motion.div>
        </div>
    );
}
