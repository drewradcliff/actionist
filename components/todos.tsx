import { queryClient } from "@/app/_layout"
import { db } from "@/db/client"
import { todos, type SelectTodos } from "@/db/schema"
import { Feather } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import clsx from "clsx"
import { eq } from "drizzle-orm"
import { useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"
import colors from "tailwindcss/colors"

export function Todos({
	todoData,
	disabled,
}: {
	todoData: SelectTodos[]
	disabled?: boolean
}) {
	return (
		<View>
			{todoData?.map(({ id, title, status }) => (
				<View key={id} className="pb-2">
					<Todo id={id} title={title} status={status} disabled={disabled} />
				</View>
			))}
		</View>
	)
}

function Todo({
	id,
	title,
	status,
	disabled,
}: {
	id: number
	title: string
	status: string
	disabled?: boolean
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
		<View
			className={clsx(
				"flex-row p-2",
				status === "DOING" && "rounded-md bg-yellow-100",
			)}
		>
			<View pointerEvents={disabled ? "none" : "auto"} className="pr-2">
				<Checkbox
					onChange={() => mutateStatus(status === "DONE" ? "TODO" : "DONE")}
					checked={status === "DONE"}
					disabled={disabled}
				/>
			</View>
			{status !== "DONE" && (
				<Pressable
					disabled={disabled}
					className="pr-2 pt-1"
					onPress={() => mutateStatus(status === "TODO" ? "DOING" : "TODO")}
				>
					<Text className={disabled ? "text-gray-500" : ""}>{status}</Text>
				</Pressable>
			)}
			{!editingTodo ? (
				<Pressable
					disabled={disabled}
					className="flex-1 pt-1"
					onPress={() => setEditingTodo(true)}
				>
					<Text
						className={clsx(
							{ "line-through": status === "DONE" },
							{ "text-gray-500": disabled },
						)}
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
	disabled,
}: {
	onChange?: () => void
	checked?: boolean
	disabled?: boolean
}) {
	return (
		<Pressable
			disabled={disabled}
			onPress={onChange}
			className="h-7 w-7 items-center justify-center bg-gray-200"
			hitSlop={8}
		>
			{checked && (
				<Feather
					color={disabled ? colors.gray[500] : colors.black}
					name="check"
					size={16}
				/>
			)}
		</Pressable>
	)
}
