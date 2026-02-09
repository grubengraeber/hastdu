'use server';

import { db, ads, users, moderationLog } from '@/db';
import { requireAdmin } from '@/lib/auth';
import { eq, desc, and, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAllAds(options?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (options?.status) {
    conditions.push(eq(ads.status, options.status as any));
  }

  const results = await db.query.ads.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
      images: {
        limit: 1,
        orderBy: (images, { asc }) => [asc(images.order)],
      },
    },
    orderBy: [desc(ads.createdAt)],
    limit,
    offset,
  });

  return results;
}

export async function flagAd(adId: string, reason: string) {
  const admin = await requireAdmin();

  await db.update(ads)
    .set({ status: 'flagged' })
    .where(eq(ads.id, adId));

  await db.insert(moderationLog).values({
    adminId: admin.id,
    action: 'flag_ad',
    targetType: 'ad',
    targetId: adId,
    reason,
  });

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function deleteAdAsAdmin(adId: string, reason: string) {
  const admin = await requireAdmin();

  await db.update(ads)
    .set({ status: 'deleted' })
    .where(eq(ads.id, adId));

  await db.insert(moderationLog).values({
    adminId: admin.id,
    action: 'delete_ad',
    targetType: 'ad',
    targetId: adId,
    reason,
  });

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function restoreAd(adId: string) {
  const admin = await requireAdmin();

  await db.update(ads)
    .set({ status: 'active' })
    .where(eq(ads.id, adId));

  await db.insert(moderationLog).values({
    adminId: admin.id,
    action: 'restore_ad',
    targetType: 'ad',
    targetId: adId,
  });

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function getAllUsers(options?: {
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const offset = (page - 1) * limit;

  return db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      isBanned: true,
      createdAt: true,
    },
    orderBy: [desc(users.createdAt)],
    limit,
    offset,
  });
}

export async function banUser(userId: string, reason: string) {
  const admin = await requireAdmin();

  // Don't allow banning admins
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { error: 'User nicht gefunden' };
  }

  if (user.role === 'admin') {
    return { error: 'Admins können nicht gesperrt werden' };
  }

  await db.update(users)
    .set({ isBanned: true })
    .where(eq(users.id, userId));

  await db.insert(moderationLog).values({
    adminId: admin.id,
    action: 'ban_user',
    targetType: 'user',
    targetId: userId,
    reason,
  });

  revalidatePath('/admin');
  return { success: true };
}

export async function unbanUser(userId: string) {
  const admin = await requireAdmin();

  await db.update(users)
    .set({ isBanned: false })
    .where(eq(users.id, userId));

  await db.insert(moderationLog).values({
    adminId: admin.id,
    action: 'unban_user',
    targetType: 'user',
    targetId: userId,
  });

  revalidatePath('/admin');
  return { success: true };
}

export async function getModerationLog(options?: {
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const offset = (page - 1) * limit;

  return db.query.moderationLog.findMany({
    with: {
      // admin: {
      //   columns: { id: true, name: true, email: true },
      // },
    },
    orderBy: [desc(moderationLog.createdAt)],
    limit,
    offset,
  });
}
