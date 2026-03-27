import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  const isAdmin = !!session;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');

  const where: Record<string, unknown> = {};
  if (!isAdmin) where.isPublic = true;
  if (category) where.categoryId = category;
  if (tag) where.tags = { has: tag };

  const projects = await prisma.project.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  // hide url from non-admins if urlPublic = false
  return NextResponse.json(
    projects.map((p) => ({
      ...p,
      url: isAdmin || p.urlPublic ? p.url : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, description, url, imageUrl, urlPublic, isPublic, tags, categoryId } = body;

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      url: url || null,
      imageUrl: imageUrl || null,
      urlPublic: urlPublic ?? true,
      isPublic: isPublic ?? true,
      tags: tags || [],
      categoryId: categoryId || null,
    },
    include: { category: true },
  });

  return NextResponse.json(project, { status: 201 });
}
