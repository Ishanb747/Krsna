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
import { Project, ProjectLifecycle, StructuredNotes, Retrospective } from "@/types/project";

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setProjects([]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, "projects"), where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newProjects = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Project[];

            // Sort by last touched (most recent first)
            newProjects.sort((a, b) => b.lastTouchedAt - a.createdAt);

            setProjects(newProjects);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to projects:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addProject = async (projectData: Omit<Project, "id" | "userId" | "createdAt" | "lastTouchedAt" | "linkedGoalIds" | "taskIds" | "notes">) => {
        if (!user) return;
        try {
            const now = Date.now();
            await addDoc(collection(db, "projects"), {
                ...projectData,
                notes: {
                    context: "",
                    decisions: "",
                    openQuestions: "",
                    ideas: "",
                },
                linkedGoalIds: projectData.primaryGoalId ? [projectData.primaryGoalId] : [],
                taskIds: [],
                createdAt: now,
                lastTouchedAt: now,
                userId: user.uid,
            });
        } catch (error) {
            console.error("Error adding project:", error);
            alert("Failed to save project. Please check your connection.");
        }
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        try {
            const updateData: any = { ...updates };

            // Filter out undefined values
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            await updateDoc(doc(db, "projects", id), updateData);
        } catch (error) {
            console.error("Error updating project:", error);
        }
    };

    const touchProject = async (id: string) => {
        await updateDoc(doc(db, "projects", id), {
            lastTouchedAt: Date.now()
        });
    };

    const updateLifecycle = async (id: string, lifecycle: ProjectLifecycle, reason?: string) => {
        const updates: any = { lifecycle, lastTouchedAt: Date.now() };

        if (lifecycle === "blocked" && reason) {
            updates.blockedReason = reason;
        } else if (lifecycle === "paused" && reason) {
            updates.pausedReason = reason;
        } else if (lifecycle === "completed") {
            updates.completedAt = Date.now();
        }

        await updateProject(id, updates);
    };

    const updateNotes = async (id: string, notes: Partial<StructuredNotes>) => {
        const project = projects.find(p => p.id === id);
        if (!project) return;

        const updatedNotes = { ...project.notes, ...notes };
        await updateProject(id, { notes: updatedNotes });
        await touchProject(id);
    };

    const addRetrospective = async (id: string, retro: Omit<Retrospective, "completedAt">) => {
        const retrospective: Retrospective = {
            ...retro,
            completedAt: Date.now(),
        };

        await updateProject(id, { retrospective });
    };

    const linkGoal = async (projectId: string, goalId: string, isPrimary: boolean = false) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updates: any = {};

        if (isPrimary) {
            updates.primaryGoalId = goalId;
            if (!project.linkedGoalIds.includes(goalId)) {
                updates.linkedGoalIds = [...project.linkedGoalIds, goalId];
            }
        } else if (!project.linkedGoalIds.includes(goalId)) {
            updates.linkedGoalIds = [...project.linkedGoalIds, goalId];
        }

        if (Object.keys(updates).length > 0) {
            await updateProject(projectId, updates);
        }
    };

    const unlinkGoal = async (projectId: string, goalId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updates: any = {
            linkedGoalIds: project.linkedGoalIds.filter(id => id !== goalId)
        };

        if (project.primaryGoalId === goalId) {
            updates.primaryGoalId = null;
        }

        await updateProject(projectId, updates);
    };

    const linkTask = async (projectId: string, taskId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project || project.taskIds.includes(taskId)) return;

        await updateProject(projectId, {
            taskIds: [...project.taskIds, taskId]
        });
        await touchProject(projectId);
    };

    const unlinkTask = async (projectId: string, taskId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        await updateProject(projectId, {
            taskIds: project.taskIds.filter(id => id !== taskId)
        });
    };

    const getDaysSinceTouch = (project: Project): number => {
        const now = Date.now();
        return Math.floor((now - project.lastTouchedAt) / (1000 * 60 * 60 * 24));
    };

    const deleteProject = async (id: string) => {
        try {
            await deleteDoc(doc(db, "projects", id));
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    return {
        projects,
        loading,
        addProject,
        updateProject,
        touchProject,
        updateLifecycle,
        updateNotes,
        addRetrospective,
        linkGoal,
        unlinkGoal,
        linkTask,
        unlinkTask,
        getDaysSinceTouch,
        deleteProject,
    };
}
