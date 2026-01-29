import { create } from 'zustand';

interface AgentStore {
    isOpen: boolean;
    messages: any[];
    toggle: () => void;
    open: () => void;
    close: () => void;
    setMessages: (messages: any[] | ((prev: any[]) => any[])) => void;
}

const initialMessage = { id: 'welcome', role: 'assistant', content: "Hello! I'm your productivity assistant. How can I help you align your goals today?" };

export const useAgentStore = create<AgentStore>((set) => ({
    isOpen: false,
    messages: [initialMessage],
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    setMessages: (messages) => set((state) => ({
        messages: typeof messages === 'function' ? messages(state.messages) : messages
    })),
}));
