import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const limitParam = req.nextUrl.searchParams.get('limit');
        const limitNum = limitParam ? parseInt(limitParam) : 10;

        const q = query(
            collection(db, 'journal'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const entries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side sort and limit
        entries.sort((a: any, b: any) => b.createdAt - a.createdAt);
        const limitedEntries = entries.slice(0, limitNum);

        return NextResponse.json({ entries: limitedEntries });
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { content, title, mood, tags } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const newEntry = {
            userId,
            content,
            title: title || '',
            mood: mood || 'neutral',
            tags: tags || [],
            createdAt: Date.now(),
        };

        const docRef = await addDoc(collection(db, 'journal'), newEntry);

        return NextResponse.json({
            id: docRef.id,
            ...newEntry,
            message: 'Journal entry created successfully'
        });
    } catch (error) {
        console.error('Error creating journal entry:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
