import { useLoadAssets } from "@/hooks/use-load-assets"
import "@/styles/global.css"
import { Feather } from "@expo/vector-icons"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Tabs } from "expo-router"

export const queryClient = new QueryClient()

export default function RootLayout() {
	const { isLoaded } = useLoadAssets()
	if (!isLoaded) return null
	return <RootLayoutNavigation />
}

function RootLayoutNavigation() {
	return (
		<QueryClientProvider client={queryClient}>
			<Tabs screenOptions={{ tabBarShowLabel: false }}>
				<Tabs.Screen
					name="index"
					options={{
						title: "todo",
						tabBarIcon: ({ focused }) => (
							<Feather
								name="home"
								size={24}
								color={focused ? "black" : "gray"}
							/>
						),
						headerRight: () => (
							<Feather className="pr-4" name="plus" size={24} color="black" />
						),
					}}
				/>
				<Tabs.Screen
					name="archive"
					options={{
						title: "archive",
						tabBarIcon: ({ focused }) => (
							<Feather
								name="archive"
								size={24}
								color={focused ? "black" : "gray"}
							/>
						),
					}}
				/>
			</Tabs>
		</QueryClientProvider>
	)
}
