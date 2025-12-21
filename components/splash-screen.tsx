"use client";

import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{opacity: 1}}
        exit={{opacity: 0}}
        transition={{duration: 0.5}}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
        {/* Logo container */}
        <motion.div
          initial={{scale: 0.5, opacity: 0, rotateY: 180}}
          animate={{scale: 1, opacity: 1, rotateY: 360}}
          exit={{scale: 1.2, opacity: 0, rotateY: 180}}
          transition={{
            scale: {
              type: "spring",
              stiffness: 350,
              damping: 18,
            },
            opacity: {duration: 0.6},
            rotateY: {
              type: "tween",
              duration: 2,
              ease: "easeInOut",
            },
          }}
          className="relative"
          style={{perspective: "1000px"}}>
          {/* Logo */}
          <motion.img
            src="/logo.jpg"
            alt="VE Logo"
            width="auto"
            height="auto"
            className="w-64 h-64 object-contain drop-shadow-[0_0_80px_rgba(0,200,255,0.8)]"
            animate={{
              filter: [
                "drop-shadow(0 0 80px rgba(0,200,255,0.8))",
                "drop-shadow(0 0 120px rgba(255,0,200,0.8))",
                "drop-shadow(0 0 80px rgba(0,200,255,0.8))",
              ],
            }}
            transition={{
              type: "tween",
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          />

          {/* Orbiting particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
              style={{transformOrigin: "0 0"}}
              animate={{
                rotate: 360,
                x: Math.cos((i / 8) * Math.PI * 2) * 150,
                y: Math.sin((i / 8) * Math.PI * 2) * 150,
              }}
              transition={{
                rotate: {duration: 3, repeat: Infinity, ease: "linear"},
                x: {duration: 3, repeat: Infinity, ease: "easeInOut"},
                y: {duration: 3, repeat: Infinity, ease: "easeInOut"},
              }}
            />
          ))}
        </motion.div>

        {/* Glow rings */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3]}}
          transition={{
            type: "tween",
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}>
          <div className="w-96 h-96 rounded-full border-4 border-cyan-500/30 blur-sm" />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{scale: [1.2, 1.8, 1.2], opacity: [0.2, 0.4, 0.2]}}
          transition={{
            type: "tween",
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}>
          <div className="w-96 h-96 rounded-full border-4 border-purple-500/20 blur-md" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
