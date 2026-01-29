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
import { Goal, Milestone, GoalHealth, GoalLifecycle, ProgressSource } from "@/types/goal";

export function useGoals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setGoals([]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, "goals"), where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newGoals = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Goal[];

            // Sort by creation time
            newGoals.sort((a, b) => b.createdAt - a.createdAt);

            setGoals(newGoals);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to goals:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addGoal = async (goalData: Omit<Goal, "id" | "userId" | "createdAt" | "milestones" | "linkedHabitIds" | "linkedTaskIds" | "supportingGoalIds" | "conflictingGoalIds">) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "goals"), {
                ...goalData,
                milestones: [],
                linkedHabitIds: [],
                linkedTaskIds: [],
                supportingGoalIds: [],
                conflictingGoalIds: [],
                createdAt: Date.now(),
                lastActivityAt: Date.now(),
                userId: user.uid,
            });
        } catch (error) {
            console.error("Error adding goal:", error);
            alert("Failed to save goal. Please check your connection.");
        }
    };

    const updateGoal = async (id: string, updates: Partial<Goal>) => {
        try {
            const updateData: any = { ...updates };

            // Filter out undefined values
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            // Update last activity
            updateData.lastActivityAt = Date.now();

            await updateDoc(doc(db, "goals", id), updateData);
        } catch (error) {
            console.error("Error updating goal:", error);
        }
    };

    const updateLifecycle = async (id: string, lifecycle: GoalLifecycle, reason?: string) => {
        const updates: any = { lifecycle, lastActivityAt: Date.now() };

        if (lifecycle === "active" && !goals.find(g => g.id === id)?.startedAt) {
            updates.startedAt = Date.now();
        } else if (lifecycle === "paused") {
            updates.pausedAt = Date.now();
        } else if (lifecycle === "completed") {
            updates.completedAt = Date.now();
        } else if (lifecycle === "abandoned" && reason) {
            updates.abandonedReason = reason;
        }

        await updateGoal(id, updates);
    };

    const updateProgress = async (id: string, progress: number) => {
        await updateGoal(id, { manualProgress: Math.min(100, Math.max(0, progress)) });
    };

    const addMilestone = async (goalId: string, milestone: Omit<Milestone, "id">) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const newMilestone: Milestone = {
            ...milestone,
            id: Date.now().toString(),
        };

        const newMilestones = [...goal.milestones, newMilestone];
        await updateGoal(goalId, { milestones: newMilestones });
    };

    const updateMilestone = async (goalId: string, milestoneId: string, updates: Partial<Milestone>) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const newMilestones = goal.milestones.map(m => {
            if (m.id === milestoneId) {
                const updated = { ...m, ...updates };
                if (updates.status === "done" && !m.completedAt) {
                    updated.completedAt = Date.now();
                }
                return updated;
            }
            return m;
        });

        await updateGoal(goalId, { milestones: newMilestones });
    };

    const deleteMilestone = async (goalId: string, milestoneId: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const newMilestones = goal.milestones.filter(m => m.id !== milestoneId);
        await updateGoal(goalId, { milestones: newMilestones });
    };

    const calculateMilestoneProgress = (goal: Goal): number => {
        if (goal.milestones.length === 0) return 0;

        const weightMap = { light: 1, medium: 2, heavy: 3 };
        let totalWeight = 0;
        let completedWeight = 0;

        goal.milestones.forEach(m => {
            const weight = weightMap[m.weight];
            totalWeight += weight;
            if (m.status === "done") {
                completedWeight += weight;
            }
        });

        return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    };

    const getGoalProgress = (goal: Goal): number => {
        switch (goal.progressSource) {
            case "manual":
                return goal.manualProgress || 0;
            case "milestone":
                return calculateMilestoneProgress(goal);
            case "habit":
                // TODO: Calculate from linked habits
                return 0;
            case "task":
                // TODO: Calculate from linked tasks
                return 0;
            default:
                return 0;
        }
    };

    const calculateGoalHealth = (goal: Goal): GoalHealth => {
        if (goal.lifecycle !== "active") {
            return "on_track"; // Non-active goals don't have health
        }

        const now = Date.now();
        const daysSinceActivity = goal.lastActivityAt
            ? Math.floor((now - goal.lastActivityAt) / (1000 * 60 * 60 * 24))
            : 999;

        // Stalled if no activity in 14+ days
        if (daysSinceActivity >= 14) {
            return "stalled";
        }

        // Calculate expected progress based on time
        const startTime = goal.startedAt || goal.createdAt;
        const daysSinceStart = Math.floor((now - startTime) / (1000 * 60 * 60 * 24));
        const progress = getGoalProgress(goal);

        // Assume 90 days for a goal, expected progress = (days / 90) * 100
        const expectedProgress = Math.min(100, (daysSinceStart / 90) * 100);

        // At risk if progress is less than 50% of expected
        if (progress < expectedProgress * 0.5) {
            return "at_risk";
        }

        return "on_track";
    };

    const linkHabit = async (goalId: string, habitId: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal || goal.linkedHabitIds.includes(habitId)) return;

        await updateGoal(goalId, {
            linkedHabitIds: [...goal.linkedHabitIds, habitId]
        });
    };

    const unlinkHabit = async (goalId: string, habitId: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        await updateGoal(goalId, {
            linkedHabitIds: goal.linkedHabitIds.filter(id => id !== habitId)
        });
    };

    const linkTask = async (goalId: string, taskId: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal || goal.linkedTaskIds.includes(taskId)) return;

        await updateGoal(goalId, {
            linkedTaskIds: [...goal.linkedTaskIds, taskId]
        });
    };

    const unlinkTask = async (goalId: string, taskId: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        await updateGoal(goalId, {
            linkedTaskIds: goal.linkedTaskIds.filter(id => id !== taskId)
        });
    };

    const deleteGoal = async (id: string) => {
        try {
            await deleteDoc(doc(db, "goals", id));
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    return {
        goals,
        loading,
        addGoal,
        updateGoal,
        updateLifecycle,
        updateProgress,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        getGoalProgress,
        calculateGoalHealth,
        linkHabit,
        unlinkHabit,
        linkTask,
        unlinkTask,
        deleteGoal,
    };
}
