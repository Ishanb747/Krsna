import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
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
            collection(db, 'todos'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const todos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side filtering
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const todayTimestamp = now.getTime();

        let filteredTodos = todos;

        // 1. Apply Status/Date Filter
        if (filter === 'today') {
            filteredTodos = filteredTodos.filter((todo: any) => {
                if (!todo.dueDate) return false;
                const dueDate = new Date(todo.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate.getTime() === todayTimestamp;
            });
        } else if (filter === 'pending') {
            filteredTodos = filteredTodos.filter((todo: any) => !todo.completed);
        } else if (filter === 'completed') {
            filteredTodos = filteredTodos.filter((todo: any) => todo.completed);
        }

        // 2. Apply Search Filter (Tags, Text, etc.)
        if (search) {
            const searchTerms = search.split(' ').map((t: string) => t.trim()).filter(Boolean);

            filteredTodos = filteredTodos.filter((todo: any) => {
                const text = (todo.text || '').toLowerCase();
                const tags = (todo.tags || []).map((t: string) => t.toLowerCase());

                // Check if ALL search terms match either text OR tags
                return searchTerms.every((term: string) => {
                    // Check for exact tag match if starts with #
                    if (term.startsWith('#')) {
                        const tagQuery = term.slice(1);
                        return tags.includes(tagQuery);
                    }

                    // Otherwise check text inclusion OR tag inclusion
                    return text.includes(term) || tags.some((t: string) => t.includes(term));
                });
            });
        }

        // Sort by order
        filteredTodos.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

        return NextResponse.json({ todos: filteredTodos });
    } catch (error) {
        console.error('Error fetching todos:', error);
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

        // Basic validation
        if (!data.text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const newTodo = {
            text: data.text,
            completed: false,
            createdAt: Date.now(),
            userId,
            priority: data.priority || 'medium',
            tags: data.tags || [],
            projectId: data.projectId || null,
            goalId: data.goalId || null,
            dueDate: data.dueDate || null,
        };

        const docRef = await addDoc(collection(db, 'todos'), newTodo);

        return NextResponse.json({ id: docRef.id, ...newTodo });
    } catch (error) {
        console.error('Error creating todo:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
