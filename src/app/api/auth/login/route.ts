import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });

  const admin = await prisma.admin.findFirst();
  if (!admin) return NextResponse.json({ error: 'No admin account' }, { status: 401 });

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 });

  const token = await signToken({ adminId: admin.id });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
