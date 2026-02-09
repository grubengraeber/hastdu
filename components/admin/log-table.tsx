'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface LogEntry {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  createdAt: Date;
}

interface AdminLogTableProps {
  logs: LogEntry[];
}

const actionLabels: Record<string, string> = {
  flag_ad: 'Anzeige markiert',
  delete_ad: 'Anzeige gelöscht',
  restore_ad: 'Anzeige wiederhergestellt',
  ban_user: 'Benutzer gesperrt',
  unban_user: 'Sperre aufgehoben',
};

const actionColors: Record<string, string> = {
  flag_ad: 'bg-orange-500',
  delete_ad: 'bg-red-500',
  restore_ad: 'bg-green-500',
  ban_user: 'bg-red-500',
  unban_user: 'bg-green-500',
};

export function AdminLogTable({ logs }: AdminLogTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Aktion</TableHead>
          <TableHead>Ziel</TableHead>
          <TableHead>Grund</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Keine Aktivitäten vorhanden
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{formatDate(log.createdAt)}</TableCell>
              <TableCell>
                <Badge className={actionColors[log.action] || ''}>
                  {actionLabels[log.action] || log.action}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">{log.targetType}:</span>{' '}
                <span className="font-mono text-xs">{log.targetId.slice(0, 8)}...</span>
              </TableCell>
              <TableCell>{log.reason || '-'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
