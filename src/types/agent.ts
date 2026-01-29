export interface AgentMemory {
    id: string;
    userId: string;
    content: string; // The actual memory/fact
    type: 'fact' | 'emotion' | 'preference' | 'context';
    importance: number; // 1-10, used for retrieval weighting
    createdAt: number;
    tags?: string[];
}

export interface AgentConfig {
    userId: string;
    personalityMode: 'coach' | 'friend' | 'strict' | 'guru';
    coachingStyle?: 'standard' | 'narrative' | 'simulation'; // New field
    focusVideoUrl?: string; // New field for background video
    checkInInterval?: number; // New field for check-in frequency (minutes)
    voiceDrift: number; // 0-100, how much the voice has evolved
    honestyLevel: number; // 0-100, soft to brutal
    lastInteraction: number;
    streakDays: number;
}

export interface ProactiveTrigger {
    id: string;
    type: 'inactivity' | 'time' | 'recurrence' | 'lapse_risk';
    condition: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
}
