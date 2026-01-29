import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AgentConfig, AgentMemory } from '@/types/agent';

// This endpoint checks if the user needs a proactive nudge
export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentState } = await req.json(); // { idleTime, currentPage, ... }

        // 1. Get Agent Config
        let config: AgentConfig | null = null;
        const configSnap = await getDocs(query(collection(db, 'agent_config'), where('userId', '==', userId)));
        if (!configSnap.empty) {
            config = configSnap.docs[0].data() as AgentConfig;
        }

        // Default to no nudge
        if (!config) {
            return NextResponse.json({ nudge: null });
        }

        const now = Date.now();
        const lastInteraction = config.lastInteraction || 0;
        const timeSinceInteraction = now - lastInteraction;

        // 2. Rules Engine for Nudges
        let nudgeMessage = null;
        let nudgeType = 'proactive';

        // Context Extraction
        const timerActive = currentState?.timer?.isActive || false;
        const currentTask = currentState?.timer?.taskName || "your task";
        const isStrict = config.personalityMode === 'strict' || config.personalityMode === 'guru';
        const checkInIntervalMins = config.checkInInterval || (isStrict ? 0.5 : 15);

        // Add a default video if missing and in strict mode
        if (isStrict && !config.focusVideoUrl) {
            const focusVideos = [
                "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4",
                "https://assets.mixkit.co/videos/preview/mixkit-high-angle-view-of-a-person-typing-on-a-laptop-4437-large.mp4",
                "https://assets.mixkit.co/videos/preview/mixkit-woman-working-closely-with-her-laptop-320-large.mp4",
                "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hands-typing-on-a-mechanical-keyboard-4433-large.mp4"
            ];
            config.focusVideoUrl = focusVideos[Math.floor(Math.random() * focusVideos.length)];
        }

        // --- RULE 1: Co-Presence Check (While Working) ---
        if (timerActive) {
            // How long since we last spoke?
            // Convert interval to ms
            const intervalMs = checkInIntervalMins * 60 * 1000;

            if (timeSinceInteraction > intervalMs) {
                nudgeType = 'strict_check'; // Special type for Modal UI
                nudgeMessage = isStrict
                    ? `⚠️ STATUS REPORT. You are supposed to be working on: ${currentTask}. Are you focused?`
                    : `Checking in: Still making progress on ${currentTask}?`;
            }
        }

        // --- RULE 2: Daily Kickoff (Morning, if not working) ---
        else if (!timerActive && timeSinceInteraction > 12 * 60 * 60 * 1000) {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 12) {
                nudgeMessage = config.personalityMode === 'strict'
                    ? "Day has started. Define your objectives."
                    : "Good morning! Ready to plan today?";
            }
        }

        // --- RULE 3: Doomscroll Breaker (Idle on non-work pages) ---
        // (Simplified placeholder logic)
        else if (currentState?.isDoomscrolling) {
            nudgeMessage = "You've been scrolling. Break the loop.";
        }

        // Return result
        if (nudgeMessage) {
            // Update lastInteraction so we don't nudge again immediately
            const configColl = collection(db, 'agent_config');
            const q = query(configColl, where('userId', '==', userId));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const docId = snap.docs[0].id;
                // We update firestore directly here to be efficient
                // Actually, let's keep it clean and just do it
                const { updateDoc, doc } = await import('firebase/firestore');
                await updateDoc(doc(db, 'agent_config', docId), { lastInteraction: now });
            }

            return NextResponse.json({
                nudge: {
                    content: nudgeMessage,
                    type: nudgeType,
                    id: `nudge-${now}`
                }
            });
        }

        return NextResponse.json({ nudge: null });

    } catch (error) {
        console.error('Error in proactive engine:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
