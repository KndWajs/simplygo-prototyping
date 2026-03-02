"use server"

import { revalidatePath } from "next/cache"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function revalidateActivity(id: string) {
  revalidatePath("/wydarzenia/[city]/[type]/[kind]/[slug]", "page")
  revalidatePath("/wydarzenia/[city]/[type]", "page")
  revalidatePath("/wydarzenia")
}
