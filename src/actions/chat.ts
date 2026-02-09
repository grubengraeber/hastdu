'use server';

import { db, chatRooms, messages, ads } from '@/db';
import { requireAuth } from '@/lib/auth';
import { eq, and, or, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getOrCreateChatRoom(adId: string) {
  const user = await requireAuth();

  const ad = await db.query.ads.findFirst({
    where: eq(ads.id, adId),
  });

  if (!ad) {
    throw new Error('Anzeige nicht gefunden');
  }

  if (ad.userId === user.id) {
    throw new Error('Du kannst nicht mit dir selbst chatten');
  }

  // Check if chat room exists
  let chatRoom = await db.query.chatRooms.findFirst({
    where: and(
      eq(chatRooms.adId, adId),
      eq(chatRooms.buyerId, user.id)
    ),
  });

  if (!chatRoom) {
    // Create new chat room
    [chatRoom] = await db.insert(chatRooms).values({
      adId,
      buyerId: user.id,
      sellerId: ad.userId,
    }).returning();
  }

  return chatRoom;
}

export async function sendMessage(chatRoomId: string, content: string) {
  const user = await requireAuth();

  const chatRoom = await db.query.chatRooms.findFirst({
    where: eq(chatRooms.id, chatRoomId),
  });

  if (!chatRoom) {
    throw new Error('Chat nicht gefunden');
  }

  if (chatRoom.buyerId !== user.id && chatRoom.sellerId !== user.id) {
    throw new Error('Keine Berechtigung');
  }

  const [message] = await db.insert(messages).values({
    chatRoomId,
    senderId: user.id,
    content: content.trim(),
  }).returning();

  // Update chat room timestamp
  await db.update(chatRooms)
    .set({ updatedAt: new Date() })
    .where(eq(chatRooms.id, chatRoomId));

  revalidatePath('/messages');
  revalidatePath(`/messages/${chatRoomId}`);

  return message;
}

export async function getMessages(chatRoomId: string) {
  const user = await requireAuth();

  const chatRoom = await db.query.chatRooms.findFirst({
    where: eq(chatRooms.id, chatRoomId),
  });

  if (!chatRoom) {
    throw new Error('Chat nicht gefunden');
  }

  if (chatRoom.buyerId !== user.id && chatRoom.sellerId !== user.id) {
    throw new Error('Keine Berechtigung');
  }

  // Mark messages as read
  await db.update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.chatRoomId, chatRoomId),
        eq(messages.isRead, false),
        // Only mark messages from the other user as read
        chatRoom.buyerId === user.id
          ? eq(messages.senderId, chatRoom.sellerId)
          : eq(messages.senderId, chatRoom.buyerId)
      )
    );

  return db.query.messages.findMany({
    where: eq(messages.chatRoomId, chatRoomId),
    with: {
      sender: {
        columns: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: [desc(messages.createdAt)],
  });
}

export async function getInbox() {
  const user = await requireAuth();

  const rooms = await db.query.chatRooms.findMany({
    where: or(
      eq(chatRooms.buyerId, user.id),
      eq(chatRooms.sellerId, user.id)
    ),
    with: {
      ad: {
        columns: { id: true, title: true },
        with: {
          images: {
            limit: 1,
            orderBy: (images, { asc }) => [asc(images.order)],
          },
        },
      },
      buyer: {
        columns: { id: true, name: true, avatarUrl: true },
      },
      seller: {
        columns: { id: true, name: true, avatarUrl: true },
      },
      messages: {
        limit: 1,
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
      },
    },
    orderBy: [desc(chatRooms.updatedAt)],
  });

  // Get unread count for each room
  const roomsWithUnread = await Promise.all(
    rooms.map(async (room) => {
      const unreadCount = await db.query.messages.findMany({
        where: and(
          eq(messages.chatRoomId, room.id),
          eq(messages.isRead, false),
          room.buyerId === user.id
            ? eq(messages.senderId, room.sellerId)
            : eq(messages.senderId, room.buyerId)
        ),
      });

      const otherUser = room.buyerId === user.id ? room.seller : room.buyer;

      return {
        ...room,
        otherUser,
        unreadCount: unreadCount.length,
        lastMessage: room.messages[0] || null,
      };
    })
  );

  return roomsWithUnread;
}

export async function getChatRoom(chatRoomId: string) {
  const user = await requireAuth();

  const chatRoom = await db.query.chatRooms.findFirst({
    where: eq(chatRooms.id, chatRoomId),
    with: {
      ad: {
        columns: { id: true, title: true, price: true },
        with: {
          images: {
            limit: 1,
            orderBy: (images, { asc }) => [asc(images.order)],
          },
        },
      },
      buyer: {
        columns: { id: true, name: true, avatarUrl: true },
      },
      seller: {
        columns: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  if (!chatRoom) return null;

  if (chatRoom.buyerId !== user.id && chatRoom.sellerId !== user.id) {
    return null;
  }

  const otherUser = chatRoom.buyerId === user.id ? chatRoom.seller : chatRoom.buyer;

  return { ...chatRoom, otherUser };
}
