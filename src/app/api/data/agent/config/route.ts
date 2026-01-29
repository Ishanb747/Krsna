import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AgentConfig } from '@/types/agent';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const q = query(
            collection(db, 'agent_config'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            // Return default config if none exists
            const defaultConfig: AgentConfig = {
                userId,
                personalityMode: 'coach',
                voiceDrift: 0,
                honestyLevel: 50,
                lastInteraction: Date.now(),
                streakDays: 0
            };
            return NextResponse.json({ config: defaultConfig });
        }

        const config = {
            ...snapshot.docs[0].data()
        } as AgentConfig;

        return NextResponse.json({ config });
    } catch (error) {
        console.error('Error fetching agent config:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // Check if config exists
        const q = query(
            collection(db, 'agent_config'),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await updateDoc(doc(db, 'agent_config', docId), {
                ...data,
                lastInteraction: Date.now()
            });
            return NextResponse.json({ success: true, message: 'Updated existing config' });
        } else {
            const newConfig: AgentConfig = {
                userId,
                personalityMode: 'coach',
                coachingStyle: 'standard',
                checkInInterval: 10,
                voiceDrift: 0,
                honestyLevel: 50,
                lastInteraction: Date.now(),
                streakDays: 0,
                ...data
            };
            await addDoc(collection(db, 'agent_config'), newConfig);
            return NextResponse.json({ success: true, message: 'Created new config' });
        }

    } catch (error) {
        console.error('Error updating agent config:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
