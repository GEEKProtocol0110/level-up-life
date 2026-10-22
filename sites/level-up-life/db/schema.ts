import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const plannerAccountState = sqliteTable('planner_account_state', {
  ownerId: text('owner_id').primaryKey(),
  payload: text('payload').notNull(),
  revision: integer('revision').notNull().default(1),
  updatedAt: text('updated_at').notNull(),
});
