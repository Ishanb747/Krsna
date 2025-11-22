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
}
