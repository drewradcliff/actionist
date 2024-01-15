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
	const [text, setText] = useState("")
	const { data } = useQuery({
		queryKey: ["todos"],
		queryFn: () => db.select().from(todos).all(),
	})

	const donePercentage = Math.floor(
		((data?.filter(({ status }) => status === "DONE").length ?? 0) /
			(data?.length ?? 1)) *
			100,
	)

	const { mutate } = useMutation({
		mutationFn: () =>
			db.insert(todos).values({
				title: text,
				status: "TODO",
			}),
		onSuccess: () => {
			setText("")
			queryClient.invalidateQueries({ queryKey: ["todos"] })
		},
	})

	return (
		<View className="flex-1 bg-white px-4 pt-6">
			<StatusBar style="auto" />
			<View className="flex-row items-center justify-between pb-6">
				<Text className="text-xl">File taxes</Text>
				<Text className="text-gray-500">{donePercentage}%</Text>
			</View>
			{data?.map(({ id, title, status }) => (
				<View key={id} className="pb-4">
					<Todo id={id} title={title} status={status} />
				</View>
			))}
			<View className="flex-row">
				<TextInput
					placeholder="Add todo"
					className="flex-1 py-1"
					value={text}
					onChangeText={setText}
					onSubmitEditing={() => mutate()}
				/>
			</View>
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

	const { mutate: mutateStatus } = useMutation({
		mutationFn: (status: string) =>
			db
				.update(todos)
				.set({
					status: status,
				})
				.where(eq(todos.id, id)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
	})

	const { mutate: mutateTitle } = useMutation({
		mutationFn: (title: string) =>
			db
				.update(todos)
				.set({
					title: title,
				})
				.where(eq(todos.id, id)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
	})

	return (
		<View className="flex-row items-center">
			<Checkbox
				onChange={() => mutateStatus(status === "DONE" ? "TODO" : "DONE")}
				checked={status === "DONE"}
			/>
			<Pressable
				onPress={() =>
					mutateStatus(
						status === "TODO" ? "DOING" : status === "DOING" ? "DONE" : "TODO",
					)
				}
			>
				<Text className="px-2 py-1">{status}</Text>
			</Pressable>
			<TextInput
				className={`flex-1 ${status === "DONE" && "line-through"}`}
				value={value}
				onChangeText={setValue}
				onBlur={() => mutateTitle(value)}
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
			className="h-8 w-8 items-center justify-center bg-gray-200"
		>
			{checked && <Feather name="check" size={16} />}
		</Pressable>
	)
}
