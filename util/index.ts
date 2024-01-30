import { expoDb } from "@/db/client"

export async function runQuery() {
  await expoDb.runAsync("DROP TABLE IF EXISTS todos")
  await expoDb.runAsync("DROP TABLE IF EXISTS lists")
  const todos = await expoDb.getAllAsync("SELECT * FROM todos")
  const lists = await expoDb.getAllAsync("SELECT * FROM lists")
  console.log(todos, lists)
}