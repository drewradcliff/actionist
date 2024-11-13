import type { SelectTodos } from "@/db/schema"
import clsx from "clsx"
import { Text, View } from "react-native"

export default function ProgressBar({ todos }: { todos: SelectTodos[] }) {
	const todosDone = todos.filter(({ status }) => status === "DONE").length ?? 0
	const donePercentage = Math.floor((todosDone / (todos.length || 1)) * 100)

	return (
		<View className="flex-row items-center justify-between pb-4">
			<View className="h-2 flex-1 bg-gray-50">
				<View
					className={clsx("h-2", {
						"bg-[#e4e8ee]": donePercentage <= 25,
						"bg-[#d7e3fc]": donePercentage > 25 && donePercentage <= 50,
						"bg-[#ccdbfd]": donePercentage > 50 && donePercentage <= 75,
						"bg-[#c1d3fe]": donePercentage > 75 && donePercentage < 100,
						"bg-[#abc4ff]": donePercentage === 100,
					})}
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
