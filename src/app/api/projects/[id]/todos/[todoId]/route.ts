import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; todoId: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, done, adminOnly } = await req.json();

  const todo = await prisma.todo.update({
    where: { id: params.todoId },
    data: {
      ...(text !== undefined ? { text } : {}),
      ...(done !== undefined ? { done } : {}),
      ...(adminOnly !== undefined ? { adminOnly } : {}),
    },
  });

  return NextResponse.json({ ...todo, createdAt: todo.createdAt.toISOString() });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { todoId: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.todo.delete({ where: { id: params.todoId } });
  return NextResponse.json({ ok: true });
}
