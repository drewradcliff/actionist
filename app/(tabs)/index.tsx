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
	Alert,
	Keyboard,
	KeyboardAvoidingView,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
	type NativeScrollEvent,
} from "react-native"
import { queryClient } from "../_layout"

export default function App() {
	const [closeToBottom, setCloseToBottom] = useState(false)
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

	const { mutate: mutateArchiveAll } = useMutation({
		mutationFn: () =>
			db.update(lists).set({ isArchived: 1 }).where(eq(lists.isArchived, 0)),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["lists"] })
			queryClient.invalidateQueries({ queryKey: ["lists.archive"] })
		},
	})

	const doingTodos = data
		?.map(({ todos }) => todos.filter(({ status }) => status === "DOING"))
		.flat()
	const isCloseToBottom = ({
		layoutMeasurement,
		contentOffset,
		contentSize,
	}: NativeScrollEvent) => {
		return (
			layoutMeasurement.height + contentOffset.y >= contentSize.height + 150
		)
	}

	if (!data?.length)
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<Text className="text-xl font-extralight text-gray-700">
					You're all caught up
				</Text>
			</View>
		)

	return (
		<KeyboardAvoidingView
			behavior="padding"
			className="flex-1"
			keyboardVerticalOffset={100}
		>
			<ScrollView
				onScrollEndDrag={() => {
					if (closeToBottom) {
						Alert.alert("Archive all", "Are you sure?", [
							{
								text: "Cancel",
								style: "cancel",
							},
							{
								text: "OK",
								onPress: () => mutateArchiveAll(),
							},
						])
					}
				}}
				onScroll={({ nativeEvent }) => {
					if (isCloseToBottom(nativeEvent)) {
						setCloseToBottom(true)
					} else {
						setCloseToBottom(false)
					}
				}}
				scrollEventThrottle={10}
				onScrollBeginDrag={() => Keyboard.dismiss()}
				className="bg-white px-4 pt-6"
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
			{closeToBottom && (
				<View className="absolute bottom-0 w-full pb-2">
					<Text className="text-center text-2xl font-bold text-gray-300">
						Pull to archive all
					</Text>
				</View>
			)}
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
						multiline
						maxLength={150}
						className="flex-1 pb-2 text-xl"
						value={listTitle}
						onChangeText={(value) => setListTitle(value)}
						onBlur={() => updateListTitle()}
						onKeyPress={({ nativeEvent }) => {
							if (nativeEvent.key === "Enter") {
								updateListTitle()
							}
						}}
					/>
				) : (
					<Text
						onPress={() => setEditingTitle(true)}
						className="flex-1 pb-2 text-xl"
						numberOfLines={1}
					>
						{title}
					</Text>
				)}
				<Link
					className="pl-2"
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
	const [editingTodo, setEditingTodo] = useState(false)

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
		mutationFn: (title: string) => {
			return db
				.update(todos)
				.set({
					title: title,
				})
				.where(eq(todos.id, id))
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] }),
	})

	const { mutate: deleteTodo } = useMutation({
		mutationFn: () => db.delete(todos).where(eq(todos.id, id)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] }),
	})

	return (
		<View className="flex-row">
			<View className="pr-2">
				<Checkbox
					onChange={() => mutateStatus(status === "DONE" ? "TODO" : "DONE")}
					checked={status === "DONE"}
				/>
			</View>
			{status !== "DONE" && (
				<Pressable
					className="pr-2 pt-1"
					onPress={() => mutateStatus(status === "TODO" ? "DOING" : "TODO")}
				>
					<Text>{status}</Text>
				</Pressable>
			)}
			{!editingTodo ? (
				<Pressable className="flex-1 pt-1" onPress={() => setEditingTodo(true)}>
					<Text
						className={status === "DONE" ? "line-through" : ""}
						numberOfLines={1}
					>
						{title}
					</Text>
				</Pressable>
			) : (
				<TextInput
					autoFocus
					maxLength={150}
					multiline
					className="flex-1 pt-1"
					value={value}
					onChangeText={setValue}
					onBlur={() => {
						if (value === "") {
							deleteTodo()
						} else {
							mutateTitle(value)
						}
						setEditingTodo(false)
					}}
					onKeyPress={({ nativeEvent }) => {
						if (nativeEvent.key === "Backspace" && value === "") {
							deleteTodo()
						}
						if (nativeEvent.key === "Enter") {
							mutateTitle(value)
							setEditingTodo(false)
						}
					}}
				/>
			)}
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
			className="h-7 w-7 items-center justify-center bg-gray-200"
		>
			{checked && <Feather name="check" size={16} />}
		</Pressable>
	)
}
