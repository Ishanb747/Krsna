"use client";

import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { Plus, Flame, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

export default function HabitsPage() {
  const { habits, loading, addHabit, deleteHabit } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [variants, setVariants] = useState({
    easy: "",
    medium: "",
    hard: "",
  });
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim() || !variants.easy.trim() || !variants.medium.trim() || !variants.hard.trim()) {
      alert("Please fill in all fields");
      return;
    }
    
    await addHabit(newHabitName, variants);
    setNewHabitName("");
    setVariants({ easy: "", medium: "", hard: "" });
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-text)]">Loading habits...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold" style={{ color: "var(--color-text)" }}>Habit Builder</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cozy-btn flex items-center gap-2 bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[var(--color-secondary)]"
        >
          <Plus className="h-5 w-5" />
          Create Habit
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="cozy-card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>New Habit</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text)] hover:text-[var(--color-danger)]">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Habit Name</label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Reading"
                  className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                  style={{ color: "var(--color-text)" }}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold opacity-70" style={{ color: "var(--color-text)" }}>Define Difficulty Variants</p>
                
                <div>
                  <label className="mb-1 block text-xs font-bold text-green-500">EASY</label>
                  <input
                    type="text"
                    value={variants.easy}
                    onChange={(e) => setVariants({ ...variants, easy: e.target.value })}
                    placeholder="e.g., Read 1 page"
                    className="w-full rounded-[var(--border-radius)] border border-green-500/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-green-500"
                    style={{ color: "var(--color-text)" }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-orange-500">MEDIUM</label>
                  <input
                    type="text"
                    value={variants.medium}
                    onChange={(e) => setVariants({ ...variants, medium: e.target.value })}
                    placeholder="e.g., Read 10 pages"
                    className="w-full rounded-[var(--border-radius)] border border-orange-500/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-orange-500"
                    style={{ color: "var(--color-text)" }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-red-500">HARD</label>
                  <input
                    type="text"
                    value={variants.hard}
                    onChange={(e) => setVariants({ ...variants, hard: e.target.value })}
                    placeholder="e.g., Read 1 chapter"
                    className="w-full rounded-[var(--border-radius)] border border-red-500/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-500"
                    style={{ color: "var(--color-text)" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-[var(--border-radius)] bg-[var(--color-primary)] py-3 font-bold text-white hover:bg-[var(--color-secondary)]"
              >
                Create Habit
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayTimestamp = today.getTime();
          const isCompletedToday = habit.completedDates.includes(todayTimestamp);
          const isExpanded = expandedHabitId === habit.id;

          return (
            <div
              key={habit.id}
              className={clsx(
                "cozy-card flex flex-col justify-between p-6 transition-all",
                isCompletedToday && "bg-[var(--color-bg)]"
              )}
            >
              <div 
                className="cursor-pointer"
                onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{habit.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHabit(habit.id);
                    }}
                    className="text-[var(--color-text)] opacity-0 transition-opacity hover:text-[var(--color-danger)] group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-[var(--color-secondary)]">
                  <Flame className="h-5 w-5 fill-current" />
                  <span className="font-bold">{habit.streak} day streak</span>
                </div>

                {/* Variants Display */}
                <div className={clsx(
                  "mt-4 grid gap-2 overflow-hidden transition-all duration-300 ease-in-out",
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}>
                  <div className="min-h-0 space-y-2">
                    {habit.variants && (
                      <>
                         <div className="flex items-center gap-2 rounded bg-green-500/10 p-2 text-xs text-green-600 dark:text-green-400">
                           <span className="font-bold">EASY</span>
                           <span>{habit.variants.easy}</span>
                         </div>
                         <div className="flex items-center gap-2 rounded bg-orange-500/10 p-2 text-xs text-orange-600 dark:text-orange-400">
                           <span className="font-bold">MED</span>
                           <span>{habit.variants.medium}</span>
                         </div>
                         <div className="flex items-center gap-2 rounded bg-red-500/10 p-2 text-xs text-red-600 dark:text-red-400">
                           <span className="font-bold">HARD</span>
                           <span>{habit.variants.hard}</span>
                         </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 flex justify-center">
                   {isExpanded ? <ChevronUp className="h-4 w-4 opacity-50" /> : <ChevronDown className="h-4 w-4 opacity-50" />}
                </div>
              </div>

              <div
                className={clsx(
                  "mt-4 flex w-full items-center justify-center rounded-[var(--border-radius)] py-2 font-bold transition-all",
                  isCompletedToday
                    ? "bg-[var(--color-secondary)] text-white"
                    : "bg-[var(--color-bg)] text-[var(--color-text)] opacity-70"
                )}
              >
                {isCompletedToday ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Done!
                  </>
                ) : (
                  <span className="text-sm">Manage in To-Do List</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
