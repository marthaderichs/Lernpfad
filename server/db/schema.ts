import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Kurse und Ordner Tabelle
export const dashboardItems = sqliteTable('dashboard_items', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['course', 'folder'] }).notNull(),
  name: text('name').notNull(),
  themeColor: text('theme_color'),
  parentFolderId: text('parent_folder_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$default(() => new Date()),
  
  // Nur für Kurse
  units: text('units', { mode: 'json' }),  // JSON-string für Units-Array
  courseProgress: text('course_progress', { mode: 'json' }),
  
  // Nur für Ordner
  sortOrder: integer('sort_order'),
});

// User Stats Tabelle
export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stars: integer('stars').default(0),
  streak: integer('streak').default(0),
  lastActivity: text('last_activity'),
  systemPrompt: text('system_prompt'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$default(() => new Date()),
});
