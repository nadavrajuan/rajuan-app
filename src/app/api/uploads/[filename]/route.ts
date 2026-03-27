import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  // Prevent path traversal
  const filename = path.basename(params.filename);
  const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');
  const filePath = path.join(uploadDir, filename);

  try {
    const file = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const contentType = MIME[ext] ?? 'application/octet-stream';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
