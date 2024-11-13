import ProgressBar from "@/components/progress-bar"
import { Todos } from "@/components/todos"
import { db } from "@/db/client"
import { lists, todos, type SelectTodos } from "@/db/schema"
import { Ionicons } from "@expo/vector-icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import { eq } from "drizzle-orm"
import { Link } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
	Alert,
	Keyboard,
	KeyboardAvoidingView,
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
				orderBy: (lists, { desc }) => [desc(lists.createdAt)],
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
		if (contentSize.height < layoutMeasurement.height) {
			return contentOffset.y > 100
		}
		return (
			layoutMeasurement.height + contentOffset.y >= contentSize.height + 100
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
