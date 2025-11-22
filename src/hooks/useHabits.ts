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
import { Habit } from "@/types/habit";

export function useHabits() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setHabits([]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, "habits"), where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newHabits = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Habit[];

            // Optional: Sort habits if needed, e.g., by creation time
            newHabits.sort((a, b) => b.createdAt - a.createdAt);

            setHabits(newHabits);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to habits:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addHabit = async (name: string, variants: Habit["variants"], frequency: Habit["frequency"] = "daily") => {
        if (!user) return;
        try {
            await addDoc(collection(db, "habits"), {
                name,
                frequency,
                variants,
                streak: 0,
                completedDates: [],
                createdAt: Date.now(),
                userId: user.uid,
            });
        } catch (error) {
            console.error("Error adding habit:", error);
            alert("Failed to save habit. Please check your connection.");
        }
    };

    const toggleHabit = async (id: string) => {
        const habit = habits.find((h) => h.id === id);
        if (!habit) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        const isCompletedToday = habit.completedDates.includes(todayTimestamp);
        let newCompletedDates = [...habit.completedDates];
        let newStreak = habit.streak;

        if (isCompletedToday) {
            newCompletedDates = newCompletedDates.filter((d) => d !== todayTimestamp);
            newStreak = Math.max(0, newStreak - 1);
        } else {
            newCompletedDates.push(todayTimestamp);
            newStreak += 1;
        }

        try {
            await updateDoc(doc(db, "habits", id), {
                completedDates: newCompletedDates,
                streak: newStreak,
            });
        } catch (error) {
            console.error("Error toggling habit:", error);
        }
    };

    const deleteHabit = async (id: string) => {
        try {
            await deleteDoc(doc(db, "habits", id));
        } catch (error) {
            console.error("Error deleting habit:", error);
        }
    };

    return { habits, loading, addHabit, toggleHabit, deleteHabit };
}
