import ProgressBar from "@/components/progress-bar"
import { db } from "@/db/client"
import { lists, todos, type SelectTodos } from "@/db/schema"
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
				className="bg-white px-4 pt-6 dark:bg-zinc-950"
			>
				<StatusBar style="auto" />
				{!!doingTodos?.length && (
					<View className="pb-12">
						<Text className="pb-4 text-xl">✨ Focus ✨</Text>
						<Todos todoData={doingTodos ?? []} />
					</View>
				)}
				{data?.map(({ id, title, todos }) => (
					<View key={id} className="pb-12">
						<List todos={todos} id={id} title={title} />
					</View>
				))}
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

function List({
	todos: todosData,
	id,
	title,
}: {
	todos: SelectTodos[]
	id: number
	title: string
}) {
	const [listTitle, setListTitle] = useState(title)
	const [addTodoText, setTodoText] = useState("")
	const [editingTitle, setEditingTitle] = useState(false)

	const { mutate: addTodo } = useMutation({
		mutationFn: () =>
			db.insert(todos).values({
				title: addTodoText,
				status: "TODO",
				listId: id,
			}),
		onSuccess: () => {
			setTodoText("")
			queryClient.invalidateQueries({ queryKey: ["lists"] })
		},
	})

	const { mutate: updateListTitle } = useMutation({
		mutationFn: () => {
			setEditingTitle(false)
			return db.update(lists).set({ title: listTitle }).where(eq(lists.id, id))
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] }),
	})

	return (
		<View>
			<View className="flex-row justify-between">
				{editingTitle ? (
					<TextInput
						autoFocus
						className="flex-1 pb-2 text-xl"
						value={listTitle}
						onChangeText={(value) => setListTitle(value)}
						onSubmitEditing={() => updateListTitle()}
						onBlur={() => updateListTitle()}
					/>
				) : (
					<Text
						onPress={() => setEditingTitle(true)}
						className="flex-1 pb-2 text-xl"
					>
						{title}
					</Text>
				)}
				<Link
					href={{
						pathname: "/modal/[id, archive]",
						params: { id, archive: 1 },
					}}
				>
					<Ionicons name="ellipsis-horizontal" size={24} color="black" />
				</Link>
			</View>
			<ProgressBar todos={todosData} />
			<Todos todoData={todosData} />
			<View className="flex-row">
				<TextInput
					placeholder="Add todo"
					className="flex-1 py-1"
					value={addTodoText}
					onChangeText={setTodoText}
					blurOnSubmit={false}
					onSubmitEditing={() => {
						if (addTodoText) addTodo()
					}}
				/>
			</View>
		</View>
	)
}

function Todos({ todoData }: { todoData: SelectTodos[]; icon?: any }) {
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
				onKeyPress={({ nativeEvent }) => {
					if (nativeEvent.key === "Backspace" && value === "") {
						deleteTodo()
					}
				}}
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
