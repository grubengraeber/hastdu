'use client';

import { useState } from 'react';
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
import { banUser, unbanUser } from '@/actions/admin';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: Date;
}

interface AdminUsersTableProps {
  users: User[];
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleBan() {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const result = await banUser(selectedUser.id, reason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Benutzer gesperrt');
      }
      setSelectedUser(null);
      setReason('');
    } catch (error) {
      toast.error('Aktion fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnban(userId: string) {
    try {
      await unbanUser(userId);
      toast.success('Sperre aufgehoben');
    } catch (error) {
      toast.error('Aktion fehlgeschlagen');
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Rolle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registriert</TableHead>
            <TableHead>Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {user.isBanned ? (
                  <Badge variant="destructive">Gesperrt</Badge>
                ) : (
                  <Badge variant="outline">Aktiv</Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                {user.role !== 'admin' && (
                  <>
                    {user.isBanned ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnban(user.id)}
                      >
                        Entsperren
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setSelectedUser(user)}
                      >
                        Sperren
                      </Button>
                    )}
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedUser} onOpenChange={() => {
        setSelectedUser(null);
        setReason('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzer sperren</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Grund</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Grund für die Sperre..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={loading}
            >
              {loading ? 'Wird verarbeitet...' : 'Sperren'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
