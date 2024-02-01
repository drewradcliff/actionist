import { db } from "@/db/client"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { Link, Stack } from "expo-router"
import { ScrollView, Text, View } from "react-native"

export default function Archive() {
	const { data } = useQuery({
		queryKey: ["lists.archive"],
		queryFn: () =>
			db.query.lists.findMany({
				where: (lists, { eq }) => eq(lists.isArchived, 1),
			}),
	})

	return (
		<ScrollView className="flex-1 gap-y-4 bg-white p-4">
			<Stack.Screen
				options={{
					title: "archive",
				}}
			/>
			{data?.map(({ id, title }) => (
				<View
					key={id}
					className="flex-row items-center justify-between rounded-xl bg-gray-200 p-4"
				>
					<Text>{title}</Text>
					<Link
						href={{
							pathname: "/modal/[id, archive]",
							params: { id, archive: 0 },
						}}
					>
						<Ionicons name="ellipsis-horizontal" size={24} color="black" />
					</Link>
				</View>
			))}
		</ScrollView>
	)
}
