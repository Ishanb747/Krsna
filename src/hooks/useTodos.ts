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

    const addTodo = async (text: string, priority: Todo["priority"] = "medium", habitId?: string, dueDate?: number) => {
        if (!user) return;
        try {
            // Get current max order to put new item at the top or bottom
            // For now, let's put new items at the top (order 0) and shift others, 
            // OR put at bottom. Let's put at top for "My Day" feel, or bottom for list feel.
            // Actually, standard is usually bottom for new tasks, but "My Day" often puts new at top.
            // Let's stick to the previous sort: newest first. 
            // To maintain "newest first" visual with explicit order, we can give new items a lower order index if we sort ascending.
            // Let's just assign a timestamp-based order or simply 0 and let reorder handle it.
            // Better: Assign order = current min order - 1 to put at top, or max + 1 to put at bottom.
            // Let's go with: New items go to the TOP.

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

    const deleteTodo = async (id: string) => {
        try {
            await deleteDoc(doc(db, "todos", id));
        } catch (error) {
            console.error("Error deleting todo:", error);
        }
    };

    const reorderTodos = async (newTodos: Todo[]) => {
        // Optimistically update state
        setTodos(newTodos);

        try {
            // Update order in Firestore for affected items
            // To reduce writes, we could only update changed items, but for now we'll update all 
            // or just the ones that need it. 
            // A simple approach: Update all items with their new index as order.

            const updatePromises = newTodos.map((todo, index) => {
                return updateDoc(doc(db, "todos", todo.id), {
                    order: index
                });
            });

            await Promise.all(updatePromises);
        } catch (error) {
            console.error("Error reordering todos:", error);
            // Revert state if needed (requires keeping previous state)
        }
    };

    return { todos, loading, error, addTodo, toggleTodo, deleteTodo, reorderTodos };
}
