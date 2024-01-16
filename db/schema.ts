import { sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

// export const projects = sqliteTable("projects", {
// 	id: integer("id").primaryKey(),
// 	name: text("name").notNull(),
// 	createdAt: text("created_at")
// 		.default(sql`CURRENT_TIMESTAMP`)
// 		.notNull(),
// 	updatedAt: text("updated_at"),
// })

export const todos = sqliteTable("todos", {
	id: integer("id").primaryKey(),
	// projectId: integer("project_id").references(() => projects.id),
	title: text("title").notNull(),
	status: text("status").notNull(),
	createdAt: text("created_at")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: text("updated_at"),
})
