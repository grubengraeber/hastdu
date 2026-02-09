'use server';

import { db, ads, adImages } from '@/db';
import { requireAuth, getCurrentUser } from '@/lib/auth';
import { uploadFile, deleteFile, getPublicUrl } from '@/lib/minio';
import { eq, desc, and, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createAdSchema = z.object({
  title: z.string().min(5, 'Titel muss mindestens 5 Zeichen haben').max(100),
  description: z.string().min(20, 'Beschreibung muss mindestens 20 Zeichen haben').max(5000),
  price: z.coerce.number().min(0, 'Preis muss positiv sein').max(1000000),
  category: z.string(),
  region: z.string(),
});

export async function createAd(formData: FormData) {
  const user = await requireAuth();

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    category: formData.get('category') as string,
    region: formData.get('region') as string,
  };

  const result = createAdSchema.safeParse(rawData);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError?.message || 'Validierungsfehler' };
  }

  const { title, description, price, category, region } = result.data;

  // Create ad
  const [ad] = await db.insert(ads).values({
    userId: user.id,
    title,
    description,
    price: price.toString(),
    category: category as any,
    region: region as any,
  }).returning();

  // Handle image uploads
  const files = formData.getAll('images') as File[];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = await uploadFile(buffer, file.name, file.type);
      await db.insert(adImages).values({
        adId: ad.id,
        url: getPublicUrl(key),
        key,
        order: i,
      });
    }
  }

  revalidatePath('/');
  revalidatePath('/my-ads');
  redirect(`/ads/${ad.id}`);
}

export async function deleteAd(adId: string) {
  const user = await requireAuth();

  const ad = await db.query.ads.findFirst({
    where: eq(ads.id, adId),
    with: { images: true },
  });

  if (!ad) {
    return { error: 'Anzeige nicht gefunden' };
  }

  if (ad.userId !== user.id && user.role !== 'admin') {
    return { error: 'Keine Berechtigung' };
  }

  // Delete images from S3
  for (const image of ad.images) {
    try {
      await deleteFile(image.key);
    } catch (e) {
      console.error('Failed to delete image:', e);
    }
  }

  // Delete ad (cascade will delete images records)
  await db.delete(ads).where(eq(ads.id, adId));

  revalidatePath('/');
  revalidatePath('/my-ads');
  redirect('/my-ads');
}

export async function getAds(options?: {
  category?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(ads.status, 'active')];

  if (options?.category) {
    conditions.push(eq(ads.category, options.category as any));
  }

  if (options?.region) {
    conditions.push(eq(ads.region, options.region as any));
  }

  if (options?.search) {
    conditions.push(
      or(
        ilike(ads.title, `%${options.search}%`),
        ilike(ads.description, `%${options.search}%`)
      )!
    );
  }

  const results = await db.query.ads.findMany({
    where: and(...conditions),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.order)],
        limit: 1,
      },
      user: {
        columns: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: [desc(ads.createdAt)],
    limit,
    offset,
  });

  return results;
}

export async function getAdById(id: string) {
  const ad = await db.query.ads.findFirst({
    where: eq(ads.id, id),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.order)],
      },
      user: {
        columns: { id: true, name: true, avatarUrl: true, region: true, createdAt: true },
      },
    },
  });

  if (ad && ad.status === 'active') {
    // Increment view count
    await db.update(ads).set({ viewCount: ad.viewCount + 1 }).where(eq(ads.id, id));
  }

  return ad;
}

export async function getMyAds() {
  const user = await getCurrentUser();
  if (!user) return [];

  return db.query.ads.findMany({
    where: eq(ads.userId, user.id),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.order)],
        limit: 1,
      },
    },
    orderBy: [desc(ads.createdAt)],
  });
}
