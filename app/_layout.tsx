import { useLoadAssets } from "@/hooks/use-load-assets"
import "@/styles/global.css"
import { Tabs } from "expo-router"

export default function RootLayout() {
	const { isLoaded } = useLoadAssets()
	if (!isLoaded) return null
	return <RootLayoutNavigation />
}

function RootLayoutNavigation() {
	return (
		<Tabs>
			<Tabs.Screen
				name="index"
				options={{
					title: "active",
				}}
			/>
			<Tabs.Screen name="archive" />
		</Tabs>
	)
}
