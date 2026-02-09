'use server';

import { db, users } from '@/db';
import { hashPassword, verifyPassword, setAuthCookie, removeAuthCookie, getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
});

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

export async function register(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
  };

  const result = registerSchema.safeParse(rawData);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError?.message || 'Validierungsfehler' };
  }

  const { email, password, name } = result.data;

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { error: 'E-Mail-Adresse wird bereits verwendet' };
  }

  // Create user
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({
    email,
    passwordHash,
    name,
  }).returning();

  // Set auth cookie
  await setAuthCookie({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  redirect('/');
}

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const result = loginSchema.safeParse(rawData);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError?.message || 'Validierungsfehler' };
  }

  const { email, password } = result.data;

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { error: 'Ungültige E-Mail oder Passwort' };
  }

  if (user.isBanned) {
    return { error: 'Dein Account wurde gesperrt' };
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: 'Ungültige E-Mail oder Passwort' };
  }

  // Set auth cookie
  await setAuthCookie({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  redirect('/');
}

export async function logout() {
  await removeAuthCookie();
  redirect('/login');
}

export async function getSession() {
  const user = await getCurrentUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}
