import { Stack } from "expo-router"
import { View } from "react-native"

export default function EditNote() {
	return (
		<View className="m-4 gap-y-4">
			<Stack.Screen
				options={{
					title: "archive",
				}}
			/>
		</View>
	)
}
