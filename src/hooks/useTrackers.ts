"use client";

import { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
    deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Tracker, TrackerLog } from "@/types/tracker";

export function useTrackers() {
    const [trackers, setTrackers] = useState<Tracker[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setTrackers([]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, "trackers"), where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newTrackers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Tracker[];

            // Sort trackers by creation time
            newTrackers.sort((a, b) => b.createdAt - a.createdAt);

            setTrackers(newTrackers);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to trackers:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addTracker = async (
        name: string,
        type: Tracker["type"],
        frequency: Tracker["frequency"] = "daily",
        targetValue?: number,
        unit?: string,
        scheduledTimes?: string[]
    ) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "trackers"), {
                name,
                type,
                targetValue,
                unit,
                frequency,
                scheduledTimes: scheduledTimes || [],
                streak: 0,
                totalCompletions: 0,
                logs: [],
                createdAt: Date.now(),
                userId: user.uid,
            });
        } catch (error) {
            console.error("Error adding tracker:", error);
            alert("Failed to save tracker. Please check your connection.");
        }
    };

    const calculateStreak = (logs: TrackerLog[]): number => {
        if (logs.length === 0) return 0;

        // Sort logs by date descending (most recent first)
        const sortedLogs = [...logs].sort((a, b) => b.date - a.date);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        let streak = 0;
        let currentDate = todayTimestamp;

        for (const log of sortedLogs) {
            if (log.date === currentDate && log.completed) {
                streak++;
                // Move to previous day
                currentDate -= 24 * 60 * 60 * 1000;
            } else if (log.date < currentDate) {
                // Gap found, streak broken
                break;
            }
        }

        return streak;
    };

    const logTracker = async (
        id: string,
        completed: boolean,
        value?: number,
        note?: string
    ) => {
        const tracker = trackers.find((t) => t.id === id);
        if (!tracker) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        // Check if already logged today
        const existingLogIndex = tracker.logs.findIndex((log) => log.date === todayTimestamp);
        let newLogs = [...tracker.logs];

        // Create log object and filter out undefined values
        const newLog: TrackerLog = {
            date: todayTimestamp,
            completed,
            timestamp: Date.now(),
        };

        // Only add optional fields if they have values
        if (value !== undefined) {
            newLog.value = value;
        }
        if (note !== undefined && note.trim() !== "") {
            newLog.note = note;
        }

        if (existingLogIndex >= 0) {
            // Update existing log
            newLogs[existingLogIndex] = newLog;
        } else {
            // Add new log
            newLogs.push(newLog);
        }

        const newStreak = calculateStreak(newLogs);
        const newTotalCompletions = newLogs.filter((log) => log.completed).length;

        try {
            await updateDoc(doc(db, "trackers", id), {
                logs: newLogs,
                streak: newStreak,
                totalCompletions: newTotalCompletions,
            });
        } catch (error) {
            console.error("Error logging tracker:", error);
        }
    };

    const getTodayLog = (tracker: Tracker): TrackerLog | undefined => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        return tracker.logs.find((log) => log.date === todayTimestamp);
    };

    const deleteTracker = async (id: string) => {
        try {
            await deleteDoc(doc(db, "trackers", id));
        } catch (error) {
            console.error("Error deleting tracker:", error);
        }
    };

    return {
        trackers,
        loading,
        addTracker,
        logTracker,
        getTodayLog,
        deleteTracker
    };
}
