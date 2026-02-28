import { db } from "@/db/client"
import { type SelectTodos } from "@/db/schema"

type InboxListWithTodos = {
	todos: SelectTodos[]
}

export function getInboxListsWithTodos() {
	return db.query.lists.findMany({
		where: (lists, { eq }) => eq(lists.isArchived, 0),
		with: {
			todos: true,
		},
		orderBy: (lists, { desc }) => [desc(lists.createdAt)],
	})
}

export function selectDoingTodos(
	listsData: InboxListWithTodos[] | undefined,
): SelectTodos[] {
	if (!listsData?.length) {
		return []
	}

	return listsData
		.map(({ todos }) => todos.filter(({ status }) => status === "DOING"))
		.flat()
}
