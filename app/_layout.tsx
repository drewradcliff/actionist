import { db } from "@/db/client"
import migrations from "@/drizzle/migrations"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import { Stack } from "expo-router"

export const queryClient = new QueryClient()

export default function Layout() {
	const { success, error } = useMigrations(db, migrations)
	if (!success || error) {
		return null
	}

	return (
		<QueryClientProvider client={queryClient}>
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
		</QueryClientProvider>
	)
}
