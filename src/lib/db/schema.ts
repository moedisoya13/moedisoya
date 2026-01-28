import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 내담자
export const clients = sqliteTable("clients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),

  // 분류 3종
  location: text("location").notNull().default("정발"), // 정발, 금촌
  status: text("status").notNull().default("신규"), // 신규, 진행, 종결
  type: text("type").notNull().default("-"), // -, 놀이, voucher

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 상담 일정
export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  datetime: integer("datetime", { mode: "timestamp" }).notNull(),
  duration: integer("duration").notNull().default(60), // 분 단위
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Push 알림 구독
export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 알림 설정
export const notificationSettings = sqliteTable("notification_settings", {
  id: text("id").primaryKey().default("default"),
  reminderEnabled: integer("reminder_enabled", { mode: "boolean" }).notNull().default(true),
  reminderMinutes: integer("reminder_minutes").notNull().default(60),
  dailySummary: integer("daily_summary", { mode: "boolean" }).notNull().default(true),
  summaryTime: text("summary_time").notNull().default("08:00"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Types
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NotificationSetting = typeof notificationSettings.$inferSelect;
