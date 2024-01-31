import { db } from "@/db/client"
import { useQuery } from "@tanstack/react-query"
import { Stack } from "expo-router"
import { Text, View } from "react-native"

export default function Archive() {
	const { data } = useQuery({
		queryKey: ["lists.archive"],
		queryFn: () =>
			db.query.lists.findMany({
				where: (lists, { eq }) => eq(lists.isArchived, 1),
			}),
	})

	return (
		<View className="m-4 gap-y-4">
			<Stack.Screen
				options={{
					title: "archive",
				}}
			/>
			{data?.map(({ id, title }) => (
				<View key={id} className="rounded-xl bg-gray-200 p-4">
					<Text>{title}</Text>
				</View>
			))}
		</View>
	)
}
