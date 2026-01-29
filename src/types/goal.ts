export type GoalArchetype = 'outcome' | 'identity' | 'skill' | 'maintenance' | 'exploration';
export type GoalLifecycle = 'draft' | 'active' | 'stalled' | 'paused' | 'completed' | 'abandoned';
export type ProgressSource = 'manual' | 'milestone' | 'habit' | 'task';
export type GoalHealth = 'on_track' | 'at_risk' | 'stalled';
export type Priority = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'moderate' | 'challenging' | 'hard' | 'brutal';
export type EmotionalWeight = 'low' | 'medium' | 'heavy';
export type MilestoneWeight = 'light' | 'medium' | 'heavy';
export type MilestoneStatus = 'pending' | 'done' | 'skipped';

export interface Milestone {
    id: string;
    title: string;
    description?: string;
    targetDate?: number;
    status: MilestoneStatus;
    weight: MilestoneWeight;
    completionNotes?: string;
    completedAt?: number;
}

export interface GoalReflection {
    whyMatters: string;
    ifQuit: string;
    successFeels: string;
}

export interface Goal {
    id: string;
    title: string;
    archetype: GoalArchetype;
    lifecycle: GoalLifecycle;

    // Timestamps
    createdAt: number;
    startedAt?: number;
    pausedAt?: number;
    completedAt?: number;
    lastActivityAt?: number;

    // Effort & Perception
    difficulty: Difficulty;
    emotionalWeight: EmotionalWeight;
    priority: Priority;

    // Progress
    progressSource: ProgressSource;
    manualProgress?: number; // 0-100
    milestones: Milestone[];
    linkedHabitIds: string[];
    linkedTaskIds: string[];

    // Meaning
    reflection: GoalReflection;
    abandonedReason?: string;

    // Relationships
    parentGoalId?: string;
    supportingGoalIds: string[];
    conflictingGoalIds: string[];

    userId: string;
}
