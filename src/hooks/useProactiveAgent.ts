import { useState, useEffect, useRef } from 'react';
import { useAgentStore } from './useAgentStore';
import { useAuth } from '@/contexts/AuthContext';
import { useTimer } from '@/hooks/useTimer';

export function useProactiveAgent() {
    const { user } = useAuth();
    const { setMessages, isOpen, toggle, open } = useAgentStore();
    const { isActive, currentTask, mode } = useTimer(); // Monitor timer state

    // Track last check-in time
    const lastCheckRef = useRef<number>(Date.now());

    useEffect(() => {
        if (!user) return;

        const checkProactive = async () => {
            const now = Date.now();
            const isTimerRunning = isActive;

            try {
                const response = await fetch('/api/agent/proactive', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': user.uid
                    },
                    body: JSON.stringify({
                        currentState: {
                            currentPage: window.location.pathname,
                            timestamp: now,
                            timer: {
                                isActive: isTimerRunning,
                                taskName: currentTask,
                                mode: mode
                            }
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.nudge) {
                        setMessages(prev => [...prev, {
                            id: data.nudge.id,
                            role: 'assistant',
                            content: data.nudge.content,
                            type: data.nudge.type
                        }]);

                        // Force open if strict or high priority
                        if (!isOpen) {
                            open ? open() : toggle();
                        }
                    }
                }
            } catch (e) {
                console.error("Proactive check failed", e);
            } finally {
                lastCheckRef.current = now;
            }
        };

        // Poll every 15 seconds for more responsive "Strict Mode" verification.
        const interval = setInterval(checkProactive, 15 * 1000);
        return () => clearInterval(interval);

    }, [user, setMessages, isOpen, toggle, open, isActive, currentTask, mode]);
}
