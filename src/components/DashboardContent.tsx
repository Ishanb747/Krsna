"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTrackers } from "@/hooks/useTrackers";
import { useTodos } from "@/hooks/useTodos";
import { useGoals } from "@/hooks/useGoals";
import { useProjects } from "@/hooks/useProjects";
import { useJournal } from "@/hooks/useJournal";
import { useEffect } from "react";
import { CheckSquare, Clock, Flame, Book, BarChart2, ChevronLeft, Target, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardContent({ onNavigateBack }: { onNavigateBack: () => void }) {
  const { user } = useAuth();
  const { trackers } = useTrackers();
  const { goals } = useGoals();
  const { projects } = useProjects();
  const { todos, addTodo } = useTodos();
  const { entries } = useJournal();

  // Auto-sync Trackers to Todos
  useEffect(() => {
    if (!trackers.length || !user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    trackers.forEach((tracker) => {
      // Check if this tracker is already in today's todos using habitId (keeping field name for compatibility)
      const trackerTodoExists = todos.some(
        (todo) =>
          todo.habitId === tracker.id &&
          todo.createdAt >= todayTimestamp
      );

      if (!trackerTodoExists) {
        addTodo(`Tracker: ${tracker.name}`, "medium", tracker.id);
      }
    });
  }, [trackers, user, todos, addTodo]);

  const isToday = (timestamp: number | undefined) => {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const todaysTodos = todos.filter(t => isToday(t.dueDate));
  const completedTodos = todaysTodos.filter((t) => t.completed).length;
  const activeTodos = todaysTodos.filter((t) => !t.completed).length;
  const totalTrackerStreaks = trackers.reduce((acc, curr) => acc + curr.streak, 0);
  
  const activeGoals = goals.filter(g => g.lifecycle === "active").length;
  const activeProjects = projects.filter(p => p.lifecycle === "active").length;

  return (
    <div className="relative">
      {/* Navigation Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -left-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-2 cursor-pointer group"
        onClick={onNavigateBack}
      >
        <div className="p-2 rounded-full bg-[var(--color-card)] shadow-lg group-hover:scale-110 transition-transform">
          <ChevronLeft className="h-6 w-6" style={{ color: "var(--color-primary)" }} />
        </div>
      </motion.div>

      <h1 className="mb-6 text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text)" }}>
        Welcome back, <span style={{ color: "var(--color-primary)" }}>{user?.email?.split("@")[0] || "User"}</span>!
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Tasks */}
        <div className="cozy-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Today's Tasks</h3>
            <CheckSquare className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
          <p className="text-3xl font-bold">{activeTodos} remaining</p>
          <p className="text-sm opacity-70">{completedTodos} completed today</p>
        </div>
        
        {/* Focus Time */}
        <div className="cozy-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Focus Time</h3>
            <Clock className="h-6 w-6 text-[var(--color-accent)]" />
          </div>
          <p className="text-3xl font-bold">0m focused</p>
        </div>

        {/* Tracker Streak */}
        <div className="cozy-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Tracker Streak</h3>
            <Flame className="h-6 w-6 text-[var(--color-danger)]" />
          </div>
          <p className="text-3xl font-bold">
            {Math.max(...trackers.map((t) => t.streak), 0)} day best
          </p>
           <p className="text-sm opacity-70">{totalTrackerStreaks} total streak days</p>
        </div>

        {/* Active Goals */}
        <div className="cozy-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Active Goals</h3>
            <Target className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
          <p className="text-3xl font-bold">{activeGoals}</p>
          <p className="text-sm opacity-70">Pursuing {goals.length} outcomes</p>
        </div>

        {/* Active Projects */}
        <div className="cozy-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Active Projects</h3>
            <Briefcase className="h-6 w-6 text-[var(--color-accent)]" />
          </div>
          <p className="text-3xl font-bold">{activeProjects}</p>
          <p className="text-sm opacity-70">Executing {projects.length} plans</p>
        </div>

        {/* Journal Entries (Merged from Analytics) */}
        <div className="cozy-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Journal Entries</h3>
            <Book className="h-6 w-6 text-[var(--color-secondary)]" />
          </div>
          <p className="text-3xl font-bold">{entries.length}</p>
          <p className="text-sm opacity-70">Lifetime entries</p>
        </div>

        {/* Total Tasks (Merged from Analytics) */}
        <div className="cozy-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Total Tasks</h3>
            <BarChart2 className="h-6 w-6 text-[var(--color-text)]" />
          </div>
          <p className="text-3xl font-bold">{todos.length}</p>
          <p className="text-sm opacity-70">All time</p>
        </div>
      </div>
    </div>
  );
}
