import { Feather } from "@expo/vector-icons"
import { Link } from "expo-router"
import { useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"

export default function Add() {
	const [text, setText] = useState("")

	// const { mutate } = useMutation({
	//   mutationFn: () =>
	// })

	return (
		<View className="p-4">
			<View className="flex-row justify-between">
				<Text className="pb-4 text-lg">Add New Project</Text>
				<Link href="/(tabs)/" asChild>
					<Feather name="x" size={24} color="black" />
				</Link>
			</View>
			<TextInput
				className="order-gray-300 pb-8"
				placeholder="Project Name"
				value={text}
				onChangeText={setText}
			/>
			<Pressable className="rounded-xl bg-gray-700 py-4">
				<Text className="text-center text-white">Create</Text>
			</Pressable>
		</View>
	)
}
