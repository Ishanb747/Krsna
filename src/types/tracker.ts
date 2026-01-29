export interface Tracker {
    id: string;
    name: string;
    type: 'yes-no' | 'count' | 'duration';
    targetValue?: number; // For count/duration types
    unit?: string; // e.g., 'pages', 'reps', 'minutes'
    frequency: 'daily' | 'weekly' | 'custom';
    scheduledTimes?: string[]; // e.g., ['09:00', '18:00']
    streak: number;
    totalCompletions: number;
    logs: TrackerLog[];
    userId: string;
    createdAt: number;
}

export interface TrackerLog {
    date: number; // timestamp (midnight)
    completed: boolean; // true for completion, false for explicit miss
    value?: number; // Actual value for count/duration types
    note?: string; // Manual note
    timestamp: number; // When the log was created
}
