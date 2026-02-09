'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { sendMessage } from '@/actions/chat';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface ChatMessagesProps {
  chatRoomId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export function ChatMessages({ chatRoomId, currentUserId, initialMessages }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = await sendMessage(chatRoomId, newMessage);
      // Optimistically add the message
      setMessages([...messages, {
        ...message,
        sender: {
          id: currentUserId,
          name: 'Du',
          avatarUrl: null,
        },
      }]);
      setNewMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Nachricht konnte nicht gesendet werden');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Noch keine Nachrichten. Schreibe die erste!
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.sender.avatarUrl || undefined} />
                  <AvatarFallback>
                    {message.sender.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {formatRelativeTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSend} className="flex w-full gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nachricht schreiben..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? '...' : 'Senden'}
          </Button>
        </form>
      </CardFooter>
    </>
  );
}
