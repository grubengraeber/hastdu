import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/actions/auth';
import { getInbox } from '@/actions/chat';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

export default async function MessagesPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const inbox = await getInbox();

  return (
    <>
      <Header user={session} />
      <main className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Nachrichten</h1>

        {inbox.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Du hast noch keine Nachrichten
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {inbox.map((room) => (
              <Link key={room.id} href={`/messages/${room.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {room.ad.images[0] ? (
                        <Image
                          src={room.ad.images[0].url}
                          alt={room.ad.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={room.otherUser.avatarUrl || undefined} />
                          <AvatarFallback>
                            {room.otherUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium truncate">
                          {room.otherUser.name}
                        </span>
                        {room.unreadCount > 0 && (
                          <Badge variant="default" className="ml-auto">
                            {room.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {room.ad.title}
                      </p>
                      {room.lastMessage && (
                        <p className="text-sm truncate">
                          {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {formatRelativeTime(room.updatedAt)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
