"use client";

import { useTimer as useTimerContext } from "@/contexts/TimerContext";

export function useTimer() {
    const context = useTimerContext();
    return {
        ...context,
        setMode: context.setTimerMode, // Alias for backward compatibility
    };
}
