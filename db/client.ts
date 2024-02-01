import { drizzle } from "drizzle-orm/expo-sqlite"
import * as schema from './schema';
import { openDatabaseSync } from "expo-sqlite/next"

export const expoDb = openDatabaseSync("db.db")

export const db = drizzle(expoDb, { schema })
