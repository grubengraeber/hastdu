'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { flagAd, deleteAdAsAdmin, restoreAd } from '@/actions/admin';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface Ad {
  id: string;
  title: string;
  price: string;
  status: string;
  createdAt: Date;
  user: { id: string; name: string; email: string };
  images: { url: string }[];
}

interface AdminAdsTableProps {
  ads: Ad[];
}

export function AdminAdsTable({ ads }: AdminAdsTableProps) {
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [action, setAction] = useState<'flag' | 'delete' | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    sold: 'bg-blue-500',
    flagged: 'bg-orange-500',
    deleted: 'bg-red-500',
  };

  async function handleAction() {
    if (!selectedAd || !action) return;
    
    setLoading(true);
    try {
      if (action === 'flag') {
        await flagAd(selectedAd.id, reason);
        toast.success('Anzeige markiert');
      } else if (action === 'delete') {
        await deleteAdAsAdmin(selectedAd.id, reason);
        toast.success('Anzeige gelöscht');
      }
      setSelectedAd(null);
      setAction(null);
      setReason('');
    } catch (error) {
      toast.error('Aktion fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(adId: string) {
    try {
      await restoreAd(adId);
      toast.success('Anzeige wiederhergestellt');
    } catch (error) {
      toast.error('Aktion fehlgeschlagen');
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bild</TableHead>
            <TableHead>Titel</TableHead>
            <TableHead>Preis</TableHead>
            <TableHead>Verkäufer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Erstellt</TableHead>
            <TableHead>Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell>
                <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                  {ad.images[0] ? (
                    <Image
                      src={ad.images[0].url}
                      alt={ad.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Link href={`/ads/${ad.id}`} className="hover:underline">
                  {ad.title}
                </Link>
              </TableCell>
              <TableCell>{formatPrice(ad.price)}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{ad.user.name}</p>
                  <p className="text-xs text-muted-foreground">{ad.user.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[ad.status]}>
                  {ad.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(ad.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {ad.status === 'active' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAd(ad);
                          setAction('flag');
                        }}
                      >
                        Markieren
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedAd(ad);
                          setAction('delete');
                        }}
                      >
                        Löschen
                      </Button>
                    </>
                  )}
                  {(ad.status === 'flagged' || ad.status === 'deleted') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(ad.id)}
                    >
                      Wiederherstellen
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedAd && !!action} onOpenChange={() => {
        setSelectedAd(null);
        setAction(null);
        setReason('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'flag' ? 'Anzeige markieren' : 'Anzeige löschen'}
            </DialogTitle>
            <DialogDescription>
              {selectedAd?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Grund</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Grund für die Aktion..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedAd(null);
              setAction(null);
            }}>
              Abbrechen
            </Button>
            <Button
              variant={action === 'delete' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={loading}
            >
              {loading ? 'Wird verarbeitet...' : action === 'flag' ? 'Markieren' : 'Löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
