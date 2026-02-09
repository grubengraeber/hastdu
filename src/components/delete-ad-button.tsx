'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteAd } from '@/actions/ads';
import { toast } from 'sonner';

interface DeleteAdButtonProps {
  adId: string;
}

export function DeleteAdButton({ adId }: DeleteAdButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await deleteAd(adId);
      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      }
    } catch (error) {
      toast.error('Fehler beim Löschen der Anzeige');
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          Anzeige löschen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anzeige löschen?</DialogTitle>
          <DialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Die Anzeige und alle zugehörigen Bilder werden dauerhaft gelöscht.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Wird gelöscht...' : 'Löschen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
