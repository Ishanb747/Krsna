"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useTimer } from "@/hooks/useTimer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function GlobalBackground() {
  const { theme } = useTheme();
  const { isActive } = useTimer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      <AnimatePresence mode="wait">
        {theme === "dark" ? (
          <motion.div
            key="dark-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-[#2d1b4e] to-[#1a0b2e]"
          >
            {/* Hand-drawn Moon */}
            <motion.div
              className="absolute top-20 right-20 opacity-80"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
               <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M70.7107 84.8528C80.4738 75.0897 80.4738 59.2606 70.7107 49.4975C60.9476 39.7344 45.1184 39.7344 35.3553 49.4975C32.2215 52.6313 30.1184 56.4556 29.0476 60.5C28.5 58.5 28.5 56.5 29.0476 54.5C30.1184 50.4556 32.2215 46.6313 35.3553 43.4975C45.1184 33.7344 60.9476 33.7344 70.7107 43.4975C80.4738 53.2606 80.4738 69.0897 70.7107 78.8528C67.5769 81.9866 63.7526 84.0897 59.7082 85.1605C63.7526 86.2313 67.5769 88.3344 70.7107 84.8528Z" fill="#F1FA8C" stroke="#F1FA8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M35.3553 49.4975C25.5922 59.2606 25.5922 75.0897 35.3553 84.8528C45.1184 94.6159 60.9476 94.6159 70.7107 84.8528" stroke="#F1FA8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4"/>
               </svg>
            </motion.div>

            {/* Hand-drawn Stars */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
                  scale: Math.random() * 0.5 + 0.5,
                  opacity: Math.random() * 0.5 + 0.3,
                  rotate: Math.random() * 360,
                }}
                animate={
                  isActive
                    ? {
                        y: [null, 1000], // Move down when active
                        opacity: [null, 0],
                      }
                    : {
                        opacity: [0.3, 0.8, 0.3], // Twinkle when inactive
                        rotate: [0, 10, -10, 0],
                      }
                }
                transition={
                  isActive
                    ? {
                        duration: Math.random() * 2 + 2,
                        repeat: Infinity,
                        ease: "linear",
                      }
                    : {
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }
                }
              >
                <StarSVG size={Math.random() * 15 + 10} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="light-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-[#4facfe] to-[#00f2fe]"
          >
            {/* Glowing Sun */}
            <motion.div
              className="absolute top-10 right-10"
              animate={
                isActive
                  ? { scale: [1, 1.2, 1], rotate: 360 }
                  : { scale: [1, 1.05, 1], rotate: 0 }
              }
              transition={{
                scale: { duration: 4, repeat: Infinity },
                rotate: { duration: 60, repeat: Infinity, ease: "linear" },
              }}
            >
              {/* Sun Core */}
              <div className="w-32 h-32 bg-[#ffb703] rounded-full shadow-[0_0_60px_rgba(255,183,3,0.8)] relative z-10" />
              
              {/* Sun Rays */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-48 h-2 bg-[#ffb703] opacity-40 rounded-full origin-left"
                  style={{
                    transform: `translateY(-50%) rotate(${i * 30}deg)`,
                  }}
                />
              ))}
            </motion.div>

            {/* Clouds - Layer 1 (Slow) */}
            <motion.div
              className="absolute top-20 left-0 opacity-80"
              animate={{ x: ["-20%", "120%"] }}
              transition={{
                duration: isActive ? 40 : 120,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Cloud width={200} />
            </motion.div>

            {/* Clouds - Layer 2 (Medium) */}
            <motion.div
              className="absolute top-40 left-0 opacity-60"
              animate={{ x: ["-20%", "120%"] }}
              transition={{
                duration: isActive ? 30 : 90,
                repeat: Infinity,
                ease: "linear",
                delay: 10,
              }}
            >
              <Cloud width={150} />
            </motion.div>

            {/* Clouds - Layer 3 (Fast) */}
            <motion.div
              className="absolute top-60 left-0 opacity-40"
              animate={{ x: ["-20%", "120%"] }}
              transition={{
                duration: isActive ? 20 : 60,
                repeat: Infinity,
                ease: "linear",
                delay: 5,
              }}
            >
              <Cloud width={100} />
            </motion.div>

            {/* Hills */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[#70e000] rounded-t-[100%] scale-150 translate-y-10" />
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-[#38b000] rounded-t-[80%] scale-125 translate-x-20 translate-y-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple SVG Cloud Component
function Cloud({ width }: { width: number }) {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.5,19c-0.83,0-1.5-0.67-1.5-1.5c0-0.83,0.67-1.5,1.5-1.5c0.83,0,1.5,0.67,1.5,1.5C19,18.33,18.33,19,17.5,19z M19,16.5 c0-2.48-2.02-4.5-4.5-4.5c-0.72,0-1.39,0.17-2,0.47c-0.59-1.96-2.41-3.47-4.5-3.47c-2.48,0-4.5,2.02-4.5,4.5c0,0.1,0.01,0.2,0.02,0.29 C1.99,14.24,1,15.5,1,17c0,2.21,1.79,4,4,4h12.5c2.48,0,4.5-2.02,4.5-4.5S19.98,12,17.5,12" />
    </svg>
  );
}

// Hand-drawn Star SVG
function StarSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
        fill="#FFF" 
        stroke="#FFF" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.5))" }}
      />
    </svg>
  );
}
