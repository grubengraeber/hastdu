import { pgTable, text, timestamp, integer, boolean, uuid, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const adStatusEnum = pgEnum('ad_status', ['active', 'sold', 'flagged', 'deleted']);
export const categoryEnum = pgEnum('category', [
  'smartphones',
  'laptops',
  'desktops',
  'tablets',
  'monitors',
  'peripherals',
  'components',
  'networking',
  'audio',
  'wearables',
  'gaming',
  'other'
]);
export const regionEnum = pgEnum('region', [
  'wien',
  'niederoesterreich',
  'oberoesterreich',
  'salzburg',
  'tirol',
  'vorarlberg',
  'kaernten',
  'steiermark',
  'burgenland'
]);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  region: regionEnum('region'),
  isBanned: boolean('is_banned').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Ads table
export const ads = pgTable('ads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: categoryEnum('category').notNull(),
  region: regionEnum('region').notNull(),
  status: adStatusEnum('status').notNull().default('active'),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Ad images table
export const adImages = pgTable('ad_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  adId: uuid('ad_id').notNull().references(() => ads.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  key: text('key').notNull(), // S3/Minio key
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Chat rooms (one per ad + buyer combination)
export const chatRooms = pgTable('chat_rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  adId: uuid('ad_id').notNull().references(() => ads.id, { onDelete: 'cascade' }),
  buyerId: uuid('buyer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatRoomId: uuid('chat_room_id').notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Moderation log
export const moderationLog = pgTable('moderation_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').notNull().references(() => users.id),
  action: text('action').notNull(), // 'flag_ad', 'delete_ad', 'ban_user', 'unban_user'
  targetType: text('target_type').notNull(), // 'ad' or 'user'
  targetId: uuid('target_id').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ads: many(ads),
  sentMessages: many(messages),
  chatRoomsAsBuyer: many(chatRooms, { relationName: 'buyer' }),
  chatRoomsAsSeller: many(chatRooms, { relationName: 'seller' }),
}));

export const adsRelations = relations(ads, ({ one, many }) => ({
  user: one(users, {
    fields: [ads.userId],
    references: [users.id],
  }),
  images: many(adImages),
  chatRooms: many(chatRooms),
}));

export const adImagesRelations = relations(adImages, ({ one }) => ({
  ad: one(ads, {
    fields: [adImages.adId],
    references: [ads.id],
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  ad: one(ads, {
    fields: [chatRooms.adId],
    references: [ads.id],
  }),
  buyer: one(users, {
    fields: [chatRooms.buyerId],
    references: [users.id],
    relationName: 'buyer',
  }),
  seller: one(users, {
    fields: [chatRooms.sellerId],
    references: [users.id],
    relationName: 'seller',
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chatRoom: one(chatRooms, {
    fields: [messages.chatRoomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Ad = typeof ads.$inferSelect;
export type NewAd = typeof ads.$inferInsert;
export type AdImage = typeof adImages.$inferSelect;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type Message = typeof messages.$inferSelect;
