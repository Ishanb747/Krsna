import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AgentMemory } from '@/types/agent';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const q = query(
            collection(db, 'agent_memories'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        let memories: AgentMemory[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as AgentMemory));

        // Sort in memory to avoid needing a Firestore composite index immediately
        memories.sort((a, b) => b.importance - a.importance);
        memories = memories.slice(0, 20);

        return NextResponse.json({ memories });
    } catch (error) {
        console.error('Error fetching memories:', error);
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

        const newMemory: Omit<AgentMemory, 'id'> = {
            userId,
            content: data.content,
            type: data.type || 'fact',
            importance: data.importance || 1,
            createdAt: Date.now(),
            tags: data.tags || []
        };

        const docRef = await addDoc(collection(db, 'agent_memories'), newMemory);

        return NextResponse.json({ id: docRef.id, ...newMemory });
    } catch (error) {
        console.error('Error adding memory:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
