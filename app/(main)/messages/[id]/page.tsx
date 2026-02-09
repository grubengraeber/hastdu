import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/actions/auth';
import { getChatRoom, getMessages } from '@/actions/chat';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { ChatMessages } from '@/components/chat-messages';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatRoomPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const chatRoom = await getChatRoom(id);
  
  if (!chatRoom) {
    notFound();
  }

  const messages = await getMessages(id);

  return (
    <>
      <Header user={session} />
      <main className="container py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={chatRoom.otherUser.avatarUrl || undefined} />
                    <AvatarFallback>
                      {chatRoom.otherUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{chatRoom.otherUser.name}</CardTitle>
                </div>
              </CardHeader>
              <ChatMessages
                chatRoomId={id}
                currentUserId={session.id}
                initialMessages={messages.reverse()}
              />
            </Card>
          </div>

          {/* Ad info sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anzeige</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/ads/${chatRoom.ad.id}`}>
                  <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                    {chatRoom.ad.images[0] ? (
                      <Image
                        src={chatRoom.ad.images[0].url}
                        alt={chatRoom.ad.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        📦
                      </div>
                    )}
                  </div>
                </Link>
                <div>
                  <Link href={`/ads/${chatRoom.ad.id}`} className="font-medium hover:underline">
                    {chatRoom.ad.title}
                  </Link>
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(chatRoom.ad.price)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
