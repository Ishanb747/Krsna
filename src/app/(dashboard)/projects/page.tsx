"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useGoals } from "@/hooks/useGoals";
import { Project, ProjectType, ProjectLifecycle, EnergyLevel, FrictionLevel } from "@/types/project";
import { Plus, Briefcase, Trash2, AlertTriangle, ChevronDown, ChevronUp, Play, Pause, CheckCircle2, Archive } from "lucide-react";
import clsx from "clsx";

export default function ProjectsPage() {
  const { projects, loading, addProject, updateLifecycle, updateNotes, getDaysSinceTouch, deleteProject } = useProjects();
  const { goals } = useGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProjectType>("personal_system");
  const [energyRequired, setEnergyRequired] = useState<EnergyLevel>("medium");
  const [frictionLevel, setFrictionLevel] = useState<FrictionLevel>("low");
  const [primaryGoalId, setPrimaryGoalId] = useState("");

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjectIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a project title");
      return;
    }

    await addProject({
      title,
      type,
      lifecycle: "planned",
      energyRequired,
      frictionLevel,
      primaryGoalId: primaryGoalId || undefined,
    });

    // Reset form
    setTitle("");
    setType("personal_system");
    setEnergyRequired("medium");
    setFrictionLevel("low");
    setPrimaryGoalId("");
    setIsModalOpen(false);
  };

  const typeColors = {
    learning: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    work: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    personal_system: "bg-green-500/20 text-green-600 dark:text-green-400",
    experiment: "bg-pink-500/20 text-pink-600 dark:text-pink-400",
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-text)]">Loading projects...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold" style={{ color: "var(--color-text)" }}>Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cozy-btn flex items-center gap-2 bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[var(--color-secondary)]"
        >
          <Plus className="h-5 w-5" />
          Create Project
        </button>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="cozy-card w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text)] hover:text-[var(--color-danger)]">
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Project Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Learn Piano" className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]" style={{ color: "var(--color-text)" }} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as ProjectType)} className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 outline-none" style={{ color: "var(--color-text)" }}>
                  <option value="learning">Learning</option>
                  <option value="work">Work</option>
                  <option value="personal_system">Personal System</option>
                  <option value="experiment">Experiment / Side Quest</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Energy Required</label>
                  <select value={energyRequired} onChange={(e) => setEnergyRequired(e.target.value as EnergyLevel)} className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none" style={{ color: "var(--color-text)" }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Friction Level</label>
                  <select value={frictionLevel} onChange={(e) => setFrictionLevel(e.target.value as FrictionLevel)} className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none" style={{ color: "var(--color-text)" }}>
                    <option value="low">Low</option>
                    <option value="annoying">Annoying</option>
                    <option value="dread">Dread</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Primary Goal (Optional)</label>
                <select value={primaryGoalId} onChange={(e) => setPrimaryGoalId(e.target.value)} className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 outline-none" style={{ color: "var(--color-text)" }}>
                  <option value="">None</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="mt-6 w-full rounded-[var(--border-radius)] bg-[var(--color-primary)] py-3 font-bold text-white hover:bg-[var(--color-secondary)]">
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const isExpanded = expandedProjectIds.includes(project.id);
          const daysSinceTouch = getDaysSinceTouch(project);
          const isStale = daysSinceTouch > 7;
          const primaryGoal = goals.find(g => g.id === project.primaryGoalId);

          return (
            <div key={project.id} className="cozy-card group flex flex-col p-6">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{project.title}</h3>
                <button onClick={() => deleteProject(project.id)} className="opacity-0 transition-opacity hover:text-[var(--color-danger)] group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <span className={clsx("rounded-full px-2 py-1 font-bold capitalize", typeColors[project.type])}>{project.type.replace("_", " ")}</span>
                <span className="rounded-full bg-[var(--color-text)]/10 px-2 py-1 font-bold capitalize">{project.lifecycle}</span>
                {isStale && project.lifecycle === "active" && (
                  <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 font-bold text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    {daysSinceTouch}d stale
                  </span>
                )}
              </div>

              {/* Primary Goal */}
              {primaryGoal && (
                <div className="mb-3 text-xs">
                  <span className="opacity-70">Goal: </span>
                  <span className="font-bold">{primaryGoal.title}</span>
                </div>
              )}

              {/* Stats */}
              <div className="mb-4 flex items-center gap-3 text-xs">
                <div>
                  <span className="opacity-70">Energy: </span>
                  <span className="font-bold capitalize">{project.energyRequired}</span>
                </div>
                <div>
                  <span className="opacity-70">Friction: </span>
                  <span className="font-bold capitalize">{project.frictionLevel}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {project.lifecycle === "planned" && (
                  <button onClick={() => updateLifecycle(project.id, "active")} className="flex-1 rounded-[var(--border-radius)] bg-green-500 py-2 text-xs font-bold text-white hover:bg-green-600">
                    <Play className="inline h-3 w-3 mr-1" />
                    Start
                  </button>
                )}
                {project.lifecycle === "active" && (
                  <>
                    <button onClick={() => updateLifecycle(project.id, "paused")} className="flex-1 rounded-[var(--border-radius)] bg-yellow-500 py-2 text-xs font-bold text-white hover:bg-yellow-600">
                      <Pause className="inline h-3 w-3 mr-1" />
                      Pause
                    </button>
                    <button onClick={() => updateLifecycle(project.id, "completed")} className="flex-1 rounded-[var(--border-radius)] bg-green-500 py-2 text-xs font-bold text-white hover:bg-green-600">
                      <CheckCircle2 className="inline h-3 w-3 mr-1" />
                      Complete
                    </button>
                  </>
                )}
                {project.lifecycle === "paused" && (
                  <button onClick={() => updateLifecycle(project.id, "active")} className="flex-1 rounded-[var(--border-radius)] bg-green-500 py-2 text-xs font-bold text-white hover:bg-green-600">
                    <Play className="inline h-3 w-3 mr-1" />
                    Resume
                  </button>
                )}
                {(project.lifecycle === "completed" || project.lifecycle === "paused") && (
                  <button onClick={() => updateLifecycle(project.id, "archived")} className="flex-1 rounded-[var(--border-radius)] bg-gray-500 py-2 text-xs font-bold text-white hover:bg-gray-600">
                    <Archive className="inline h-3 w-3 mr-1" />
                    Archive
                  </button>
                )}
              </div>

              {/* Expand Toggle */}
              <button onClick={() => toggleProjectExpansion(project.id)} className="mt-3 flex w-full items-center justify-center gap-1 text-xs opacity-50 hover:opacity-100">
                {isExpanded ? <><ChevronUp className="h-3 w-3" />Hide Notes</> : <><ChevronDown className="h-3 w-3" />Show Notes</>}
              </button>

              {/* Expanded Notes */}
              {isExpanded && (
                <div className="mt-3 space-y-3 border-t-2 border-[var(--color-text)]/10 pt-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold">Context</label>
                    <textarea
                      value={project.notes.context}
                      onChange={(e) => updateNotes(project.id, { context: e.target.value })}
                      placeholder="What's this project about?"
                      className="w-full rounded-[var(--border-radius)] border border-[var(--color-text)]/20 bg-transparent px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                      style={{ color: "var(--color-text)" }}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">Decisions</label>
                    <textarea
                      value={project.notes.decisions}
                      onChange={(e) => updateNotes(project.id, { decisions: e.target.value })}
                      placeholder="Key decisions made..."
                      className="w-full rounded-[var(--border-radius)] border border-[var(--color-text)]/20 bg-transparent px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                      style={{ color: "var(--color-text)" }}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">Open Questions</label>
                    <textarea
                      value={project.notes.openQuestions}
                      onChange={(e) => updateNotes(project.id, { openQuestions: e.target.value })}
                      placeholder="What needs answering?"
                      className="w-full rounded-[var(--border-radius)] border border-[var(--color-text)]/20 bg-transparent px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                      style={{ color: "var(--color-text)" }}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">Ideas / Backlog</label>
                    <textarea
                      value={project.notes.ideas}
                      onChange={(e) => updateNotes(project.id, { ideas: e.target.value })}
                      placeholder="Future ideas..."
                      className="w-full rounded-[var(--border-radius)] border border-[var(--color-text)]/20 bg-transparent px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                      style={{ color: "var(--color-text)" }}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text)] opacity-50">
          <Briefcase className="mx-auto h-16 w-16 mb-4" />
          <p className="text-lg">No projects yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}
