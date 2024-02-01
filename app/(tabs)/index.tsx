import ProgressBar from "@/components/progress-bar"
import { db } from "@/db/client"
import { todos, type SelectTodos } from "@/db/schema"
import { Feather, Ionicons } from "@expo/vector-icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import { eq } from "drizzle-orm"
import { Link } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
	Keyboard,
	KeyboardAvoidingView,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native"
import { queryClient } from "../_layout"

export default function App() {
	const { data } = useQuery({
		queryKey: ["lists"],
		queryFn: () =>
			db.query.lists.findMany({
				where: (lists, { eq }) => eq(lists.isArchived, 0),
				with: {
					todos: true,
				},
			}),
	})

	const doingTodos = data
		?.map(({ todos }) => todos.filter(({ status }) => status === "DOING"))
		.flat()

	return (
		<KeyboardAvoidingView
			behavior="padding"
			className="flex-1"
			keyboardVerticalOffset={100}
		>
			<ScrollView
				onScrollBeginDrag={() => Keyboard.dismiss()}
				className="bg-white px-4 pt-6"
			>
				<StatusBar style="auto" />
				{!!doingTodos?.length && (
					<View className="pb-12">
						<Text className="pb-4 text-xl">✨ Focus ✨</Text>
						<TodoList todoData={doingTodos ?? []} />
					</View>
				)}
				{data?.map(({ id, title, todos }) => (
					<View key={id} className="pb-12">
						<View className="flex-row justify-between">
							<Text className="pb-2 text-xl">{title}</Text>
							<Link
								href={{
									pathname: "/modal/[id, archive]",
									params: { id, archive: 1 },
								}}
							>
								<Ionicons name="ellipsis-horizontal" size={24} color="black" />
							</Link>
						</View>
						<TodoWrapper todos={todos} id={id} />
					</View>
				))}
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

function TodoWrapper({
	todos: todosData,
	id,
}: {
	todos: SelectTodos[]
	id: number
}) {
	const [text, setText] = useState("")

	const { mutate } = useMutation({
		mutationFn: () =>
			db.insert(todos).values({
				title: text,
				status: "TODO",
				listId: id,
			}),
		onSuccess: () => {
			setText("")
			queryClient.invalidateQueries({ queryKey: ["lists"] })
		},
	})

	return (
		<View>
			<ProgressBar todos={todosData} />
			<TodoList todoData={todosData} />
			<View className="flex-row">
				<TextInput
					placeholder="Add todo"
					className="flex-1 py-1"
					value={text}
					onChangeText={setText}
					onSubmitEditing={() => {
						if (text) mutate()
					}}
				/>
			</View>
		</View>
	)
}

function TodoList({ todoData }: { todoData: SelectTodos[]; icon?: any }) {
	return (
		<View>
			{todoData.map(({ id, title, status }) => (
				<View key={id} className="pb-4">
					<Todo id={id} title={title} status={status} />
				</View>
			))}
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
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] }),
	})

	const { mutate: mutateTitle } = useMutation({
		mutationFn: (title: string) =>
			db
				.update(todos)
				.set({
					title: title,
				})
				.where(eq(todos.id, id)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] }),
	})

	const { mutate: deleteTodo } = useMutation({
		mutationFn: () => db.delete(todos).where(eq(todos.id, id)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] }),
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
				onBlur={() => (value === "" ? deleteTodo() : mutateTitle(value))}
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
