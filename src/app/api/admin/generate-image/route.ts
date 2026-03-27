import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description } = await req.json();
  if (!description && !name) {
    return NextResponse.json({ error: 'name or description required' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `App icon / hero image for a software project called "${name}". ${description ? `The project: ${description}` : ''} Style: clean, modern, dark background, glowing neon accents, tech-focused, no text, square composition.`;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'url',
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) return NextResponse.json({ error: 'No image returned' }, { status: 500 });

  // Download the image from OpenAI (URL expires ~1hr)
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) return NextResponse.json({ error: 'Failed to download image' }, { status: 500 });

  const buffer = Buffer.from(await imageRes.arrayBuffer());
  const filename = `${Date.now()}-ai-generated.png`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/api/uploads/${filename}` });
}
