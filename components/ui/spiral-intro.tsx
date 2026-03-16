'use client'

import { SpiralAnimation } from "@/components/ui/spiral-animation"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bebas_Neue } from "@/lib/font-shim"

const bebas = Bebas_Neue({ subsets: ["latin"] });

const SpiralIntro = ({ onEnter }: { onEnter: () => void }) => {
  const [startVisible, setStartVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  // Fade in the start button after animation loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  const handleEnter = () => {
    setIsExiting(true)
    setTimeout(onEnter, 1000)
  }
  
  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 w-full h-full z-[100] overflow-hidden bg-black"
        >
          {/* Spiral Animation */}
          <div className="absolute inset-0">
            <SpiralAnimation />
          </div>
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-center space-y-8"
            >
               <h2 className={`${bebas.className} text-4xl md:text-6xl text-white tracking-[0.5em] uppercase opacity-20`}>
                Improve
              </h2>
              
              <motion.button 
                onClick={handleEnter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: startVisible ? 1 : 0, y: startVisible ? 0 : 20 }}
                whileHover={{ scale: 1.1, letterSpacing: "0.4em" }}
                whileTap={{ scale: 0.9 }}
                className={`${bebas.className} text-white text-3xl md:text-5xl tracking-[0.3em] uppercase font-light border border-white/20 px-12 py-4 hover:bg-white hover:text-black transition-all duration-500`}
              >
                Launch Sales Machine
              </motion.button>
              
              <p className="text-[10px] uppercase tracking-[0.8em] text-white/20 font-black">
                Neural Protocol Initialization
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { SpiralIntro }
