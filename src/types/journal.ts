export interface JournalEntry {
    id: string;
    content: string;
    mood?: "happy" | "neutral" | "sad" | "stressed" | "energetic";
    createdAt: number;
    userId: string;
    title?: string;
    tags?: string[];
    images?: string[];
}
