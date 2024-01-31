import { db } from "@/db/client"
import { lists, todos } from "@/db/schema"
import { useMutation } from "@tanstack/react-query"
import clsx from "clsx"
import { eq } from "drizzle-orm"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Pressable, Text, View } from "react-native"

export default function Modal() {
	const local = useLocalSearchParams<{ id: string }>()
	const router = useRouter()

	const { mutate: mutateDelete } = useMutation({
		mutationFn: async () => {
			await db.delete(lists).where(eq(lists.id, Number(local.id)))
			await db.delete(todos).where(eq(todos.listId, Number(local.id)))
		},
		onSuccess: () => router.replace("/(tabs)/"),
	})

	const { mutate: mutateArchive } = useMutation({
		mutationFn: () =>
			db
				.update(lists)
				.set({ isArchived: 1 })
				.where(eq(lists.id, Number(local.id))),
		onSuccess: () => router.replace("/(tabs)/"),
	})

	return (
		<View className="p-4">
			<Pressable onPress={() => mutateArchive()}>
				{({ pressed }) => (
					<View
						className={clsx(
							"rounded-t-xl border-b border-gray-300  py-4 pl-4",
							pressed ? "bg-gray-300" : "bg-gray-200",
						)}
					>
						<Text className="font-bold">Archive</Text>
					</View>
				)}
			</Pressable>
			<Pressable onPress={() => mutateDelete()}>
				{({ pressed }) => (
					<View
						className={clsx(
							"rounded-b-xl border-gray-300  py-4 pl-4",
							pressed ? "bg-gray-300" : "bg-gray-200",
						)}
					>
						<Text className="font-bold text-red-500">Delete</Text>
					</View>
				)}
			</Pressable>
		</View>
	)
}
