import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  const isAdmin = !!session;

  const todos = await prisma.todo.findMany({
    where: {
      projectId: params.id,
      ...(isAdmin ? {} : { adminOnly: false }),
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(
    todos.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() }))
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, adminOnly } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 });

  const todo = await prisma.todo.create({
    data: { projectId: params.id, text: text.trim(), adminOnly: adminOnly ?? false },
  });

  return NextResponse.json({ ...todo, createdAt: todo.createdAt.toISOString() }, { status: 201 });
}
