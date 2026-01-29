import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const filter = req.nextUrl.searchParams.get('filter') || 'all';
        const search = req.nextUrl.searchParams.get('search')?.toLowerCase() || '';

        const q = query(
            collection(db, 'goals'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const goals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        let filteredGoals = goals;

        // 1. Apply Status Filter
        if (filter === 'active') {
            filteredGoals = filteredGoals.filter((g: any) => g.lifecycle === 'active');
        } else if (filter === 'completed') {
            filteredGoals = filteredGoals.filter((g: any) => g.lifecycle === 'completed');
        }

        // 2. Apply Search Filter
        if (search) {
            const searchTerms = search.split(' ').map((t: string) => t.trim()).filter(Boolean);

            filteredGoals = filteredGoals.filter((g: any) => {
                const title = (g.title || '').toLowerCase();
                return searchTerms.every((term: string) => title.includes(term));
            });
        }

        // Sort by priority (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filteredGoals.sort((a: any, b: any) => {
            const pA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
            const pB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
            return pB - pA;
        });

        return NextResponse.json({ goals: filteredGoals });
    } catch (error) {
        console.error('Error fetching goals:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
