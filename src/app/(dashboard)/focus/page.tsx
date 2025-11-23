"use client";

import { useTimer } from "@/hooks/useTimer";
import { useTheme } from "@/contexts/ThemeContext";
import { useSound, AlarmSound, TickingSound } from "@/contexts/SoundContext";
import { Play, Pause, RotateCcw, Coffee, Brain, Zap, Settings, Volume2, Music, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useState } from "react";
import MusicPlayer from "@/components/MusicPlayer";

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
  const { 
    alarmSound, setAlarmSound, 
    tickingSound, setTickingSound, 
    volume, setVolume,
    playAlarm 
  } = useSound();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);

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
        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-4 right-4 p-2 opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: "var(--color-text)" }}
        >
          <Settings className="h-5 w-5" />
        </button>

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

      <div className="cozy-card p-6 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsMusicOpen(true)}
            className="rounded-full p-2 text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
            title="Music"
          >
            <Music className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-full p-2 text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--color-text)" }}>Today's Focus</h3>
        <p className="text-3xl font-bold" style={{ color: "var(--color-secondary)" }}>0h 0m</p>
      </div>

      {/* Music Player Sidebar */}
      {/* Music Player Sidebar */}
      <AnimatePresence>
        {isMusicOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMusicOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isMusicOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="fixed right-0 top-0 z-50 h-full w-80 bg-[var(--color-card)] shadow-2xl p-4 overflow-y-auto border-l border-[var(--color-text)]/10"
      >
        <div className="flex justify-end mb-4">
          <button 
              onClick={() => setIsMusicOpen(false)}
              className="p-2 rounded-full hover:bg-[var(--color-text)]/5"
          >
            <X className="h-5 w-5" style={{ color: "var(--color-text)" }} />
          </button>
        </div>
        <MusicPlayer />
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl bg-[var(--color-card)] p-6 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Timer Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} style={{ color: "var(--color-text)" }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Volume */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" style={{ color: "var(--color-text)" }} />
                    <label className="font-medium" style={{ color: "var(--color-text)" }}>Volume</label>
                    <span className="ml-auto text-sm opacity-70" style={{ color: "var(--color-text)" }}>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-text)]/10 accent-[var(--color-primary)]"
                  />
                </div>

                {/* Alarm Sound */}
                <div>
                  <label className="mb-2 block font-medium" style={{ color: "var(--color-text)" }}>Alarm Sound</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["digital", "bell", "wood", "kitchen"] as AlarmSound[]).map((sound) => (
                      <button
                        key={sound}
                        onClick={() => {
                          setAlarmSound(sound);
                          playAlarm(); // Preview
                        }}
                        className={clsx(
                          "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                          alarmSound === sound
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "border-[var(--color-text)]/10 hover:bg-[var(--color-text)]/5"
                        )}
                        style={{ color: alarmSound === sound ? "var(--color-primary)" : "var(--color-text)" }}
                      >
                        {sound.charAt(0).toUpperCase() + sound.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ticking Sound */}
                <div>
                  <label className="mb-2 block font-medium" style={{ color: "var(--color-text)" }}>Ambient Sound</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["none", "fast", "slow", "white-noise", "brown-noise"] as TickingSound[]).map((sound) => (
                      <button
                        key={sound}
                        onClick={() => setTickingSound(sound)}
                        className={clsx(
                          "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                          tickingSound === sound
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "border-[var(--color-text)]/10 hover:bg-[var(--color-text)]/5"
                        )}
                        style={{ color: tickingSound === sound ? "var(--color-primary)" : "var(--color-text)" }}
                      >
                        {sound === "white-noise" ? "White Noise" : 
                         sound === "brown-noise" ? "Brown Noise" :
                         sound.charAt(0).toUpperCase() + sound.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
