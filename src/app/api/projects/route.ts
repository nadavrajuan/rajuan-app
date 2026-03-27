import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  const isAdmin = !!session;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const all = isAdmin && searchParams.get('all') === 'true';
  const isIdea = searchParams.get('isIdea') === 'true';

  const where: Record<string, unknown> = {};
  if (!isAdmin) where.isPublic = true;
  if (!all) where.isIdea = isIdea;
  if (category) where.categoryId = category;
  if (tag) where.tags = { has: tag };

  const projects = await prisma.project.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    projects.map((p) => ({
      ...p,
      url: isAdmin || p.urlPublic ? p.url : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, description, longDescription, url, imageUrl, urlPublic, isPublic, isIdea, tags, categoryId } = body;

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      longDescription: longDescription || null,
      url: url || null,
      imageUrl: imageUrl || null,
      urlPublic: urlPublic ?? true,
      isPublic: isPublic ?? true,
      isIdea: isIdea ?? false,
      tags: tags || [],
      categoryId: categoryId || null,
    },
    include: { category: true },
  });

  return NextResponse.json({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }, { status: 201 });
}
