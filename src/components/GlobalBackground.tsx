"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useTimer } from "@/hooks/useTimer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, memo } from "react";

export default function GlobalBackground() {
  const { theme, themeVariant } = useTheme();
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
          <MemoizedDarkThemeBackground key={themeVariant} variant={themeVariant} isActive={isActive} />
        ) : (
          <MemoizedLightThemeBackground key={themeVariant} variant={themeVariant} isActive={isActive} />
        )}
      </AnimatePresence>
    </div>
  );
}

const MemoizedLightThemeBackground = memo(function LightThemeBackground({ variant, isActive }: { variant: string; isActive: boolean }) {
  if (variant === "sunny-meadow") {
    return <SunnyMeadowBg isActive={isActive} />;
  }
  if (variant === "cloudy-sky") {
    return <CloudySkyBg isActive={isActive} />;
  }
  if (variant === "cherry-blossom") {
    return <CherryBlossomBg isActive={isActive} />;
  }
  if (variant === "ocean-breeze") {
    return <OceanBreezeBg isActive={isActive} />;
  }
  if (variant === "autumn-path") {
    return <AutumnPathBg isActive={isActive} />;
  }
  // Default: morning-mist
  return <MorningMistBg isActive={isActive} />;
});

const MemoizedDarkThemeBackground = memo(function DarkThemeBackground({ variant, isActive }: { variant: string; isActive: boolean }) {
  if (variant === "midnight-forest") {
    return <MidnightForestBg isActive={isActive} />;
  }
  if (variant === "nebula") {
    return <NebulaBg isActive={isActive} />;
  }
  if (variant === "rainy-window") {
    return <RainyWindowBg isActive={isActive} />;
  }
  if (variant === "firefly-sanctuary") {
    return <FireflySanctuaryBg isActive={isActive} />;
  }
  if (variant === "aurora-borealis") {
    return <AuroraBorealisBg isActive={isActive} />;
  }
  // Default: starry-night
  return <StarryNightBg isActive={isActive} />;
});

// ====== LIGHT THEMES ======

function MorningMistBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-b from-[#ffecd2] via-[#fcb69f] to-[#ff9a9e]"
    >
      {/* Soft Orbs */}
      {[...Array(10)].map((_, i) => {
        const startX = (i * 23) % 100; // Spread evenly
        const startY = (i * 37) % 100;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: 100 + (i % 3) * 50,
              height: 100 + (i % 3) * 50,
              left: `${startX}%`,
              top: `${startY}%`,
            }}
            animate={{
              x: [0, (i % 2 === 0 ? 50 : -50)],
              y: [0, (i % 2 === 0 ? -50 : 50)],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse",
            }}
          />
        );
      })}
    </motion.div>
  );
}

function SunnyMeadowBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-b from-[#FFE5B4] via-[#FFDAB3] to-[#F4E4C1]"
    >
      {/* Warm, large sun */}
      <motion.div className="absolute top-16 right-24">
        <motion.div
          className="relative w-40 h-40 bg-[#FFD700] rounded-full"
          style={{
            boxShadow: '0 0 100px 40px rgba(255, 215, 0, 0.4)',
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Layered hills with warm tones */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#8B7355] to-[#C4A77D]" 
        style={{ clipPath: "ellipse(180% 100% at 50% 100%)" }} 
      />
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-[#9ACD32] to-[#B8D77D] opacity-90" 
        style={{ clipPath: "ellipse(160% 100% at 30% 100%)" }} 
      />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#A8C256] to-[#C8DC88] opacity-80" 
        style={{ clipPath: "ellipse(140% 100% at 70% 100%)" }} 
      />
      
      {/* Wheat/grass field - swaying */}
      {[...Array(25)].map((_, i) => {
        const posX = (i * 4) % 100;
        return (
          <motion.div
            key={`wheat-${i}`}
            className="absolute bottom-0 w-1 bg-gradient-to-t from-[#8B7355] to-[#D4AF37] origin-bottom opacity-60"
            style={{
              left: `${posX}%`,
              height: `${30 + (i % 5) * 10}px`,
            }}
            animate={{
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 8) * 0.3,
            }}
          />
        );
      })}

      {/* Dandelion seeds floating */}
      {[...Array(12)].map((_, i) => {
        const posX = (i * 27) % 100;
        const posY = 20 + (i % 5) * 10;
        return (
          <motion.div
            key={`seed-${i}`}
            className="absolute"
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
            }}
            animate={{
              x: [0, 30, 60],
              y: [0, -20, 40, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="1.5" fill="#FFF" opacity="0.9"/>
              {[...Array(8)].map((_, j) => (
                <line
                  key={j}
                  x1="6"
                  y1="6"
                  x2={6 + Math.cos((j * Math.PI) / 4) * 5}
                  y2={6 + Math.sin((j * Math.PI) / 4) * 5}
                  stroke="#FFF"
                  strokeWidth="0.5"
                  opacity="0.7"
                />
              ))}
            </svg>
          </motion.div>
        );
      })}

      {/* Soft, warm clouds */}
      {[...Array(4)].map((_, i) => {
        const posY = 10 + i * 12;
        return (
          <motion.div
            key={`cloud-${i}`}
            className="absolute opacity-30"
            style={{ top: `${posY}%` }}
            animate={{ x: [-100, typeof window !== "undefined" ? window.innerWidth + 100 : 1100] }}
            transition={{
              duration: 60 + i * 15,
              repeat: Infinity,
              ease: "linear",
              delay: i * 15,
            }}
          >
            <svg width={120 + i * 30} viewBox="0 0 24 24" fill="#FFF">
              <path d="M17.5,19c-0.83,0-1.5-0.67-1.5-1.5c0-0.83,0.67-1.5,1.5-1.5c0.83,0,1.5,0.67,1.5,1.5C19,18.33,18.33,19,17.5,19z M19,16.5 c0-2.48-2.02-4.5-4.5-4.5c-0.72,0-1.39,0.17-2,0.47c-0.59-1.96-2.41-3.47-4.5-3.47c-2.48,0-4.5,2.02-4.5,4.5c0,0.1,0.01,0.2,0.02,0.29 C1.99,14.24,1,15.5,1,17c0,2.21,1.79,4,4,4h12.5c2.48,0,4.5-2.02,4.5-4.5S19.98,12,17.5,12" />
            </svg>
          </motion.div>
        );
      })}

      {/* Gentle light particles */}
      {[...Array(15)].map((_, i) => {
        const posX = (i * 19) % 100;
        const posY = (i * 31) % 80;
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-40"
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 8 + (i % 4) * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 7) * 0.8,
            }}
          />
        );
      })}
    </motion.div>
  );
}

function CloudySkyBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF]"
    >
      {/* Large fluffy clouds */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute"
          style={{ 
            top: `${5 + i * 12}%`,
            opacity: 0.7 - i * 0.05,
          }}
          animate={{ x: [-150, typeof window !== "undefined" ? window.innerWidth + 150 : 1150] }}
          transition={{
            duration: 50 + i * 15,
            repeat: Infinity,
            ease: "linear",
            delay: i * 6,
          }}
        >
          <Cloud width={150 + i * 25} />
        </motion.div>
      ))}

      {/* Birds */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`bird-${i}`}
          className="absolute"
          initial={{
            x: -30,
            y: 50 + Math.random() * 200,
          }}
          animate={{
            x: [null, typeof window !== "undefined" ? window.innerWidth + 30 : 1030],
            y: [null, 60 + Math.random() * 180],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 4,
          }}
        >
          <motion.svg
            width="20"
            height="12"
            viewBox="0 0 20 12"
            animate={{ 
              scaleY: [1, 0.8, 1],
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path d="M0 6 Q5 0, 10 6 Q15 0, 20 6" stroke="#333" strokeWidth="2" fill="none" />
          </motion.svg>
        </motion.div>
      ))}

      {/* Light rays from sun */}
      <div className="absolute top-0 right-10 w-48 h-48 opacity-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 left-1/2 w-2 h-full bg-yellow-200 origin-top"
            style={{ transform: `rotate(${i * 30}deg)` }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ====== DARK THEMES ======

function StarryNightBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-[#1a1c2c] overflow-hidden"
    >
      {/* Deep Blue/Black Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1026] via-[#2b32b2] to-[#1a1c2c] opacity-80" />

      {/* Van Gogh Swirls - Large */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`swirl-lg-${i}`}
          className="absolute opacity-30"
          style={{
            top: `${20 + i * 15}%`,
            left: `${-20 + i * 25}%`,
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
            transform: `rotate(${i * 45}deg)`,
          }}
          animate={{
            rotate: [i * 45, i * 45 + 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 40 + i * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Stylized Wind/Swirls SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {[...Array(8)].map((_, i) => (
          <motion.path
            key={`wind-${i}`}
            d={`M${-100 + i * 200},${100 + i * 50} Q${300 + i * 100},${-100 + i * 100} ${800 + i * 100},${300 + i * 50} T${1500 + i * 100},${100 + i * 50}`}
            fill="none"
            stroke={i % 2 === 0 ? "#a8c0ff" : "#fbc2eb"}
            strokeWidth="2"
            strokeDasharray="20 40"
            filter="url(#glow)"
            animate={{
              strokeDashoffset: [0, -1000],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>

      {/* Crescent Moon - Glowing Orange/Yellow */}
      <motion.div
        className="absolute top-10 right-10 w-24 h-24 rounded-full bg-[#f1c40f]"
        style={{
          boxShadow: '0 0 60px 20px rgba(241, 196, 15, 0.4)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 60px 20px rgba(241, 196, 15, 0.4)',
            '0 0 80px 30px rgba(241, 196, 15, 0.6)',
            '0 0 60px 20px rgba(241, 196, 15, 0.4)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Moon Crater/Texture effect */}
        <div className="absolute top-2 right-2 w-20 h-20 rounded-full bg-[#1a1c2c] opacity-20" style={{ transform: 'translate(20%, -20%)' }} />
      </motion.div>

      {/* Stars - Large, Haloed */}
      {[...Array(12)].map((_, i) => {
        const size = 4 + Math.random() * 6;
        return (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full bg-[#fffacd]"
            style={{
              top: `${Math.random() * 60}%`,
              left: `${Math.random() * 100}%`,
              width: size,
              height: size,
              boxShadow: `0 0 ${size * 4}px ${size * 2}px rgba(255, 250, 205, 0.3)`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        );
      })}

      {/* Cypress Tree Silhouette */}
      <div className="absolute bottom-0 left-10 w-32 h-[60vh] bg-[#000000] opacity-90" 
           style={{ 
             clipPath: "polygon(40% 0%, 60% 10%, 80% 30%, 70% 50%, 90% 70%, 80% 100%, 20% 100%, 10% 70%, 30% 50%, 20% 30%, 40% 10%)",
             filter: "blur(1px)"
           }} 
      />
      <div className="absolute bottom-0 left-24 w-24 h-[40vh] bg-[#000000] opacity-80" 
           style={{ 
             clipPath: "polygon(50% 0%, 70% 20%, 60% 50%, 80% 80%, 70% 100%, 30% 100%, 20% 80%, 40% 50%, 30% 20%)",
             filter: "blur(1px)"
           }} 
      />

      {/* Village Silhouette (Distant) */}
      <div className="absolute bottom-0 right-0 w-full h-32 bg-[#050510]" 
           style={{ 
             clipPath: "polygon(0% 100%, 10% 90%, 15% 95%, 20% 85%, 25% 90%, 30% 80%, 40% 95%, 50% 85%, 60% 90%, 70% 80%, 80% 95%, 90% 85%, 100% 100%)",
           }} 
      />
    </motion.div>
  );
}

function MidnightForestBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364]"
    >
      {/* Fireflies - consistent positioning */}
      {[...Array(20)].map((_, i) => {
        const posX = (i * 29) % 100;
        const posY = (i * 47) % 100;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#9FEF00] rounded-full shadow-[0_0_10px_#9FEF00]"
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
            }}
            animate={{
              x: [0, (i % 2 === 0 ? 50 : -50), 0],
              y: [0, (i % 2 === 0 ? -50 : 50), 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 5) * 0.4,
            }}
          />
        );
      })}
      
      {/* Tree silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/50 to-transparent" />
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 bg-black/40"
          style={{
            left: `${i * 15 + 5}%`,
            width: '60px',
            height: `${200 + (i % 3) * 50}px`,
            clipPath: 'polygon(50% 0%, 30% 100%, 70% 100%)',
          }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </motion.div>
  );
}

function NebulaBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-br from-[#4E54C8] via-[#8F94FB] to-[#E94560]"
    >
      {/* Cosmic clouds - consistent positioning */}
      {[...Array(8)].map((_, i) => {
        const posX = (i * 43) % 100;
        const posY = (i * 31) % 100;
        const size = 200 + (i % 3) * 100;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${posX}%`,
              top: `${posY}%`,
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(233, 69, 96, 0.3)' : 'rgba(143, 148, 251, 0.3)'} 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              y: [0, (i % 2 === 0 ? -30 : 30), 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        );
      })}
      
      {/* Twinkling stars - consistent */}
      {[...Array(50)].map((_, i) => {
        const posX = (i * 19) % 100;
        const posY = (i * 41) % 100;
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 1.5 + (i % 3) * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 10) * 0.1,
            }}
          />
        );
      })}
    </motion.div>
  );
}

// ====== NEW LIGHT THEMES ======

function CherryBlossomBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-b from-[#FFDEE9] via-[#FFB7B2] to-[#B5FFFC]"
    >
      {/* Mount Fuji Silhouette */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/3 bg-white/30 blur-sm" 
           style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} 
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/3 bg-gradient-to-t from-[#a8c0ff] to-transparent opacity-50" 
           style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} 
      />

      {/* Detailed Cherry Tree Branch */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none opacity-90">
        <svg viewBox="0 0 200 150" className="w-full h-full">
          {/* Main Branch */}
          <path d="M200,0 Q150,50 100,30 T20,80" fill="none" stroke="#5D4037" strokeWidth="3" />
          <path d="M160,20 Q140,60 120,50" fill="none" stroke="#5D4037" strokeWidth="2" />
          <path d="M100,30 Q80,70 60,60" fill="none" stroke="#5D4037" strokeWidth="2" />
          
          {/* Blossoms on branch */}
          {[...Array(15)].map((_, i) => (
            <circle key={`b-${i}`} cx={40 + i * 10 + Math.random() * 10} cy={40 + i * 2 + Math.random() * 20} r="3" fill="#FF69B4" opacity="0.8" />
          ))}
          {[...Array(10)].map((_, i) => (
            <circle key={`b2-${i}`} cx={120 + i * 8} cy={30 + i * 3} r="2.5" fill="#FFB7B2" opacity="0.9" />
          ))}
        </svg>
      </div>

      {/* Falling Petals */}
      {[...Array(25)].map((_, i) => {
        const startX = Math.random() * 100;
        const delay = Math.random() * 10;
        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-[#FF9E9E]"
            style={{
              left: `${startX}%`,
              top: -20,
              borderRadius: "50% 0 50% 50%",
            }}
            animate={{
              y: [0, typeof window !== "undefined" ? window.innerHeight + 50 : 1000],
              x: [0, Math.sin(i) * 100],
              rotate: [0, 360],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 5,
              repeat: Infinity,
              ease: "linear",
              delay: delay,
            }}
          />
        );
      })}
    </motion.div>
  );
}

function OceanBreezeBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-b from-[#4facfe] to-[#00f2fe]"
    >
      {/* Gentle Waves */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 left-0 right-0 bg-white/20"
          style={{
            height: `${20 + i * 10}%`,
            borderRadius: "50% 50% 0 0",
            transform: `scaleX(${1.5 + i * 0.2})`,
          }}
          animate={{
            y: [0, -20, 0],
            scaleY: [1, 1.1, 1],
          }}
          transition={{
            duration: 5 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1,
          }}
        />
      ))}

      {/* Rising Bubbles */}
      {[...Array(15)].map((_, i) => {
        const startX = (i * 13) % 100;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/40 bg-white/10"
            style={{
              left: `${startX}%`,
              bottom: -20,
              width: 10 + (i % 4) * 10,
              height: 10 + (i % 4) * 10,
            }}
            animate={{
              y: [0, -(typeof window !== "undefined" ? window.innerHeight + 50 : 1000)],
              x: [0, (i % 2 === 0 ? 50 : -50)],
            }}
            transition={{
              duration: 15 + (i % 5) * 3,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          />
        );
      })}
    </motion.div>
  );
}

function AutumnPathBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-b from-[#f12711] via-[#f5af19] to-[#e65c00]"
    >
      {/* The Path */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#5D4037]" 
           style={{ clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)", opacity: 0.3 }} 
      />
      
      {/* Tree Trunks lining the path */}
      {[...Array(6)].map((_, i) => {
        const isLeft = i % 2 === 0;
        const depth = Math.floor(i / 2); // 0, 1, 2 (back to front)
        const scale = 0.5 + depth * 0.25;
        const xPos = isLeft ? `${20 - depth * 5}%` : `${80 + depth * 5}%`;
        
        return (
          <div 
            key={`tree-${i}`}
            className="absolute bottom-0 w-16 bg-[#3E2723]"
            style={{
              left: xPos,
              height: `${40 + depth * 15}%`,
              transform: 'translateX(-50%)',
              opacity: 0.8,
            }}
          >
            {/* Branches */}
            <div className="absolute top-0 left-0 w-full h-20 bg-[#d35400] rounded-full scale-150 -translate-y-1/2 opacity-90" />
          </div>
        );
      })}

      {/* Wooden Fence */}
      <div className="absolute bottom-10 left-0 w-1/3 h-20 border-t-4 border-[#5D4037] opacity-60" />
      <div className="absolute bottom-10 right-0 w-1/3 h-20 border-t-4 border-[#5D4037] opacity-60" />

      {/* Falling Maple Leaves */}
      {[...Array(20)].map((_, i) => {
        const startX = Math.random() * 100;
        return (
          <motion.div
            key={i}
            className="absolute w-4 h-4"
            style={{
              left: `${startX}%`,
              top: -20,
            }}
            animate={{
              y: [0, typeof window !== "undefined" ? window.innerHeight + 50 : 1000],
              x: [0, (i % 2 === 0 ? 100 : -100)],
              rotate: [0, 720],
              rotateX: [0, 360],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          >
            <svg viewBox="0 0 24 24" fill={['#d35400', '#e67e22', '#c0392b'][i % 3]}>
              <path d="M12,2 L14,8 L20,8 L16,12 L18,18 L12,15 L6,18 L8,12 L4,8 L10,8 Z" />
            </svg>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ====== NEW DARK THEMES ======

function RainyWindowBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-b from-[#1a1c2c] to-[#4a1c40]"
    >
      {/* Distant City Lights (Bokeh) */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`light-${i}`}
          className="absolute rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${50 + Math.random() * 50}%`,
            width: Math.random() * 20 + 10,
            height: Math.random() * 20 + 10,
            backgroundColor: ['#ff0055', '#00ffff', '#ffff00'][i % 3],
            opacity: 0.3,
          }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
        />
      ))}

      {/* Rain Droplets */}
      {[...Array(50)].map((_, i) => {
        const startX = (i * 7) % 100;
        return (
          <motion.div
            key={`rain-${i}`}
            className="absolute w-0.5 h-6 bg-blue-200/40"
            style={{
              left: `${startX}%`,
              top: -20,
            }}
            animate={{
              y: [0, typeof window !== "undefined" ? window.innerHeight + 20 : 1000],
            }}
            transition={{
              duration: 0.5 + (i % 5) * 0.1,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.02,
            }}
          />
        );
      })}

      {/* Window Frame & Condensation */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Glass Fog */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        
        {/* Window Grid */}
        <div className="absolute inset-0 border-[20px] border-[#1a1a1a]" />
        <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-[#1a1a1a] -translate-x-1/2" />
        <div className="absolute left-0 right-0 top-1/2 h-4 bg-[#1a1a1a] -translate-y-1/2" />
      </div>
    </motion.div>
  );
}

function FireflySanctuaryBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364]"
    >
      {/* Deep Forest Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

      {/* Floating Paper Lanterns */}
      {[...Array(8)].map((_, i) => {
        const startX = 10 + i * 12;
        return (
          <motion.div
            key={`lantern-${i}`}
            className="absolute"
            style={{
              left: `${startX}%`,
              bottom: -50,
            }}
            animate={{
              y: [0, -(typeof window !== "undefined" ? window.innerHeight + 100 : 1000)],
              x: [0, (i % 2 === 0 ? 20 : -20)],
            }}
            transition={{
              duration: 20 + (i % 3) * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          >
            {/* Lantern Body */}
            <div className="relative w-8 h-10 bg-gradient-to-b from-[#ff9966] to-[#ff5e62] rounded-lg shadow-[0_0_15px_#ff9966] opacity-90">
              <div className="absolute inset-x-0 top-0 h-1 bg-black/20" />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20" />
            </div>
            {/* String */}
            <div className="absolute top-10 left-1/2 w-0.5 h-4 bg-white/30 -translate-x-1/2" />
          </motion.div>
        );
      })}

      {/* Fireflies */}
      {[...Array(30)].map((_, i) => {
        const posX = (i * 13) % 100;
        const posY = (i * 29) % 100;
        return (
          <motion.div
            key={`firefly-${i}`}
            className="absolute w-1 h-1 bg-[#ADFF2F] rounded-full shadow-[0_0_5px_#ADFF2F]"
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        );
      })}
      
      {/* Foreground Grass Silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-black/40" 
           style={{ clipPath: "polygon(0% 100%, 10% 80%, 20% 100%, 30% 70%, 40% 100%, 50% 60%, 60% 100%, 70% 80%, 80% 100%, 90% 70%, 100% 100%)" }} 
      />
    </motion.div>
  );
}

function AuroraBorealisBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-[#0B1026]"
    >
      {/* Stars */}
      {[...Array(100)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
          }}
        />
      ))}

      {/* Multi-colored Aurora Curtains */}
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          background: "linear-gradient(45deg, transparent 40%, rgba(0, 255, 128, 0.3) 50%, transparent 60%)",
          filter: "blur(30px)",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%"],
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`aurora-${i}`}
          className="absolute top-0 left-0 right-0 h-2/3"
          style={{
            background: `linear-gradient(${160 + i * 20}deg, transparent 20%, ${['#00ff88', '#00ffff', '#bf00ff'][i]} 50%, transparent 80%)`,
            filter: "blur(40px)",
            transformOrigin: "top",
          }}
          animate={{
            scaleY: [1, 1.2, 1],
            x: [-20, 20, -20],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Mountain Silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[#05070a]" 
           style={{ clipPath: "polygon(0% 100%, 20% 40%, 40% 90%, 60% 30%, 80% 80%, 100% 100%)" }} 
      />
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-[#020305] opacity-80" 
           style={{ clipPath: "polygon(0% 100%, 30% 60%, 50% 90%, 70% 50%, 100% 100%)" }} 
      />
    </motion.div>
  );
}

// ====== DIVINE KRISHNA THEMES ======

function GitaWisdomBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-[#f5af19]"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: 'url("/themes/krishna-gita.png")' }}
      />

      {/* Warm Overlay for blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f5af19]/10 to-[#922c01]/30 mix-blend-overlay" />

      {/* Floating Dust Motes (Ghibli Style) */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Sun Rays Rotating */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] opacity-20 pointer-events-none mix-blend-screen">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-full h-20 bg-gradient-to-r from-transparent via-white to-transparent origin-left -translate-y-1/2"
            style={{ rotate: `${i * 30}deg` }}
            animate={{ rotate: [`${i * 30}deg`, `${i * 30 + 360}deg`] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function YamunaNightBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e]"
    >
      {/* Glowing Full Moon */}
      <div className="absolute top-10 right-1/2 translate-x-1/2 w-32 h-32 bg-[#fff] rounded-full shadow-[0_0_60px_rgba(255,255,255,0.6)] opacity-90" />

      {/* Kadamba Tree Silhouette */}
      <div className="absolute bottom-0 right-0 w-1/3 h-3/4 bg-black/60" 
           style={{ clipPath: "polygon(40% 100%, 50% 80%, 30% 60%, 60% 40%, 40% 20%, 70% 30%, 80% 10%, 90% 40%, 100% 20%, 100% 100%)" }} 
      />

      {/* Flowing Yamuna River */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#000428] to-[#004e92] opacity-80">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-2 bg-white/10"
            style={{ top: `${20 + i * 15}%` }}
            animate={{ x: [-50, 50, -50] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Floating Lotus */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-10"
          style={{ left: `${10 + i * 15}%` }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="40" height="30" viewBox="0 0 40 30">
            <path d="M20,30 Q10,20 0,15 Q10,10 20,0 Q30,10 40,15 Q30,20 20,30" fill="#e91e63" opacity="0.8" />
            <path d="M20,30 Q15,20 10,15 Q15,10 20,5 Q25,10 30,15 Q25,20 20,30" fill="#f48fb1" />
          </svg>
        </motion.div>
      ))}

      {/* Sparkles on Water */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 30}%`,
          }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2 + Math.random(), repeat: Infinity }}
        />
      ))}
    </motion.div>
  );
}

function VishwaroopamBg({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-[#050710]"
    >
      {/* Background Image - Wide image with cover and zoom */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: 'url("/themes/vishwaroopam.png")' }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cosmic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4E54C8]/10 to-[#000000]/60 mix-blend-overlay" />

      {/* Divine Rays (New Particles) */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`ray-${i}`}
          className="absolute top-1/2 left-1/2 w-1 h-[50vh] bg-gradient-to-t from-transparent via-white to-transparent opacity-20 origin-bottom"
          style={{ rotate: `${i * 45}deg` }}
          animate={{ 
            rotate: [`${i * 45}deg`, `${i * 45 + 360}deg`],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Energy Orbs (New Particles) */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: ['#ff00ff', '#00ffff', '#ffff00'][i % 3],
            boxShadow: `0 0 10px ${['#ff00ff', '#00ffff', '#ffff00'][i % 3]}`,
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Floating Cosmic Particles (Existing) */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${Math.random() * 5 + 2}px ${['#ff00ff', '#00ffff', '#ffffff'][i % 3]}`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Nebula Clouds */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`nebula-${i}`}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: '40vw',
            height: '40vh',
            left: `${Math.random() * 60}%`,
            top: `${Math.random() * 60}%`,
            background: ['#4E54C8', '#8F94FB', '#E94560'][i],
          }}
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

// ====== HELPER COMPONENTS ======

function Cloud({ width }: { width: number }) {
  return (
    <svg width={width} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5,19c-0.83,0-1.5-0.67-1.5-1.5c0-0.83,0.67-1.5,1.5-1.5c0.83,0,1.5,0.67,1.5,1.5C19,18.33,18.33,19,17.5,19z M19,16.5 c0-2.48-2.02-4.5-4.5-4.5c-0.72,0-1.39,0.17-2,0.47c-0.59-1.96-2.41-3.47-4.5-3.47c-2.48,0-4.5,2.02-4.5,4.5c0,0.1,0.01,0.2,0.02,0.29 C1.99,14.24,1,15.5,1,17c0,2.21,1.79,4,4,4h12.5c2.48,0,4.5-2.02,4.5-4.5S19.98,12,17.5,12" />
    </svg>
  );
}

function StarSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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
