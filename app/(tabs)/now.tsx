import { getInboxListsWithTodos, selectDoingTodos } from "@/util/focus"
import { useQuery } from "@tanstack/react-query"
import { Stack } from "expo-router"
import { ScrollView, Text, View } from "react-native"

type FocusScale = {
	fontSize: number
	lineHeight: number
	itemPadding: number
	gap: number
}

function getFocusScale(itemCount: number): FocusScale {
	if (itemCount <= 1) {
		return { fontSize: 48, lineHeight: 56, itemPadding: 28, gap: 24 }
	}

	if (itemCount === 2) {
		return { fontSize: 42, lineHeight: 50, itemPadding: 24, gap: 20 }
	}

	if (itemCount <= 4) {
		return { fontSize: 36, lineHeight: 44, itemPadding: 20, gap: 16 }
	}

	if (itemCount <= 7) {
		return { fontSize: 30, lineHeight: 38, itemPadding: 16, gap: 12 }
	}

	return { fontSize: 24, lineHeight: 30, itemPadding: 14, gap: 10 }
}

export default function Now() {
	const { data } = useQuery({
		queryKey: ["lists"],
		queryFn: getInboxListsWithTodos,
	})

	const doingTodos = selectDoingTodos(data)
	const scale = getFocusScale(doingTodos.length)

	return (
		<ScrollView
			contentInsetAdjustmentBehavior="automatic"
			style={{ backgroundColor: "white", flex: 1 }}
			contentContainerStyle={{
				flexGrow: 1,
				gap: scale.gap,
				paddingBottom: 28,
				paddingHorizontal: 16,
				paddingTop: 20,
			}}
		>
			<Stack.Screen options={{ title: "now" }} />
			{!doingTodos.length ? (
				<View
					style={{
						alignItems: "center",
						flex: 1,
						justifyContent: "center",
						paddingVertical: 56,
					}}
				>
					<Text
						selectable
						style={{
							color: "#374151",
							fontSize: 32,
							fontWeight: "600",
							lineHeight: 38,
							textAlign: "center",
						}}
					>
						hey you are caught up chillax
					</Text>
				</View>
			) : (
				doingTodos.map(({ id, title }) => (
					<View
						key={id}
						style={{
							backgroundColor: "#fcf4dd",
							borderCurve: "continuous",
							borderRadius: 20,
							padding: scale.itemPadding,
						}}
					>
						<Text
							selectable
							style={{
								color: "#111827",
								fontSize: scale.fontSize,
								fontWeight: "700",
								lineHeight: scale.lineHeight,
							}}
						>
							{title}
						</Text>
					</View>
				))
			)}
		</ScrollView>
	)
}
