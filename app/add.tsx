import { db } from "@/db/client"
import { lists } from "@/db/schema"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "expo-router"
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
		onSuccess: () => router.replace("/"),
		onError: (error) => console.log(error),
	})

	return (
		<View className="p-4">
			<View className="flex-row justify-center pb-4">
				<View className="h-1 w-10 rounded bg-gray-300" />
			</View>
			<Text className="pb-4 text-lg">Add New List</Text>
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
