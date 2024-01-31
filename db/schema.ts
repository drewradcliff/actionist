import { relations, sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const lists = sqliteTable("lists", {
	id: integer("id").primaryKey(),
	title: text("title").notNull(),
	isArchived: integer("is_archived").default(0).notNull(),
	createdAt: text("created_at")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: text("updated_at"),
})

export const listsRelations = relations(lists, ({ many }) => ({
	todos: many(todos)
}))

export const todos = sqliteTable("todos", {
	id: integer("id").primaryKey(),
	listId: integer("list_id"),
	title: text("title").notNull(),
	status: text("status").default('TODO').notNull(),
	createdAt: text("created_at")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: text("updated_at"),
})

export const todosRelations = relations(todos, ({ one }) => ({
	list: one(todos, {
		fields: [todos.listId],
		references: [todos.id]
	})
}))