'use server';

import { db, users } from '@/db';
import { requireAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  phone: z.string().optional(),
  region: z.string().optional(),
});

export async function updateProfile(formData: FormData) {
  const user = await requireAuth();

  const rawData = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || undefined,
    region: formData.get('region') as string || undefined,
  };

  const result = updateProfileSchema.safeParse(rawData);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError?.message || 'Validierungsfehler' };
  }

  const { name, phone, region } = result.data;

  await db.update(users)
    .set({
      name,
      phone: phone || null,
      region: region as any || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  revalidatePath('/profile');
  return { success: true };
}
