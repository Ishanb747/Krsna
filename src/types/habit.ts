export interface Habit {
    id: string;
    name: string;
    frequency: "daily" | "weekly";
    variants: {
        easy: string;
        medium: string;
        hard: string;
    };
    streak: number;
    completedDates: number[]; // Array of timestamps (midnight)
    userId: string;
    createdAt: number;
}
