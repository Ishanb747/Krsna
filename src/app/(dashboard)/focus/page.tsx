"use client";

import { useTimer } from "@/hooks/useTimer";
import { useTheme } from "@/contexts/ThemeContext";
import { Play, Pause, RotateCcw, Coffee, Brain, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function FocusPage() {
  const {
    timeLeft,
    isActive,
    mode,
    toggleTimer,
    resetTimer,
    setMode,
    formatTime,
    currentTask,
  } = useTimer();
  const { theme } = useTheme();

  return (
    <div className="mx-auto max-w-2xl text-center relative z-10">
      <h1 className="mb-2 text-4xl font-bold" style={{ color: "var(--color-text)" }}>
        Focus Timer
      </h1>
      {currentTask && (
        <p className="mb-8 text-xl font-medium text-[var(--color-primary)]">
          Focusing on: {currentTask}
        </p>
      )}
      {!currentTask && <div className="mb-8" />}

      <div className="cozy-card mb-8 p-8 relative overflow-hidden">
        {/* Timer Controls */}
        <div className="relative z-10">
          <div className="mb-8 flex justify-center gap-4">
            <button
              onClick={() => setMode("focus")}
              className={clsx(
                "cozy-btn flex items-center px-4 py-2",
                mode === "focus"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-card)] text-[var(--color-text)]"
              )}
            >
              <Brain className="mr-2 h-4 w-4" />
              Focus
            </button>
            <button
              onClick={() => setMode("shortBreak")}
              className={clsx(
                "cozy-btn flex items-center px-4 py-2",
                mode === "shortBreak"
                  ? "bg-[var(--color-secondary)] text-white"
                  : "bg-[var(--color-card)] text-[var(--color-text)]"
              )}
            >
              <Coffee className="mr-2 h-4 w-4" />
              Short Break
            </button>
            <button
              onClick={() => setMode("longBreak")}
              className={clsx(
                "cozy-btn flex items-center px-4 py-2",
                mode === "longBreak"
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-card)] text-[var(--color-text)]"
              )}
            >
              <Zap className="mr-2 h-4 w-4" />
              Long Break
            </button>
          </div>

          <div className="mb-8 text-9xl font-bold tracking-widest drop-shadow-sm" style={{ color: "var(--color-text)" }}>
            {formatTime(timeLeft)}
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={toggleTimer}
              className="cozy-btn flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)] hover:scale-105 transition-transform"
            >
              {isActive ? (
                <Pause className="h-8 w-8 fill-current" />
              ) : (
                <Play className="ml-1 h-8 w-8 fill-current" />
              )}
            </button>
            <button
              onClick={resetTimer}
              className="cozy-btn flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-card)] text-[var(--color-text)] hover:bg-[var(--color-danger)] hover:text-white hover:scale-105 transition-transform"
            >
              <RotateCcw className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>

      <div className="cozy-card p-6">
        <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--color-text)" }}>Today's Focus</h3>
        <p className="text-3xl font-bold" style={{ color: "var(--color-secondary)" }}>0h 0m</p>
      </div>
    </div>
  );
}
