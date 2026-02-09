import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = 'hastdu-auth-token';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(payload: JWTPayload): Promise<void> {
  const token = createToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  });
  
  if (!user || user.isBanned) return null;
  
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}
