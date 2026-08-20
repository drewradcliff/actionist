import { db } from "@/db/client"
import migrations from "@/drizzle/migrations"
import "@/styles/global.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { migrate } from "drizzle-orm/expo-sqlite/migrator"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useCallback, useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

export { ErrorBoundary } from "expo-router"

export const queryClient = new QueryClient()

void SplashScreen.preventAutoHideAsync().catch((error) => {
	console.warn("Could not keep the splash screen visible", error)
})

type MigrationState =
	| { status: "migrating" }
	| { status: "ready" }
	| { status: "error"; error: Error }

let migrationPromise: Promise<void> | undefined

function runMigrations() {
	if (!migrationPromise) {
		migrationPromise = migrate(db, migrations)
			.then(() => undefined)
			.catch((error: unknown) => {
				migrationPromise = undefined
				throw error
			})
	}

	return migrationPromise
}

function toError(error: unknown) {
	return error instanceof Error ? error : new Error(String(error))
}

function useDatabaseMigrations() {
	const [attempt, setAttempt] = useState(0)
	const [state, setState] = useState<MigrationState>({ status: "migrating" })

	useEffect(() => {
		let isActive = true

		setState({ status: "migrating" })
		runMigrations().then(
			() => {
				if (isActive) setState({ status: "ready" })
			},
			(error: unknown) => {
				const migrationError = toError(error)
				console.error("Database migration failed", migrationError)
				if (isActive) setState({ status: "error", error: migrationError })
			},
		)

		return () => {
			isActive = false
		}
	}, [attempt])

	const retry = useCallback(() => setAttempt((current) => current + 1), [])

	return { state, retry }
}

export default function Layout() {
	const { state, retry } = useDatabaseMigrations()

	useEffect(() => {
		if (state.status !== "migrating") {
			void SplashScreen.hideAsync().catch((error) => {
				console.warn("Could not hide the splash screen", error)
			})
		}
	}, [state.status])

	if (state.status === "migrating") {
		return null
	}

	if (state.status === "error") {
		return <MigrationError error={state.error} onRetry={retry} />
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

function MigrationError({
	error,
	onRetry,
}: {
	error: Error
	onRetry: () => void
}) {
	return (
		<View style={styles.errorContainer}>
			<Text style={styles.errorTitle}>
				Actionist couldn&apos;t finish opening
			</Text>
			<Text style={styles.errorMessage}>
				Your tasks are safe. Try opening the database again.
			</Text>
			{__DEV__ && <Text style={styles.errorDetails}>{error.message}</Text>}
			<Pressable
				accessibilityRole="button"
				onPress={onRetry}
				style={({ pressed }) => [
					styles.retryButton,
					pressed && styles.retryButtonPressed,
				]}
			>
				<Text style={styles.retryButtonText}>Try again</Text>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	errorContainer: {
		alignItems: "center",
		backgroundColor: "white",
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 32,
	},
	errorDetails: {
		color: "#6b7280",
		fontSize: 12,
		marginTop: 16,
		textAlign: "center",
	},
	errorMessage: {
		color: "#4b5563",
		fontSize: 16,
		lineHeight: 24,
		marginTop: 8,
		textAlign: "center",
	},
	errorTitle: {
		color: "#111827",
		fontSize: 22,
		fontWeight: "600",
		textAlign: "center",
	},
	retryButton: {
		backgroundColor: "#111827",
		borderRadius: 10,
		marginTop: 24,
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	retryButtonPressed: {
		opacity: 0.75,
	},
	retryButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
})
