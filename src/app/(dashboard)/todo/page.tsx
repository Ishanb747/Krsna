"use client";

import { useState, useEffect } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useHabits } from "@/hooks/useHabits";
import { useTimer } from "@/hooks/useTimer";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle, Circle, Plus, Star, Play, Flame } from "lucide-react";
import clsx from "clsx";

export default function TodoPage() {
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { habits, toggleHabit } = useHabits();
  const { setCurrentTask } = useTimer();
  const router = useRouter();
  const [newTodo, setNewTodo] = useState("");
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Sync active habits to today's todos
  useEffect(() => {
    if (loading || !habits.length) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    habits.forEach((habit) => {
      // Check if this habit is already in today's todos using habitId
      const habitTodoExists = todos.some(
        (todo) =>
          todo.habitId === habit.id &&
          todo.createdAt >= todayTimestamp
      );

      if (!habitTodoExists) {
        addTodo(`Habit: ${habit.name}`, "medium", habit.id);
      }
    });
  }, [habits, todos, loading, addTodo]);

  const handleToggleTodo = async (todoId: string, completed: boolean, habitId?: string) => {
    await toggleTodo(todoId, completed);

    if (habitId) {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();
      const isHabitCompletedToday = habit.completedDates.includes(todayTimestamp);

      if (completed && !isHabitCompletedToday) {
        await toggleHabit(habitId);
      } else if (!completed && isHabitCompletedToday) {
        await toggleHabit(habitId);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const selectedDate = new Date(dueDate);
    selectedDate.setHours(0, 0, 0, 0);
    const dueDateTimestamp = selectedDate.getTime();

    await addTodo(newTodo, "medium", undefined, dueDateTimestamp);
    setNewTodo("");
    setDueDate(new Date().toISOString().split('T')[0]);
  };

  const getOverdueStatus = (todo: any) => {
    if (todo.completed || !todo.dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    if (todayTimestamp > todo.dueDate) {
      const diffTime = Math.abs(todayTimestamp - todo.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return { isOverdue: true, text: `Delayed by ${diffDays} day${diffDays > 1 ? 's' : ''}` };
    }
    return null;
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-text)]">Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-[var(--color-danger)]">
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p>{error}</p>
        <p className="mt-4 text-sm opacity-70 text-[var(--color-text)]">
          If you are seeing "ERR_BLOCKED_BY_CLIENT", please disable your ad blocker or check your firewall settings.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{ color: "var(--color-text)" }}>
            My Day
          </h1>
          <p className="text-lg opacity-70" style={{ color: "var(--color-text)" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="cozy-card mb-8 overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[var(--color-card)] p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center">
            <Plus className="mr-3 h-6 w-6 text-[var(--color-primary)]" />
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 bg-transparent text-lg font-medium placeholder-opacity-50 outline-none"
              style={{ color: "var(--color-text)" }}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-2 py-1 font-medium outline-none focus:border-[var(--color-primary)]"
              style={{ color: "var(--color-text)" }}
            />
            
            {newTodo && (
              <button
                type="submit"
                className="text-sm font-bold text-[var(--color-primary)] hover:underline"
              >
                ADD
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {todos.map((todo) => {
          const overdueStatus = getOverdueStatus(todo);
          
          return (
            <div
              key={todo.id}
              className={clsx(
                "cozy-card flex items-center justify-between px-4 py-3 transition-all hover:bg-[var(--color-bg)]",
                todo.completed && "opacity-60"
              )}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggleTodo(todo.id, !todo.completed, todo.habitId)}
                  className={clsx(
                    "transition-colors hover:scale-110",
                    todo.completed ? "text-[var(--color-secondary)]" : "text-[var(--color-text)]"
                  )}
                >
                  {todo.completed ? (
                    <CheckCircle className="h-6 w-6 fill-current" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>
                <div className="flex flex-col">
                  <span
                    className={clsx(
                      "text-lg font-medium transition-all",
                      todo.completed && "line-through"
                    )}
                    style={{ color: "var(--color-text)" }}
                  >
                    {todo.text}
                  </span>
                  {overdueStatus && (
                    <span className="text-xs font-bold text-[var(--color-danger)]">
                      {overdueStatus.text}
                    </span>
                  )}
                  {!overdueStatus && todo.dueDate && (
                    <span className="text-xs opacity-50" style={{ color: "var(--color-text)" }}>
                      Due: {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {todo.habitId && (
                   <Flame className="h-4 w-4 text-[var(--color-danger)]" title="Habit Task" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {todo.priority === "high" && (
                  <Star className="h-5 w-5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                )}
                <button
                  onClick={() => {
                    setCurrentTask(todo.text);
                    router.push("/focus");
                  }}
                  className="rounded-full p-2 text-[var(--color-primary)] hover:bg-[var(--color-bg)] transition-colors"
                  title="Focus on this task"
                >
                  <Play className="h-4 w-4 fill-current" />
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-[var(--color-danger)] opacity-100 transition-opacity hover:scale-110"
                  title="Delete task"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
        {todos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
            <CheckCircle className="mb-4 h-16 w-16 text-[var(--color-secondary)]" />
            <p className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              All caught up!
            </p>
            <p style={{ color: "var(--color-text)" }}>Enjoy your day.</p>
          </div>
        )}
      </div>
    </div>
  );
}
