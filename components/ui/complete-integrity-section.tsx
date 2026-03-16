"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Ballet, Bebas_Neue } from "@/lib/font-shim";

const ballet = Ballet({ subsets: ["latin"] });
const bebas = Bebas_Neue({ subsets: ["latin"] });

export function CompleteIntegritySection() {
  return (
    <div className="relative w-full h-[600px] md:h-[800px] bg-black rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
      {/* Starry Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop"
          alt="Integrity Background"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* Content Container */}
      <div className="relative h-full flex items-center justify-center px-4">
          {/* Central Logo with slanted line */}
          <div className="absolute z-10 scale-75 md:scale-100">
             <Image 
                src="/logo final.png" 
                alt="IMPROVE Logo" 
                width={400} 
                height={400} 
                className="mix-blend-lighten"
             />
          </div>

          <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-32 md:gap-0 relative z-20">
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`${ballet.className} text-7xl md:text-8xl lg:text-[9rem] text-blue-100/90 tracking-tighter mix-blend-difference`}
            >
              Complete
            </motion.h2>

            <motion.h2
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className={`${ballet.className} text-7xl md:text-8xl lg:text-[9rem] text-blue-100/90 tracking-tighter mix-blend-difference`}
            >
              Integrity
            </motion.h2>
          </div>
      </div>

      {/* Aesthetic Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
      </div>
    </div>
  );
}
