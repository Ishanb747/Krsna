import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const search = req.nextUrl.searchParams.get('search')?.toLowerCase() || '';

        const q = query(
            collection(db, 'trackers'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const trackers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        let filteredTrackers = trackers;

        // Apply Search Filter
        if (search) {
            const searchTerms = search.split(' ').map((t: string) => t.trim()).filter(Boolean);

            filteredTrackers = filteredTrackers.filter((tracker: any) => {
                const name = (tracker.name || '').toLowerCase();
                return searchTerms.every((term: string) => name.includes(term));
            });
        }

        // Sort: Active streaks first, then by name
        filteredTrackers.sort((a: any, b: any) => b.streak - a.streak);

        return NextResponse.json({ trackers: filteredTrackers });
    } catch (error) {
        console.error('Error fetching trackers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
