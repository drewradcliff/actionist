import { db } from "@/db/client"
import { lists, todos } from "@/db/schema"
import { useMutation } from "@tanstack/react-query"
import clsx from "clsx"
import { eq } from "drizzle-orm"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Pressable, Text, View } from "react-native"

export default function Modal() {
	const local = useLocalSearchParams<{ id: string; archive: string }>()
	const router = useRouter()
	const isArchived = Number(local.archive)
	const id = Number(local.id)

	const { mutate: mutateDelete } = useMutation({
		mutationFn: async () => {
			await db.delete(lists).where(eq(lists.id, id))
			await db.delete(todos).where(eq(todos.listId, id))
		},
		onSuccess: () => router.replace(isArchived ? "/" : "/archive"),
	})

	const { mutate: mutateArchive } = useMutation({
		mutationFn: () =>
			db.update(lists).set({ isArchived }).where(eq(lists.id, id)),
		onSuccess: () => router.replace(isArchived ? "/" : "/archive"),
	})

	return (
		<View className="flex-1 bg-white p-4">
			<View className="flex-row justify-center pb-4">
				<View className="h-1 w-10 rounded bg-gray-300" />
			</View>
			<Pressable onPress={() => mutateArchive()}>
				{({ pressed }) => (
					<View
						className={clsx(
							"rounded-t-xl border-b border-gray-300  py-4 pl-4",
							pressed ? "bg-gray-200" : "bg-gray-100",
						)}
					>
						<Text>{isArchived ? "Archive" : "Unarchive"}</Text>
					</View>
				)}
			</Pressable>
			<Pressable onPress={() => mutateDelete()}>
				{({ pressed }) => (
					<View
						className={clsx(
							"rounded-b-xl border-gray-300  py-4 pl-4",
							pressed ? "bg-gray-200" : "bg-gray-100",
						)}
					>
						<Text className="text-red-500">Delete</Text>
					</View>
				)}
			</Pressable>
		</View>
	)
}
