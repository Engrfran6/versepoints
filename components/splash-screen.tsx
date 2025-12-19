"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
          animate={{
            scale: [0.5, 1.1, 1],
            opacity: 1,
            rotateY: [180, 360, 0],
          }}
          exit={{ scale: 1.2, opacity: 0, rotateY: 180 }}
          transition={{
            duration: 2,
            scale: { times: [0, 0.6, 1], type: "spring", stiffness: 100 },
            rotateY: { times: [0, 0.5, 1], duration: 2 },
          }}
          className="relative"
          style={{ perspective: "1000px" }}
        >
          <motion.img
            src="/logo.jpg"
            alt="VE Logo"
            className="w-64 h-64 object-contain drop-shadow-[0_0_80px_rgba(0,200,255,0.8)]"
            animate={{
              filter: [
                "drop-shadow(0 0 80px rgba(0,200,255,0.8))",
                "drop-shadow(0 0 120px rgba(255,0,200,0.8))",
                "drop-shadow(0 0 80px rgba(0,200,255,0.8))",
              ],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeInOut",
            }}
          />

          {/* Orbiting particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
              style={{
                transformOrigin: "0 0",
              }}
              animate={{
                rotate: 360,
                x: [0, Math.cos((i / 8) * Math.PI * 2) * 150],
                y: [0, Math.sin((i / 8) * Math.PI * 2) * 150],
              }}
              transition={{
                rotate: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                x: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                y: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              }}
            />
          ))}
        </motion.div>

        {/* Animated glow rings */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div className="w-96 h-96 rounded-full border-4 border-cyan-500/30 blur-sm" />
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1.2, 1.8, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.3,
          }}
        >
          <div className="w-96 h-96 rounded-full border-4 border-purple-500/20 blur-md" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
