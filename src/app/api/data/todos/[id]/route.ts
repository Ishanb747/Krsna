import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();

        // Prevent updating ID or userId
        delete (data as any).id;
        delete (data as any).userId;

        const docRef = doc(db, 'todos', id);
        await updateDoc(docRef, data);

        return NextResponse.json({ id, ...data });
    } catch (error) {
        console.error('Error updating todo:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const docRef = doc(db, 'todos', id);
        await deleteDoc(docRef);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting todo:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
