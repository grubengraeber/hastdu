'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateProfile } from '@/actions/profile';
import { REGIONS } from '@/lib/utils';
import { toast } from 'sonner';

interface ProfileFormProps {
  user: {
    name: string;
    phone: string | null;
    region: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profil aktualisiert');
      }
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={user.name}
          required
          minLength={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={user.phone || ''}
          placeholder="+43 ..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region (optional)</Label>
        <Select name="region" defaultValue={user.region || ''}>
          <SelectTrigger>
            <SelectValue placeholder="Wähle deine Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Keine Angabe</SelectItem>
            {REGIONS.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Wird gespeichert...' : 'Speichern'}
      </Button>
    </form>
  );
}
