import { db } from "@/db/client"
import { lists, todos } from "@/db/schema"
import { Feather } from "@expo/vector-icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import { eq } from "drizzle-orm"
import { Link, Tabs } from "expo-router"
import { Alert, Pressable } from "react-native"
import { queryClient } from "../_layout"

export default function Layout() {
	const { data } = useQuery({
		queryKey: ["lists.archive"],
		queryFn: () =>
			db.query.lists.findMany({
				where: (lists, { eq }) => eq(lists.isArchived, 1),
			}),
	})

	const { mutate: mutateDeleteAll } = useMutation({
		mutationFn: async () => {
			const deletedLists = await db
				.delete(lists)
				.where(eq(lists.isArchived, 1))
				.returning()
			deletedLists.forEach(async (list) => {
				await db.delete(todos).where(eq(todos.listId, list.id))
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["lists.archive"] })
		},
	})

	return (
		<Tabs screenOptions={{ tabBarShowLabel: false }}>
			<Tabs.Screen
				name="index"
				options={{
					title: "todo",
					tabBarIcon: ({ focused }) => (
						<Feather name="home" size={24} color={focused ? "black" : "gray"} />
					),
					headerRight: () => (
						<Link href="/add" asChild>
							<Feather className="pr-4" name="plus" size={24} color="black" />
						</Link>
					),
				}}
			/>
			<Tabs.Screen
				name="archive"
				options={{
					title: "archive",
					tabBarIcon: ({ focused }) => (
						<Feather
							name="archive"
							size={24}
							color={focused ? "black" : "gray"}
						/>
					),
					headerRight: () => (
						<Pressable
							onPress={() => {
								if (data?.length) {
									Alert.alert("Delete all", "Are you sure?", [
										{
											text: "Cancel",
											style: "cancel",
										},
										{
											text: "OK",
											onPress: () => mutateDeleteAll(),
										},
									])
								}
							}}
						>
							<Feather className="pr-4" name="trash" size={20} color="black" />
						</Pressable>
					),
				}}
			/>
		</Tabs>
	)
}
