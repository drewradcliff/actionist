import { Todos } from "@/components/todos"
import { db } from "@/db/client"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { Link, Stack } from "expo-router"
import { useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"

export default function Archive() {
	const [selectedList, setSelectedList] = useState<number | null>(null)
	const { data } = useQuery({
		queryKey: ["lists.archive"],
		queryFn: () =>
			db.query.lists.findMany({
				where: (lists, { eq }) => eq(lists.isArchived, 1),
				with: {
					todos: true,
				},
			}),
	})

	return (
		<ScrollView className="flex-1 bg-white p-4">
			<Stack.Screen
				options={{
					title: "archive",
				}}
			/>
			{data?.map(({ id, title, todos }) => (
				<Pressable
					key={id}
					className="mb-4 gap-4 rounded-xl bg-gray-100 p-4"
					onPress={() => setSelectedList((prev) => (prev === id ? null : id))}
				>
					<View key={id} className="flex-row items-center justify-between">
						<Text className="flex-1" numberOfLines={1}>
							{title}
						</Text>
						<Link
							className="pl-2"
							href={{
								pathname: "/modal/[id, archive]",
								params: { id, archive: 0 },
							}}
						>
							<Ionicons name="ellipsis-horizontal" size={24} color="black" />
						</Link>
					</View>
					{selectedList === id && <Todos todoData={todos} disabled />}
				</Pressable>
			))}
		</ScrollView>
	)
}
