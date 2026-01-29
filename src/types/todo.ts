export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
    userId: string;
    priority?: "low" | "medium" | "high";
    dueDate?: number;
    habitId?: string;
    order?: number;
    tags?: string[];
    description?: string;
    subtasks?: {
        id: string;
        text: string;
        completed: boolean;
    }[];
    goalId?: string;
    projectId?: string;
    relation?: 'sequential' | 'parallel' | 'optional' | 'repeating';
}
