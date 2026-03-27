import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  const isAdmin = !!session;

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!isAdmin && !project.isPublic) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    ...project,
    url: isAdmin || project.urlPublic ? project.url : null,
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, description, url, imageUrl, urlPublic, isPublic, tags, categoryId } = body;

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      name,
      description: description ?? undefined,
      url: url ?? undefined,
      imageUrl: imageUrl ?? undefined,
      urlPublic: urlPublic ?? undefined,
      isPublic: isPublic ?? undefined,
      tags: tags ?? undefined,
      categoryId: categoryId ?? undefined,
    },
    include: { category: true },
  });

  return NextResponse.json(project);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
