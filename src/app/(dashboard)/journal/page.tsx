"use client";

import { useState, useEffect } from "react";
import { useJournal } from "@/hooks/useJournal";
import { useSound } from "@/contexts/SoundContext";
import { Smile, Meh, Frown, Plus, Trash2, Search, Save, Tag, X } from "lucide-react";
import { JournalEntry } from "@/types/journal";
import clsx from "clsx";

export default function JournalPage() {
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useJournal();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editor State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"]>("neutral");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  const { playSuccess, playDelete } = useSound();

  // Derived State
  const filteredEntries = entries.filter(entry => 
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  // Load entry into editor when selected
  useEffect(() => {
    if (selectedEntry) {
      setTitle(selectedEntry.title || "");
      setContent(selectedEntry.content);
      setMood(selectedEntry.mood || "neutral");
      setTags(selectedEntry.tags || []);
      setIsEditing(true);
    } else {
      resetEditor();
    }
  }, [selectedEntry]);

  const resetEditor = () => {
    setTitle("");
    setContent("");
    setMood("neutral");
    setTags([]);
    setSelectedEntryId(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    if (selectedEntryId) {
      await updateEntry(selectedEntryId, {
        title,
        content,
        mood,
        tags
      });
    } else {
      await addEntry(content, mood, title, tags);
    }
    playSuccess();
    resetEditor();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-text)]">Loading journal...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6 overflow-hidden">
      {/* Left Sidebar - Entry List */}
      <div className="flex w-1/3 flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Journal</h1>
          <button 
            onClick={resetEditor}
            className="rounded-full bg-[var(--color-primary)] p-2 text-white transition-transform hover:scale-110"
            title="New Entry"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" style={{ color: "var(--color-text)" }} />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] py-2 pl-10 pr-4 outline-none focus:border-[var(--color-primary)]"
            style={{ color: "var(--color-text)" }}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntryId(entry.id)}
              className={clsx(
                "cozy-card cursor-pointer p-4 transition-all hover:bg-[var(--color-bg)]",
                selectedEntryId === entry.id && "border-[var(--color-primary)] bg-[var(--color-bg)]"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold opacity-60" style={{ color: "var(--color-text)" }}>
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
                {entry.mood === "happy" && <Smile className="h-4 w-4 text-[var(--color-secondary)]" />}
                {entry.mood === "neutral" && <Meh className="h-4 w-4 text-[var(--color-primary)]" />}
                {entry.mood === "sad" && <Frown className="h-4 w-4 text-[var(--color-accent)]" />}
              </div>
              <h3 className="mb-1 font-bold truncate" style={{ color: "var(--color-text)" }}>
                {entry.title || "Untitled Entry"}
              </h3>
              <p className="line-clamp-2 text-sm opacity-70" style={{ color: "var(--color-text)" }}>
                {entry.content}
              </p>
              {entry.tags && entry.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {entry.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-bold opacity-60">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Main Area - Editor */}
      <div className="flex flex-1 flex-col rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] p-6 shadow-[4px_4px_0px_var(--color-text)]">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between border-b-2 border-[var(--color-text)] pb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry Title..."
            className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:opacity-60"
            style={{ color: "var(--color-text)" }}
          />
          <div className="flex items-center gap-2">
            {(["happy", "neutral", "sad"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={clsx(
                  "rounded-full p-2 transition-all hover:scale-110",
                  mood === m 
                    ? m === "happy" ? "bg-[var(--color-secondary)] text-white" 
                    : m === "neutral" ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                )}
              >
                {m === "happy" && <Smile className="h-5 w-5" />}
                {m === "neutral" && <Meh className="h-5 w-5" />}
                {m === "sad" && <Frown className="h-5 w-5" />}
              </button>
            ))}
            {selectedEntryId && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this entry?")) {
                    playDelete();
                    deleteEntry(selectedEntryId);
                    resetEditor();
                  }
                }}
                className="ml-2 text-[var(--color-danger)] hover:scale-110"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tags Input */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 opacity-50" style={{ color: "var(--color-text)" }} />
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-2 py-1 text-xs font-bold text-white">
              #{tag}
              <button onClick={() => removeTag(tag)} className="hover:text-black"><X className="h-3 w-3" /></button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tags..."
            className="bg-transparent text-sm outline-none placeholder:opacity-70"
            style={{ color: "var(--color-text)" }}
          />
        </div>

        {/* Content Editor */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="flex-1 resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:opacity-60"
          style={{ color: "var(--color-text)" }}
        />

        {/* Footer Actions */}
        <div className="mt-4 flex justify-end border-t-2 border-[var(--color-text)] pt-4">
          <button
            onClick={handleSave}
            className="cozy-btn flex items-center bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[var(--color-secondary)]"
          >
            <Save className="mr-2 h-4 w-4" />
            {selectedEntryId ? "Update Entry" : "Save Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
