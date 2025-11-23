"use client";

import { useState, useEffect } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useHabits } from "@/hooks/useHabits";
import { useTimer } from "@/hooks/useTimer";
import { useSound } from "@/contexts/SoundContext";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle, Circle, Plus, Star, Play, Flame, GripVertical, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import clsx from "clsx";

export default function TodoPage() {
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo, reorderTodos, updateTodo } = useTodos();
  const { habits, toggleHabit } = useHabits();
  const { setCurrentTask } = useTimer();
  const { playSuccess, playDelete } = useSound();
  const router = useRouter();
  const [newTodo, setNewTodo] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isExpandedInput, setIsExpandedInput] = useState(false);
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);

  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Get unique tags from all todos
  const allTags = Array.from(new Set(todos.flatMap(todo => todo.tags || [])));

  const filteredTodos = filterTag 
    ? todos.filter(todo => todo.tags?.includes(filterTag))
    : todos;

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

    const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t);

    await addTodo(newTodo, "medium", undefined, dueDateTimestamp, tagsArray, newDescription);
    setNewTodo("");
    setNewTags("");
    setNewDescription("");
    setDueDate(new Date().toISOString().split('T')[0]);
    setIsExpandedInput(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderTodos(items);
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
    <div className="mx-auto max-w-6xl">
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
        
        {allTags.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold opacity-70" style={{ color: "var(--color-text)" }}>Filter:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterTag(null)}
                className={clsx(
                  "rounded-full px-3 py-1 text-xs font-bold transition-colors",
                  !filterTag 
                    ? "bg-[var(--color-primary)] text-white" 
                    : "bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-card)]"
                )}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-bold transition-colors",
                    tag === filterTag 
                      ? "bg-[var(--color-primary)] text-white" 
                      : "bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-card)]"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="cozy-card mb-8 overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[var(--color-card)] p-4">
          <div className="flex items-center">
            <Plus className="mr-3 h-6 w-6 text-[var(--color-primary)]" />
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onFocus={() => setIsExpandedInput(true)}
              placeholder="Add a task..."
              className="flex-1 bg-transparent text-lg font-medium placeholder-opacity-50 outline-none"
              style={{ color: "var(--color-text)" }}
            />
          </div>
          
          {isExpandedInput && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-3 pl-9">
               <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-transparent text-sm opacity-80 outline-none"
                style={{ color: "var(--color-text)" }}
              />
              <div className="flex flex-wrap gap-3">
                 <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Tags (comma separated)"
                  className="flex-1 rounded-[var(--border-radius)] border border-[var(--color-text)]/20 bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--color-primary)]"
                  style={{ color: "var(--color-text)" }}
                />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-[var(--border-radius)] border border-[var(--color-text)]/20 bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--color-primary)]"
                  style={{ color: "var(--color-text)" }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpandedInput(false)}
                  className="px-3 py-1 text-sm font-medium opacity-70 hover:opacity-100"
                  style={{ color: "var(--color-text)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[var(--border-radius)] bg-[var(--color-primary)] px-4 py-1 text-sm font-bold text-white hover:bg-[var(--color-secondary)]"
                >
                  Add Task
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="space-y-3"
            >
              {filteredTodos.map((todo, index) => {
                const overdueStatus = getOverdueStatus(todo);
                
                return (
                  <Draggable key={todo.id} draggableId={todo.id} index={index} isDragDisabled={!!filterTag}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={clsx(
                          "cozy-card flex flex-col px-4 py-3 transition-all hover:bg-[var(--color-bg)]",
                          todo.completed && "opacity-60",
                          !!filterTag && "cursor-default"
                        )}
                        style={{
                          ...provided.draggableProps.style,
                          backgroundColor: "var(--color-card)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div {...provided.dragHandleProps} className="cursor-grab opacity-50 hover:opacity-100">
                              <GripVertical className="h-5 w-5" />
                            </div>
                            <button
                              onClick={() => {
                                if (!todo.completed) playSuccess();
                                handleToggleTodo(todo.id, !todo.completed, todo.habitId);
                              }}
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
                            <div className="flex flex-col flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={clsx(
                                    "text-lg font-medium transition-all",
                                    todo.completed && "line-through"
                                  )}
                                  style={{ color: "var(--color-text)" }}
                                >
                                  {todo.text}
                                </span>
                                {todo.tags && todo.tags.map((tag, i) => (
                                  <span key={i} className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-bold text-[var(--color-primary)]">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-3">
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
                                {todo.subtasks && todo.subtasks.length > 0 && (
                                  <span className="text-xs opacity-50" style={{ color: "var(--color-text)" }}>
                                    {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length} subtasks
                                  </span>
                                )}
                              </div>
                            </div>
                            {todo.habitId && (
                              <div title="Habit Task">
                                 <Flame className="h-4 w-4 text-[var(--color-danger)]" />
                              </div>
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
                              onClick={() => setExpandedTodoId(expandedTodoId === todo.id ? null : todo.id)}
                              className="rounded-full p-2 text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
                            >
                              {expandedTodoId === todo.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => {
                                playDelete();
                                deleteTodo(todo.id);
                              }}
                              className="text-[var(--color-danger)] opacity-100 transition-opacity hover:scale-110"
                              title="Delete task"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded View */}
                        {expandedTodoId === todo.id && (
                          <div className="mt-4 border-t border-[var(--color-text)]/10 pt-4 pl-12 animate-in slide-in-from-top-2">
                            {todo.description && (
                              <p className="mb-4 text-sm opacity-70" style={{ color: "var(--color-text)" }}>
                                {todo.description}
                              </p>
                            )}
                            
                            <div className="space-y-2">
                              {todo.subtasks?.map((subtask) => (
                                <div key={subtask.id} className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const newSubtasks = todo.subtasks!.map(st => 
                                        st.id === subtask.id ? { ...st, completed: !st.completed } : st
                                      );
                                      updateTodo(todo.id, { subtasks: newSubtasks });
                                    }}
                                    className={clsx(
                                      "h-4 w-4 rounded border transition-colors",
                                      subtask.completed 
                                        ? "bg-[var(--color-secondary)] border-[var(--color-secondary)]" 
                                        : "border-[var(--color-text)]/50"
                                    )}
                                  >
                                    {subtask.completed && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                                  </button>
                                  <span className={clsx("text-sm", subtask.completed && "line-through opacity-50")} style={{ color: "var(--color-text)" }}>
                                    {subtask.text}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const newSubtasks = todo.subtasks!.filter(st => st.id !== subtask.id);
                                      updateTodo(todo.id, { subtasks: newSubtasks });
                                    }}
                                    className="ml-auto opacity-0 hover:text-[var(--color-danger)] group-hover:opacity-100"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Plus className="h-4 w-4 opacity-50" style={{ color: "var(--color-text)" }} />
                                <input
                                  type="text"
                                  placeholder="Add subtask..."
                                  className="bg-transparent text-sm outline-none placeholder-opacity-50"
                                  style={{ color: "var(--color-text)" }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const target = e.target as HTMLInputElement;
                                      if (!target.value.trim()) return;
                                      const newSubtask = {
                                        id: Date.now().toString(),
                                        text: target.value,
                                        completed: false
                                      };
                                      const currentSubtasks = todo.subtasks || [];
                                      updateTodo(todo.id, { subtasks: [...currentSubtasks, newSubtask] });
                                      target.value = '';
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
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
  );
}
