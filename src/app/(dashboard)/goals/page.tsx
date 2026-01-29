"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import { useTrackers } from "@/hooks/useTrackers";
import { useTodos } from "@/hooks/useTodos";
import { Goal, GoalArchetype, Difficulty, EmotionalWeight, Priority, ProgressSource, GoalLifecycle } from "@/types/goal";
import { Plus, Target, Trash2, Edit2, ChevronDown, ChevronUp, Flag, Zap, Heart, TrendingUp, CheckCircle2, XCircle, Pause, Play } from "lucide-react";
import clsx from "clsx";

export default function GoalsPage() {
  const { goals, loading, addGoal, updateGoal, updateLifecycle, updateProgress, addMilestone, updateMilestone, deleteMilestone, getGoalProgress, calculateGoalHealth, deleteGoal } = useGoals();
  const { trackers } = useTrackers();
  const { todos } = useTodos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedGoalIds, setExpandedGoalIds] = useState<string[]>([]);
  const [filterArchetype, setFilterArchetype] = useState<GoalArchetype | null>(null);
  const [filterLifecycle, setFilterLifecycle] = useState<GoalLifecycle | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [archetype, setArchetype] = useState<GoalArchetype>("outcome");
  const [difficulty, setDifficulty] = useState<Difficulty>("moderate");
  const [emotionalWeight, setEmotionalWeight] = useState<EmotionalWeight>("medium");
  const [priority, setPriority] = useState<Priority>("medium");
  const [progressSource, setProgressSource] = useState<ProgressSource>("manual");
  const [whyMatters, setWhyMatters] = useState("");
  const [ifQuit, setIfQuit] = useState("");
  const [successFeels, setSuccessFeels] = useState("");

  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoalIds(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a goal title");
      return;
    }

    await addGoal({
      title,
      archetype,
      lifecycle: "draft",
      difficulty,
      emotionalWeight,
      priority,
      progressSource,
      reflection: {
        whyMatters: whyMatters || "",
        ifQuit: ifQuit || "",
        successFeels: successFeels || "",
      },
    });

    // Reset form
    setTitle("");
    setArchetype("outcome");
    setDifficulty("moderate");
    setEmotionalWeight("medium");
    setPriority("medium");
    setProgressSource("manual");
    setWhyMatters("");
    setIfQuit("");
    setSuccessFeels("");
    setIsModalOpen(false);
  };

  const calculateComprehensiveProgress = (goal: Goal) => {
    switch (goal.progressSource) {
      case "manual":
      case "milestone":
        return getGoalProgress(goal);
      
      case "task": {
        const linkedTodos = todos.filter(t => t.goalId === goal.id);
        if (linkedTodos.length === 0) return 0;
        const completedCount = linkedTodos.filter(t => t.completed).length;
        return Math.round((completedCount / linkedTodos.length) * 100);
      }
      
      case "habit": {
        // Find linked trackers
        const linkedTrackers = trackers.filter(t => goal.linkedHabitIds.includes(t.id));
        if (linkedTrackers.length === 0) return 0;
        
        let totalExpected = 0;
        let totalCompleted = 0;
        
        // Calculate based on last 30 days of logs for active tracking
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        
        linkedTrackers.forEach(tracker => {
          // Count logs in last 30 days
          const recentLogs = tracker.logs.filter(l => l.date >= thirtyDaysAgo);
          if (recentLogs.length === 0) return;
          
          totalCompleted += recentLogs.filter(l => l.completed).length;
          totalExpected += recentLogs.length; // Use actual logs as expected denominator
        });
        
        return totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
      }
      
      default:
        return 0;
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (filterArchetype && goal.archetype !== filterArchetype) return false;
    if (filterLifecycle && goal.lifecycle !== filterLifecycle) return false;
    return true;
  });

  const archetypeColors = {
    outcome: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    identity: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    skill: "bg-green-500/20 text-green-600 dark:text-green-400",
    maintenance: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
    exploration: "bg-pink-500/20 text-pink-600 dark:text-pink-400",
  };

  const healthColors = {
    on_track: "text-green-600 dark:text-green-400",
    at_risk: "text-yellow-600 dark:text-yellow-400",
    stalled: "text-red-600 dark:text-red-400",
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-text)]">Loading goals...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold" style={{ color: "var(--color-text)" }}>Goals</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cozy-btn flex items-center gap-2 bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[var(--color-secondary)]"
        >
          <Plus className="h-5 w-5" />
          Create Goal
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold opacity-70" style={{ color: "var(--color-text)" }}>Archetype:</span>
          <button onClick={() => setFilterArchetype(null)} className={clsx("rounded-full px-3 py-1 text-xs font-bold", !filterArchetype ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg)] text-[var(--color-text)]")}>All</button>
          {(["outcome", "identity", "skill", "maintenance", "exploration"] as GoalArchetype[]).map(a => (
            <button key={a} onClick={() => setFilterArchetype(a)} className={clsx("rounded-full px-3 py-1 text-xs font-bold capitalize", filterArchetype === a ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg)] text-[var(--color-text)]")}>{a}</button>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="cozy-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>New Goal</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text)] hover:text-[var(--color-danger)]">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Goal Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Reach 75kg" className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]" style={{ color: "var(--color-text)" }} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Archetype</label>
                <select value={archetype} onChange={(e) => setArchetype(e.target.value as GoalArchetype)} className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 outline-none" style={{ color: "var(--color-text)" }}>
                  <option value="outcome">Outcome (measurable end state)</option>
                  <option value="identity">Identity (become a type of person)</option>
                  <option value="skill">Skill (develop competency)</option>
                  <option value="maintenance">Maintenance (sustain a system)</option>
                  <option value="exploration">Exploration (try new things)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none" style={{ color: "var(--color-text)" }}>
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                    <option value="hard">Hard</option>
                    <option value="brutal">Brutal</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Emotional Weight</label>
                  <select value={emotionalWeight} onChange={(e) => setEmotionalWeight(e.target.value as EmotionalWeight)} className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none" style={{ color: "var(--color-text)" }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none" style={{ color: "var(--color-text)" }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Progress Tracking</label>
                <select value={progressSource} onChange={(e) => setProgressSource(e.target.value as ProgressSource)} className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 outline-none" style={{ color: "var(--color-text)" }}>
                  <option value="manual">Manual (set percentage)</option>
                  <option value="milestone">Milestone-based (auto-calculated)</option>
                  <option value="habit">Habit-linked</option>
                  <option value="task">Task-linked</option>
                </select>
              </div>

              <div className="space-y-3 border-t-2 border-[var(--color-text)]/10 pt-4">
                <p className="text-sm font-bold opacity-70" style={{ color: "var(--color-text)" }}>Reflection Questions</p>
                <div>
                  <label className="mb-1 block text-xs font-bold" style={{ color: "var(--color-text)" }}>Why does this matter?</label>
                  <textarea value={whyMatters} onChange={(e) => setWhyMatters(e.target.value)} placeholder="Your deeper motivation..." className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" style={{ color: "var(--color-text)" }} rows={2} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold" style={{ color: "var(--color-text)" }}>What happens if I quit?</label>
                  <textarea value={ifQuit} onChange={(e) => setIfQuit(e.target.value)} placeholder="The cost of giving up..." className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" style={{ color: "var(--color-text)" }} rows={2} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold" style={{ color: "var(--color-text)" }}>What does success feel like?</label>
                  <textarea value={successFeels} onChange={(e) => setSuccessFeels(e.target.value)} placeholder="The emotional reward..." className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" style={{ color: "var(--color-text)" }} rows={2} />
                </div>
              </div>

              <button type="submit" className="mt-6 w-full rounded-[var(--border-radius)] bg-[var(--color-primary)] py-3 font-bold text-white hover:bg-[var(--color-secondary)]">
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGoals.map((goal) => {
          const isExpanded = expandedGoalIds.includes(goal.id);
          const progress = calculateComprehensiveProgress(goal);
          const health = calculateGoalHealth(goal);

          return (
            <div key={goal.id} className="cozy-card group flex flex-col p-6">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{goal.title}</h3>
                <button onClick={() => deleteGoal(goal.id)} className="opacity-0 transition-opacity hover:text-[var(--color-danger)] group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <span className={clsx("rounded-full px-2 py-1 font-bold capitalize", archetypeColors[goal.archetype])}>{goal.archetype}</span>
                <span className="rounded-full bg-[var(--color-text)]/10 px-2 py-1 font-bold capitalize">{goal.lifecycle}</span>
                {goal.lifecycle === "active" && (
                  <span className={clsx("flex items-center gap-1 rounded-full px-2 py-1 font-bold", healthColors[health])}>
                    <TrendingUp className="h-3 w-3" />
                    {health.replace("_", " ")}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-bold">Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--color-bg)]">
                  <div className="h-full rounded-full bg-[var(--color-primary)] transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Stats */}
              <div className="mb-4 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span className="capitalize">{goal.difficulty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span className="capitalize">{goal.emotionalWeight}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flag className="h-3 w-3" />
                  <span className="capitalize">{goal.priority}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {goal.lifecycle === "draft" && (
                  <button onClick={() => updateLifecycle(goal.id, "active")} className="flex-1 rounded-[var(--border-radius)] bg-green-500 py-2 text-xs font-bold text-white hover:bg-green-600">
                    <Play className="inline h-3 w-3 mr-1" />
                    Start
                  </button>
                )}
                {goal.lifecycle === "active" && (
                  <>
                    <button onClick={() => updateLifecycle(goal.id, "paused")} className="flex-1 rounded-[var(--border-radius)] bg-yellow-500 py-2 text-xs font-bold text-white hover:bg-yellow-600">
                      <Pause className="inline h-3 w-3 mr-1" />
                      Pause
                    </button>
                    <button onClick={() => updateLifecycle(goal.id, "completed")} className="flex-1 rounded-[var(--border-radius)] bg-green-500 py-2 text-xs font-bold text-white hover:bg-green-600">
                      <CheckCircle2 className="inline h-3 w-3 mr-1" />
                      Complete
                    </button>
                  </>
                )}
                {goal.lifecycle === "paused" && (
                  <button onClick={() => updateLifecycle(goal.id, "active")} className="flex-1 rounded-[var(--border-radius)] bg-green-500 py-2 text-xs font-bold text-white hover:bg-green-600">
                    <Play className="inline h-3 w-3 mr-1" />
                    Resume
                  </button>
                )}
              </div>

              {/* Expand Toggle */}
              <button onClick={() => toggleGoalExpansion(goal.id)} className="mt-3 flex w-full items-center justify-center gap-1 text-xs opacity-50 hover:opacity-100">
                {isExpanded ? <><ChevronUp className="h-3 w-3" />Hide Details</> : <><ChevronDown className="h-3 w-3" />Show Details</>}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-3 space-y-3 border-t-2 border-[var(--color-text)]/10 pt-3 text-xs">
                  {goal.reflection.whyMatters && (
                    <div>
                      <p className="font-bold mb-1">Why it matters:</p>
                      <p className="italic opacity-70">{goal.reflection.whyMatters}</p>
                    </div>
                  )}
                  {goal.reflection.successFeels && (
                    <div>
                      <p className="font-bold mb-1">Success feels like:</p>
                      <p className="italic opacity-70">{goal.reflection.successFeels}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text)] opacity-50">
          <Target className="mx-auto h-16 w-16 mb-4" />
          <p className="text-lg">No goals yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}
