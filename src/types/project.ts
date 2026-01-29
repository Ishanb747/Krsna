export type ProjectType = 'learning' | 'work' | 'personal_system' | 'experiment';
export type ProjectLifecycle = 'planned' | 'active' | 'blocked' | 'paused' | 'completed' | 'archived';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type FrictionLevel = 'low' | 'annoying' | 'dread';
export type TaskRelation = 'sequential' | 'parallel' | 'optional' | 'repeating';

export interface StructuredNotes {
    context: string;
    decisions: string;
    openQuestions: string;
    ideas: string;
}

export interface Retrospective {
    wentWell: string;
    didntWork: string;
    wouldDoAgain: boolean;
    lessonsLearned: string;
    completedAt: number;
}

export interface Project {
    id: string;
    title: string;
    type: ProjectType;
    lifecycle: ProjectLifecycle;

    // Timestamps
    createdAt: number;
    lastTouchedAt: number;
    completedAt?: number;

    // Blocking/Pausing
    blockedReason?: string;
    pausedReason?: string;

    // Energy & Friction
    energyRequired: EnergyLevel;
    frictionLevel: FrictionLevel;

    // Notes
    notes: StructuredNotes;
    retrospective?: Retrospective;

    // Relationships
    primaryGoalId?: string;
    linkedGoalIds: string[];
    taskIds: string[];

    userId: string;
}
