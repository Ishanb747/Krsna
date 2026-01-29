"use client";

import { useState } from "react";
import { useTrackers } from "@/hooks/useTrackers";
import { Tracker, TrackerLog } from "@/types/tracker";
import { Plus, Flame, Trash2, Check, X, ChevronDown, ChevronUp, Calendar, Target, Clock } from "lucide-react";
import clsx from "clsx";

export default function TrackerPage() {
  const { trackers, loading, addTracker, logTracker, getTodayLog, deleteTracker } = useTrackers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTrackerIds, setExpandedTrackerIds] = useState<string[]>([]);
  
  // Form state
  const [newTrackerName, setNewTrackerName] = useState("");
  const [trackerType, setTrackerType] = useState<Tracker["type"]>("yes-no");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [frequency, setFrequency] = useState<Tracker["frequency"]>("daily");
  const [scheduledTimes, setScheduledTimes] = useState<string[]>([]);
  const [timeInput, setTimeInput] = useState("");

  // Log state
  const [logValues, setLogValues] = useState<Record<string, string>>({});
  const [logNotes, setLogNotes] = useState<Record<string, string>>({});

  const toggleTrackerExpansion = (trackerId: string) => {
    setExpandedTrackerIds(prev => 
      prev.includes(trackerId) 
        ? prev.filter(id => id !== trackerId)
        : [...prev, trackerId]
    );
  };

  const handleAddTime = () => {
    if (timeInput && !scheduledTimes.includes(timeInput)) {
      setScheduledTimes([...scheduledTimes, timeInput]);
      setTimeInput("");
    }
  };

  const handleRemoveTime = (time: string) => {
    setScheduledTimes(scheduledTimes.filter(t => t !== time));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackerName.trim()) {
      alert("Please enter a tracker name");
      return;
    }

    if ((trackerType === "count" || trackerType === "duration") && (!targetValue || !unit)) {
      alert("Please enter target value and unit");
      return;
    }

    await addTracker(
      newTrackerName,
      trackerType,
      frequency,
      trackerType !== "yes-no" ? parseFloat(targetValue) : undefined,
      trackerType !== "yes-no" ? unit : undefined,
      scheduledTimes.length > 0 ? scheduledTimes : undefined
    );

    // Reset form
    setNewTrackerName("");
    setTrackerType("yes-no");
    setTargetValue("");
    setUnit("");
    setFrequency("daily");
    setScheduledTimes([]);
    setIsModalOpen(false);
  };

  const handleLogCompletion = async (trackerId: string, tracker: Tracker) => {
    const value = tracker.type !== "yes-no" ? parseFloat(logValues[trackerId] || "0") : undefined;
    const note = logNotes[trackerId] || undefined;
    
    await logTracker(trackerId, true, value, note);
    
    // Clear inputs
    setLogValues(prev => ({ ...prev, [trackerId]: "" }));
    setLogNotes(prev => ({ ...prev, [trackerId]: "" }));
  };



  if (loading) {
    return <div className="p-8 text-[var(--color-text)]">Loading trackers...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold" style={{ color: "var(--color-text)" }}>Tracker</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cozy-btn flex items-center gap-2 bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[var(--color-secondary)]"
        >
          <Plus className="h-5 w-5" />
          Create Tracker
        </button>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="cozy-card w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>New Tracker</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text)] hover:text-[var(--color-danger)]">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Tracker Name</label>
                <input
                  type="text"
                  value={newTrackerName}
                  onChange={(e) => setNewTrackerName(e.target.value)}
                  placeholder="e.g., Reading, Meditation, Exercise"
                  className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                  style={{ color: "var(--color-text)" }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Type</label>
                <select
                  value={trackerType}
                  onChange={(e) => setTrackerType(e.target.value as Tracker["type"])}
                  className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                  style={{ color: "var(--color-text)" }}
                >
                  <option value="yes-no">Yes/No (e.g., Meditate)</option>
                  <option value="count">Count-based (e.g., Pages, Reps)</option>
                  <option value="duration">Duration-based (e.g., Minutes)</option>
                </select>
              </div>

              {trackerType !== "yes-no" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Target Value</label>
                    <input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder="30"
                      className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                      style={{ color: "var(--color-text)" }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="pages, reps, mins"
                      className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                      style={{ color: "var(--color-text)" }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Tracker["frequency"])}
                  className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                  style={{ color: "var(--color-text)" }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold" style={{ color: "var(--color-text)" }}>Scheduled Times (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="flex-1 rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                    style={{ color: "var(--color-text)" }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTime}
                    className="rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-primary)] px-3 py-2 text-white hover:bg-[var(--color-secondary)]"
                  >
                    Add
                  </button>
                </div>
                {scheduledTimes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {scheduledTimes.map((time) => (
                      <span
                        key={time}
                        className="flex items-center gap-1 rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-white"
                      >
                        {time}
                        <button type="button" onClick={() => handleRemoveTime(time)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-[var(--border-radius)] bg-[var(--color-primary)] py-3 font-bold text-white hover:bg-[var(--color-secondary)]"
              >
                Create Tracker
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trackers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
        {trackers.map((tracker) => {
          const todayLog = getTodayLog(tracker);
          const isExpanded = expandedTrackerIds.includes(tracker.id);

          return (
            <div
              key={tracker.id}
              className={clsx(
                "cozy-card group flex flex-col justify-between p-6 transition-all",
                todayLog?.completed && "bg-[var(--color-bg)]"
              )}
            >
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{tracker.name}</h3>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this tracker?")) {
                        deleteTracker(tracker.id);
                      }
                    }}
                    className="text-[var(--color-text)] opacity-0 transition-opacity hover:text-[var(--color-danger)] group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Type Badge */}
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[var(--color-primary)]/20 px-2 py-1 font-bold text-[var(--color-primary)]">
                    {tracker.type === "yes-no" ? "Yes/No" : tracker.type === "count" ? "Count" : "Duration"}
                  </span>
                  {tracker.targetValue && (
                    <span className="flex items-center gap-1 rounded-full bg-[var(--color-secondary)]/20 px-2 py-1 font-bold text-[var(--color-secondary)]">
                      <Target className="h-3 w-3" />
                      {tracker.targetValue} {tracker.unit}
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded-full bg-[var(--color-accent)]/20 px-2 py-1 font-bold text-[var(--color-accent)]">
                    <Calendar className="h-3 w-3" />
                    {tracker.frequency}
                  </span>
                </div>

                {/* Stats */}
                <div className="mb-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-[var(--color-secondary)]">
                    <Flame className="h-4 w-4 fill-current" />
                    <span className="font-bold">{tracker.streak} streak</span>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--color-text)]">
                    <Check className="h-4 w-4" />
                    <span className="font-bold">{tracker.totalCompletions} total</span>
                  </div>
                </div>

                {/* Scheduled Times */}
                {tracker.scheduledTimes && tracker.scheduledTimes.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {tracker.scheduledTimes.map((time) => (
                      <span key={time} className="flex items-center gap-1 text-xs opacity-70">
                        <Clock className="h-3 w-3" />
                        {time}
                      </span>
                    ))}
                  </div>
                )}

                {/* Today's Log Status */}
                {todayLog && (
                  <div className={clsx(
                    "mb-3 rounded-[var(--border-radius)] p-2 text-sm",
                    todayLog.completed 
                      ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}>
                    <div className="font-bold">
                      {todayLog.completed ? "✓ Completed" : "✗ Missed"}
                      {todayLog.value && ` - ${todayLog.value} ${tracker.unit}`}
                    </div>
                    {todayLog.note && <div className="mt-1 text-xs italic">"{todayLog.note}"</div>}
                  </div>
                )}

                {/* Log Interface */}
                {!todayLog && (
                  <div className="space-y-2">
                    {tracker.type !== "yes-no" && (
                      <input
                        type="number"
                        value={logValues[tracker.id] || ""}
                        onChange={(e) => setLogValues({ ...logValues, [tracker.id]: e.target.value })}
                        placeholder={`Enter ${tracker.unit || "value"}`}
                        className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                        style={{ color: "var(--color-text)" }}
                      />
                    )}
                    <input
                      type="text"
                      value={logNotes[tracker.id] || ""}
                      onChange={(e) => setLogNotes({ ...logNotes, [tracker.id]: e.target.value })}
                      placeholder="Add note (optional)"
                      className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                      style={{ color: "var(--color-text)" }}
                    />
                    <button
                        onClick={() => handleLogCompletion(tracker.id, tracker)}
                        className="w-full rounded-[var(--border-radius)] bg-green-500 py-2 text-sm font-bold text-white hover:bg-green-600"
                      >
                        <Check className="inline h-4 w-4 mr-1" />
                        Complete
                      </button>
                  </div>
                )}

                {/* History Toggle */}
                <button
                  onClick={() => toggleTrackerExpansion(tracker.id)}
                  className="mt-3 flex w-full items-center justify-center gap-1 text-xs opacity-50 hover:opacity-100"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Hide History
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show History ({tracker.logs.length} logs)
                    </>
                  )}
                </button>

                {/* History */}
                {isExpanded && tracker.logs.length > 0 && (
                  <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-[var(--border-radius)] border-2 border-[var(--color-text)] p-2">
                    {[...tracker.logs]
                      .sort((a, b) => b.date - a.date)
                      .map((log, idx) => (
                        <div
                          key={idx}
                          className={clsx(
                            "rounded p-2 text-xs",
                            log.completed
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          )}
                        >
                          <div className="font-bold">
                            {new Date(log.date).toLocaleDateString()} - {log.completed ? "✓" : "✗"}
                            {log.value && ` - ${log.value} ${tracker.unit}`}
                          </div>
                          {log.note && <div className="mt-1 italic">"{log.note}"</div>}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {trackers.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text)] opacity-50">
          <p className="text-lg">No trackers yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}
