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
            collection(db, 'projects'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        let filteredProjects = projects;

        // 1. Apply Status Filter
        if (filter === 'active') {
            filteredProjects = filteredProjects.filter((p: any) => p.lifecycle === 'active');
        } else if (filter === 'completed') {
            filteredProjects = filteredProjects.filter((p: any) => p.lifecycle === 'completed');
        } else if (filter === 'planned') {
            filteredProjects = filteredProjects.filter((p: any) => p.lifecycle === 'planned');
        }

        // 2. Apply Search Filter
        if (search) {
            const searchTerms = search.split(' ').map((t: string) => t.trim()).filter(Boolean);

            filteredProjects = filteredProjects.filter((p: any) => {
                const title = (p.title || '').toLowerCase();
                // Optionally search notes/context too if needed
                return searchTerms.every((term: string) => title.includes(term));
            });
        }

        // Sort by last touched desc
        filteredProjects.sort((a: any, b: any) => (b.lastTouchedAt || 0) - (a.lastTouchedAt || 0));

        return NextResponse.json({ projects: filteredProjects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
