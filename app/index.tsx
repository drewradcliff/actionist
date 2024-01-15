import { db } from "@/db/client"
import { todos } from "@/db/schema"
import { Feather } from "@expo/vector-icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import { eq } from "drizzle-orm"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"
import { queryClient } from "./_layout"

export default function App() {
	const { data } = useQuery({
		queryKey: ["todos"],
		queryFn: () => db.select().from(todos).all(),
	})

	const { mutate } = useMutation({
		mutationFn: () =>
			db.insert(todos).values({
				title: "hello world",
				status: "TODO",
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
	})

	return (
		<View className="flex-1 bg-white px-4 pt-6">
			<StatusBar style="auto" />
			<View className="flex-row items-center justify-between pb-2">
				<Text className="text-xl">File taxes</Text>
				<Text className="text-gray-500">0%</Text>
			</View>
			{data?.map((todo) => (
				<View key={todo.id} className="pb-4">
					<Todo id={todo.id} title={todo.title} status={todo.status} />
				</View>
			))}
			<Pressable className="w-8 items-center pt-2" onPress={() => mutate()}>
				<Feather name="plus" size={18} color="black" />
			</Pressable>
		</View>
	)
}

function Todo({
	id,
	title,
	status,
}: {
	id: number
	title: string
	status: string
}) {
	const [value, setValue] = useState(title)
	const { mutate } = useMutation({
		mutationFn: () =>
			db
				.update(todos)
				.set({
					status: status === "DONE" ? "TODO" : "DONE",
				})
				.where(eq(todos.id, id)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
	})

	return (
		<View className="flex-row items-center">
			<Checkbox onChange={() => mutate()} checked={status === "DONE"} />
			<Text className="pr-2">{status}</Text>
			<TextInput
				className={`flex-1 ${status === "DONE" && "line-through"}`}
				value={value}
				onChangeText={setValue}
			/>
		</View>
	)
}

function Checkbox({
	onChange,
	checked,
}: {
	onChange?: () => void
	checked?: boolean
}) {
	return (
		<Pressable
			onPress={onChange}
			className="mr-4 h-8 w-8 items-center justify-center bg-gray-200"
		>
			{checked && <Feather name="check" size={16} />}
		</Pressable>
	)
}
