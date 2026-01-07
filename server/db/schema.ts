import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Kurse und Ordner Tabelle
export const dashboardItems = sqliteTable('dashboard_items', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['course', 'folder'] }).notNull(),
  name: text('name').notNull(),  // Wird als "title" ans Frontend geschickt
  themeColor: text('theme_color'),
  parentFolderId: text('parent_folder_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$default(() => new Date()),

  // Felder die im Frontend erwartet werden
  icon: text('icon'),  // Emoji für Kurs/Ordner
  professor: text('professor'),  // Nur für Kurse
  totalProgress: integer('total_progress').default(0),  // Nur für Kurse
  titlePt: text('title_pt'),  // Portugiesischer Titel

  // Nur für Kurse (JSON Handling jetzt manuell)
  units: text('units'),
  courseProgress: text('course_progress'),

  // Nur für Ordner
  sortOrder: integer('sort_order'),
});

// User Stats Tabelle (Matched src/types/index.ts UserStats)
export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Neue Felder aus UserStats
  totalXp: integer('total_xp').default(0),
  coins: integer('coins').default(0),

  // Umbenannt: streak -> currentStreak
  currentStreak: integer('current_streak').default(0),

  // Umbenannt: lastActivity -> lastStudyDate
  lastStudyDate: text('last_study_date'),

  // JSON Array als Text
  purchasedItems: text('purchased_items').default('[]'),

  // Neue Felder
  activeAvatar: text('active_avatar').default('🦸'),
  darkMode: integer('dark_mode', { mode: 'boolean' }).default(false),

  systemPrompt: text('system_prompt'),

  createdAt: integer('created_at', { mode: 'timestamp' }).$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$default(() => new Date()),
});