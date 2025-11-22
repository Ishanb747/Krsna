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

            // Client-side sort (newest first)
            newTodos.sort((a, b) => b.createdAt - a.createdAt);

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

    const addTodo = async (text: string, priority: Todo["priority"] = "medium", habitId?: string, dueDate?: number) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "todos"), {
                text,
                completed: false,
                createdAt: Date.now(),
                userId: user.uid,
                priority,
                habitId: habitId || null,
                dueDate: dueDate || null,
            });
            // No manual state update needed, onSnapshot will handle it
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

    const deleteTodo = async (id: string) => {
        try {
            await deleteDoc(doc(db, "todos", id));
        } catch (error) {
            console.error("Error deleting todo:", error);
        }
    };

    return { todos, loading, error, addTodo, toggleTodo, deleteTodo };
}
