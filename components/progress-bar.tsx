import type { SelectTodos } from "@/db/schema"
import { Text, View } from "react-native"

export default function ProgressBar({ todos }: { todos: SelectTodos[] }) {
	const todosDone = todos.filter(({ status }) => status === "DONE").length ?? 0
	const donePercentage = Math.floor((todosDone / (todos.length || 1)) * 100)

	return (
		<View className="flex-row items-center justify-between pb-4">
			<View className="h-2 flex-1 bg-gray-100">
				<View
					className={"h-2 bg-gray-500"}
					style={{
						width: `${donePercentage}%`,
					}}
				/>
			</View>
			<Text className="pl-4 text-gray-500">
				{`${todosDone}/${todos.length ?? 0}`}
			</Text>
		</View>
	)
}
