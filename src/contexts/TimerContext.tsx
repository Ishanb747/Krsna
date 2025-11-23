"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { useSound } from "./SoundContext";

interface TimerContextType {
  timeLeft: number;
  isActive: boolean;
  mode: "focus" | "shortBreak" | "longBreak";
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setTimerMode: (mode: "focus" | "shortBreak" | "longBreak") => void;
  formatTime: (seconds: number) => string;
  currentTask: string | null;
  setCurrentTask: (task: string | null) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { playAlarm, startAmbient, stopAmbient } = useSound();

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      startAmbient();
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      stopAmbient();
      if (timeLeft === 0 && isActive) {
        // Timer just finished
        playAlarm();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    }

    // Special case: if timeLeft hits 0 inside the interval
    if (timeLeft === 0 && isActive) {
        setIsActive(false);
        stopAmbient();
        playAlarm();
        if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAmbient();
    };
  }, [isActive, timeLeft, playAlarm, startAmbient, stopAmbient]);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === "focus") setTimeLeft(25 * 60);
    else if (mode === "shortBreak") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const setTimerMode = (newMode: "focus" | "shortBreak" | "longBreak") => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === "focus") setTimeLeft(25 * 60);
    else if (newMode === "shortBreak") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <TimerContext.Provider
      value={{
        timeLeft,
        isActive,
        mode,
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        setTimerMode,
        formatTime,
        currentTask,
        setCurrentTask,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
