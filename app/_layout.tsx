import { useLoadAssets } from "@/hooks/use-load-assets"
import "@/styles/global.css"
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Stack } from "expo-router"
import { useColorScheme } from "nativewind"

export const queryClient = new QueryClient()

export default function Layout() {
	const { isLoaded } = useLoadAssets()
	const { colorScheme } = useColorScheme()

	if (!isLoaded) {
		return null
	}

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider value={colorScheme === "light" ? DefaultTheme : DarkTheme}>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen
						name="add"
						options={{
							presentation: "modal",
						}}
					/>
					<Stack.Screen
						name="modal/[id, archive]"
						options={{
							presentation: "modal",
						}}
					/>
				</Stack>
			</ThemeProvider>
		</QueryClientProvider>
	)
}
