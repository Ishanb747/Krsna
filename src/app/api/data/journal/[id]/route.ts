import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
        const body = await req.json();

        const docRef = doc(db, 'journal', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
        }

        if (docSnap.data().userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Only allow updating certain fields
        const updates: any = {};
        if (body.content !== undefined) updates.content = body.content;
        if (body.title !== undefined) updates.title = body.title;
        if (body.mood !== undefined) updates.mood = body.mood;
        if (body.tags !== undefined) updates.tags = body.tags;

        await updateDoc(docRef, updates);

        return NextResponse.json({
            id,
            ...updates,
            message: 'Journal entry updated successfully'
        });
    } catch (error) {
        console.error('Error updating journal entry:', error);
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
        const docRef = doc(db, 'journal', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
        }

        if (docSnap.data().userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await deleteDoc(docRef);

        return NextResponse.json({
            message: 'Journal entry deleted successfully',
            id
        });
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
