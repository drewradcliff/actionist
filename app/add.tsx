import { db } from "@/db/client"
import { lists } from "@/db/schema"
import { Feather } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import { Link, useRouter } from "expo-router"
import { useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"

export default function Add() {
	const [text, setText] = useState("")
	const router = useRouter()

	const { mutate } = useMutation({
		mutationFn: () =>
			db.insert(lists).values({
				title: text,
			}),
		onSuccess: () => router.replace("/(tabs)/"),
	})

	return (
		<View className="p-4">
			<View className="flex-row justify-between">
				<Text className="pb-4 text-lg">Add New List</Text>
				<Link href="/(tabs)/" asChild>
					<Feather name="x" size={24} color="black" />
				</Link>
			</View>
			<TextInput
				className="order-gray-300 pb-8"
				placeholder="List Name"
				value={text}
				onChangeText={setText}
			/>
			<Pressable
				onPress={() => mutate()}
				className="rounded-xl bg-gray-700 py-4"
			>
				<Text className="text-center text-white">Create</Text>
			</Pressable>
		</View>
	)
}
