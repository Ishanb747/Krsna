"use client";

import { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Todo } from "@/types/todo";

export function useTodos() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setTodos([]);
            setLoading(false);
            return;
        }

        // Query without orderBy to avoid index requirements
        const q = query(
            collection(db, "todos"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newTodos = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Todo[];

            // Client-side sort (by order)
            newTodos.sort((a, b) => (a.order || 0) - (b.order || 0));

            setTodos(newTodos);
            setLoading(false);
            setError(null);
        }, (error) => {
            console.error("Error listening to todos:", error);
            setError(error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addTodo = async (
        text: string,
        priority: Todo["priority"] = "medium",
        habitId?: string,
        dueDate?: number,
        tags: string[] = [],
        description: string = "",
        goalId?: string,
        projectId?: string
    ) => {
        if (!user) return;
        try {
            const currentMinOrder = todos.length > 0 ? Math.min(...todos.map(t => t.order || 0)) : 0;
            const newOrder = currentMinOrder - 1;

            await addDoc(collection(db, "todos"), {
                text,
                completed: false,
                createdAt: Date.now(),
                userId: user.uid,
                priority,
                habitId: habitId || null,
                dueDate: dueDate || null,
                order: newOrder,
                tags,
                description,
                goalId: goalId || null,
                projectId: projectId || null,
                subtasks: [],
            });
        } catch (error) {
            console.error("Error adding todo:", error);
            alert("Failed to save task. Please check your connection.");
        }
    };

    const toggleTodo = async (id: string, completed: boolean) => {
        try {
            await updateDoc(doc(db, "todos", id), { completed });
        } catch (error) {
            console.error("Error toggling todo:", error);
        }
    };

    const updateTodo = async (id: string, updates: Partial<Todo>) => {
        try {
            await updateDoc(doc(db, "todos", id), updates);
        } catch (error) {
            console.error("Error updating todo:", error);
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            await deleteDoc(doc(db, "todos", id));
        } catch (error) {
            console.error("Error deleting todo:", error);
        }
    };

    const reorderTodos = async (newTodos: Todo[]) => {
        setTodos(newTodos);
        try {
            const updatePromises = newTodos.map((todo, index) => {
                return updateDoc(doc(db, "todos", todo.id), {
                    order: index
                });
            });
            await Promise.all(updatePromises);
        } catch (error) {
            console.error("Error reordering todos:", error);
        }
    };

    return { todos, loading, error, addTodo, toggleTodo, deleteTodo, reorderTodos, updateTodo };
}
