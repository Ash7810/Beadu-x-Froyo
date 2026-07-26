"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function deleteOrder(id: string) {
  const { error } = await getSupabaseAdmin()
    .from("bracelets")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await getSupabaseAdmin()
    .from("bracelets")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}
