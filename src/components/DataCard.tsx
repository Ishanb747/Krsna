"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Book, Calendar, Tag, ChevronDown, ChevronUp, GripVertical, Flame, Target, Briefcase, Activity, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Todo } from "@/types/todo";
import { useAuth } from "@/contexts/AuthContext";

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: string;
  createdAt: number;
  tags?: string[];
}

interface Tracker {
  id: string;
  name: string;
  streak: number;
  frequency: string;
  totalCompletions: number;
}

interface Project {
  id: string;
  title: string;
  lifecycle: string;
  energyRequired: 'low' | 'medium' | 'high';
  lastTouchedAt: number;
}

interface Goal {
  id: string;
  title: string;
  lifecycle: string;
  priority: 'low' | 'medium' | 'high';
  manualProgress?: number;
}

interface DataCardProps {
  type: 'todos' | 'journal' | 'trackers' | 'projects' | 'goals';
  data: any[];
}

export function DataCard({ type, data }: DataCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localData, setLocalData] = useState<any[]>(data);
  const { user } = useAuth();

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleToggleTodo = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic Update
    setLocalData(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !currentStatus } : item
    ));

    try {
      await fetch(`/api/data/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.uid || ''
        },
        body: JSON.stringify({ completed: !currentStatus })
      });
    } catch (err) {
      console.error('Failed to toggle todo', err);
      // Revert if failed
      setLocalData(prev => prev.map(item => 
        item.id === id ? { ...item, completed: currentStatus } : item
      ));
    }
  };

  const handleDeleteTodo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic Update
    setLocalData(prev => prev.filter(item => item.id !== id));

    try {
      await fetch(`/api/data/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.uid || ''
        }
      });
    } catch (err) {
      console.error('Failed to delete todo', err);
    }
  };

  const handleDeleteJournal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic Update
    setLocalData(prev => prev.filter(item => item.id !== id));

    try {
      await fetch(`/api/data/journal/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.uid || ''
        }
      });
    } catch (err) {
      console.error('Failed to delete journal entry', err);
    }
  };

  if (type === 'trackers') {
    const trackers = localData as Tracker[];
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-4 rounded-2xl bg-[var(--color-card)] p-4 shadow-lg ring-1 ring-[var(--color-text)]/5"
      >
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-500" />
          <h3 className="font-bold text-[var(--color-text)]">Your Habits ({trackers.length})</h3>
        </div>
        
        {trackers.length === 0 ? (
          <p className="text-sm text-[var(--color-text)] opacity-60">No active habits found</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trackers.map((tracker) => (
              <div key={tracker.id} className="relative flex items-center justify-between overflow-hidden rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)]/50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                    <Flame className={`h-5 w-5 ${tracker.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-text)]">{tracker.name}</h4>
                    <p className="text-xs text-[var(--color-text)] opacity-60">
                      {tracker.frequency} • {tracker.totalCompletions} completions
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-[var(--color-card)] px-3 py-1 shadow-sm">
                  <span className="font-black text-lg text-[var(--color-text)]">{tracker.streak}</span>
                  <span className="text-[10px] font-bold uppercase text-[var(--color-text)] opacity-40">Streak</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  if (type === 'projects') {
    const projects = localData as Project[];
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-4 rounded-2xl bg-[var(--color-card)] p-4 shadow-lg ring-1 ring-[var(--color-text)]/5"
      >
        <div className="mb-3 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-500" />
          <h3 className="font-bold text-[var(--color-text)]">Active Projects ({projects.length})</h3>
        </div>
        
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)]/50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base text-[var(--color-text)]">{project.title}</h4>
                  <div className="mt-1 flex gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                      {project.lifecycle}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      project.energyRequired === 'high' ? 'bg-red-500/10 text-red-600' :
                      project.energyRequired === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                      'bg-green-500/10 text-green-600'
                    }`}>
                      ⚡ {project.energyRequired} energy
                    </span>
                  </div>
                </div>
                {project.lastTouchedAt && (
                   <span className="text-xs text-[var(--color-text)] opacity-40">
                     {new Date(project.lastTouchedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (type === 'goals') {
    const goals = localData as Goal[];
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-4 rounded-2xl bg-[var(--color-card)] p-4 shadow-lg ring-1 ring-[var(--color-text)]/5"
      >
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-red-500" />
          <h3 className="font-bold text-[var(--color-text)]">Top Goals ({goals.length})</h3>
        </div>
        
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="relative overflow-hidden rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)]/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-[var(--color-text)]">{goal.title}</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  goal.priority === 'high' ? 'bg-red-500/10 text-red-600' :
                  'bg-gray-500/10 text-gray-600'
                }`}>
                  {goal.priority.toUpperCase()}
                </span>
              </div>
              
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-text)]/5">
                <div 
                  className="absolute h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${goal.manualProgress || 0}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-[var(--color-text)] opacity-60">
                <span>{goal.lifecycle}</span>
                <span>{goal.manualProgress || 0}% completed</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (type === 'todos') {
    const todos = localData as Todo[];
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-4 rounded-2xl bg-[var(--color-card)] p-4 shadow-lg ring-1 ring-[var(--color-text)]/5"
      >
        <div className="mb-3 flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-[var(--color-primary)]" />
          <h3 className="font-bold text-[var(--color-text)]">Your Todos ({todos.length})</h3>
        </div>
        
        {todos.length === 0 ? (
          <p className="text-sm text-[var(--color-text)] opacity-60">No todos found</p>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <motion.div
                layout
                key={todo.id}
                onClick={() => toggleExpand(todo.id)}
                className={`
                  relative cursor-pointer overflow-hidden rounded-xl border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  ${todo.completed ? 'opacity-70 grayscale' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-5 w-5 rounded border-2 border-black flex-shrink-0 flex items-center justify-center ${
                    todo.completed 
                      ? 'bg-black text-white' 
                      : 'bg-white'
                  }`}>
                    {todo.completed && <CheckSquare size={14} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-base font-black text-black ${
                        todo.completed ? 'line-through' : ''
                      }`}>
                        {todo.text}
                      </p>
                      {expandedId === todo.id ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                       {todo.priority && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border border-black ${
                          todo.priority === 'high' 
                            ? 'bg-red-400 text-black' 
                            : todo.priority === 'medium'
                            ? 'bg-yellow-400 text-black'
                            : 'bg-blue-400 text-black'
                        }`}>
                          {todo.priority.toUpperCase()}
                        </span>
                      )}
                      {todo.dueDate && (
                        <span className="text-xs font-bold text-black opacity-70 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === todo.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 border-t-2 border-black/10 pt-2"
                    >
                      {todo.description && (
                        <div className="mb-2">
                          <p className="text-xs font-bold text-black uppercase tracking-wider mb-1">Description</p>
                          <p className="text-sm font-medium text-black/80">{todo.description}</p>
                        </div>
                      )}
                      
                      {todo.tags && todo.tags.length > 0 && (
                         <div className="flex gap-1 flex-wrap mb-2">
                          {todo.tags.map((tag, i) => (
                            <span key={i} className="text-xs font-bold px-2 py-0.5 rounded-full border border-black bg-purple-300 text-black">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {todo.subtasks && todo.subtasks.length > 0 && (
                        <div>
                           <p className="text-xs font-bold text-black uppercase tracking-wider mb-1">Subtasks</p>
                           <ul className="space-y-1">
                             {todo.subtasks.map(st => (
                               <li key={st.id} className="flex items-center gap-2 text-sm font-medium text-black/80">
                                 <div className={`h-3 w-3 rounded-full border border-black ${st.completed ? 'bg-black' : 'bg-transparent'}`} />
                                 <span className={st.completed ? 'line-through opacity-50' : ''}>{st.text}</span>
                               </li>
                             ))}
                           </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  if (type === 'journal') {
    const entries = localData as JournalEntry[];
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-4 rounded-2xl bg-[var(--color-card)] p-4 shadow-lg ring-1 ring-[var(--color-text)]/5"
      >
        <div className="mb-3 flex items-center gap-2">
          <Book className="h-5 w-5 text-[var(--color-secondary)]" />
          <h3 className="font-bold text-[var(--color-text)]">Journal Entries ({entries.length})</h3>
        </div>
        
        {entries.length === 0 ? (
          <p className="text-sm text-[var(--color-text)] opacity-60">No journal entries found</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="group relative rounded-xl bg-[var(--color-background)]/50 p-3 transition-colors hover:bg-[var(--color-background)]"
              >
                <button
                  onClick={(e) => handleDeleteJournal(entry.id, e)}
                  className="absolute right-2 top-2 rounded-lg bg-red-500/10 p-1.5 text-red-500 opacity-0 transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100"
                  title="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {entry.title && (
                  <h4 className="font-semibold text-[var(--color-text)] mb-1 pr-8">{entry.title}</h4>
                )}
                <p className="text-sm text-[var(--color-text)] opacity-80 line-clamp-3 pr-8">
                  {entry.content}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[var(--color-text)] opacity-50">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                  {entry.mood && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      {entry.mood}
                    </span>
                  )}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex gap-1">
                      {entry.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return null;
}
