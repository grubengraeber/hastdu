'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getOrCreateChatRoom } from '@/actions/chat';
import { toast } from 'sonner';

interface ContactButtonProps {
  adId: string;
}

export function ContactButton({ adId }: ContactButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleContact() {
    setLoading(true);
    try {
      const chatRoom = await getOrCreateChatRoom(adId);
      router.push(`/messages/${chatRoom.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Erstellen des Chats');
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleContact} disabled={loading} className="w-full">
      {loading ? 'Wird geladen...' : 'Verkäufer kontaktieren'}
    </Button>
  );
}
