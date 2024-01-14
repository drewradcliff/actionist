import { Feather } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"

export default function App() {
	const [checked, setChecked] = useState(false)

	return (
		<View className="flex-1 bg-white px-4 pt-6">
			<StatusBar style="auto" />
			<View className="flex-row items-center justify-between pb-2">
				<Text className="text-xl">File taxes</Text>
				<Text className="text-gray-500">0%</Text>
			</View>
			<View className="flex-row items-center">
				<Checkbox onChange={() => setChecked(!checked)} checked={checked} />
				<Text className="pr-2">{checked ? "DONE" : "TODO"}</Text>
				<TextInput
					className={`flex-1 ${checked && "line-through"}`}
					value="todo 1"
				/>
			</View>
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
