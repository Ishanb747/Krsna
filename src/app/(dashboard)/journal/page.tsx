"use client";

import { useState } from "react";
import { useJournal } from "@/hooks/useJournal";
import { Smile, Meh, Frown, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";

export default function JournalPage() {
  const { entries, loading, addEntry, deleteEntry } = useJournal();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<"happy" | "neutral" | "sad">("neutral");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await addEntry(content, mood);
    setContent("");
    setMood("neutral");
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-text)]">Loading journal...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-4xl font-bold" style={{ color: "var(--color-text)" }}>Daily Journal</h1>

      <div className="cozy-card mb-12 p-6">
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How was your day?"
            className="mb-4 w-full resize-none rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent p-4 text-lg outline-none focus:border-[var(--color-primary)]"
            rows={4}
            style={{ color: "var(--color-text)" }}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setMood("happy")}
                className={clsx(
                  "rounded-full p-2 transition-transform hover:scale-110",
                  mood === "happy" ? "bg-[var(--color-secondary)] text-white" : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                )}
              >
                <Smile className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={() => setMood("neutral")}
                className={clsx(
                  "rounded-full p-2 transition-transform hover:scale-110",
                  mood === "neutral" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                )}
              >
                <Meh className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={() => setMood("sad")}
                className={clsx(
                  "rounded-full p-2 transition-transform hover:scale-110",
                  mood === "sad" ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                )}
              >
                <Frown className="h-8 w-8" />
              </button>
            </div>
            <button
              type="submit"
              className="cozy-btn flex items-center bg-[var(--color-primary)] px-6 py-3 text-white hover:bg-[var(--color-primary)]"
            >
              <Plus className="mr-2 h-5 w-5" />
              Save Entry
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {entries.map((entry) => (
          <div key={entry.id} className="cozy-card relative p-6 transition-transform hover:-translate-y-1">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold opacity-60" style={{ color: "var(--color-text)" }}>
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>
              {entry.mood === "happy" && <Smile className="h-6 w-6 text-[var(--color-secondary)]" />}
              {entry.mood === "neutral" && <Meh className="h-6 w-6 text-[var(--color-primary)]" />}
              {entry.mood === "sad" && <Frown className="h-6 w-6 text-[var(--color-accent)]" />}
            </div>
            <p className="whitespace-pre-wrap text-lg" style={{ color: "var(--color-text)" }}>{entry.content}</p>
            <button
              onClick={() => deleteEntry(entry.id)}
              className="absolute bottom-4 right-4 opacity-0 transition-opacity hover:text-[var(--color-danger)] group-hover:opacity-100"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
