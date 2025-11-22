"use client";

import { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { JournalEntry } from "@/types/journal";

export function useJournal() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setEntries([]);
            setLoading(false);
            return;
        }

        console.log("Setting up Journal listener for user:", user.uid);
        const q = query(
            collection(db, "journal"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("Journal Snapshot received. Docs:", snapshot.docs.length);
            const newEntries = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as JournalEntry[];

            // Client-side sort to avoid composite index requirement
            newEntries.sort((a, b) => b.createdAt - a.createdAt);

            setEntries(newEntries);
            setLoading(false);
        }, (error) => {
            console.error("Journal Snapshot Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addEntry = async (content: string, mood?: JournalEntry["mood"]) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "journal"), {
                content,
                mood,
                createdAt: Date.now(),
                userId: user.uid,
            });
        } catch (error) {
            console.error("Error adding journal entry:", error);
            alert("Failed to save journal entry. Please check your connection.");
        }
    };

    const deleteEntry = async (id: string) => {
        try {
            await deleteDoc(doc(db, "journal", id));
        } catch (error) {
            console.error("Error deleting entry:", error);
            alert("Failed to delete entry.");
        }
    };

    return { entries, loading, addEntry, deleteEntry };
}
