import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { readdir, access, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { constants } from 'fs';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');
  const cwd = process.cwd();

  let files: string[] = [];
  let dirExists = false;
  let writable = false;
  let dirError = '';

  try {
    await access(uploadDir, constants.F_OK);
    dirExists = true;
  } catch (e: unknown) {
    dirError = String(e);
  }

  if (dirExists) {
    try {
      files = await readdir(uploadDir);
    } catch (e: unknown) {
      dirError = String(e);
    }

    try {
      const testFile = path.join(uploadDir, '_write_test');
      await writeFile(testFile, 'ok');
      await unlink(testFile);
      writable = true;
    } catch {
      writable = false;
    }
  }

  return NextResponse.json({
    cwd,
    uploadDir,
    UPLOAD_DIR_env: process.env.UPLOAD_DIR ?? null,
    dirExists,
    writable,
    dirError: dirError || null,
    fileCount: files.length,
    files: files.slice(0, 20),
  });
}
