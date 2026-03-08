import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@server/db';
import { visitorSessions } from '@shared/../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      await db.delete(visitorSessions).where(eq(visitorSessions.id, sessionId));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
