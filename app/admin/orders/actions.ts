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

export async function updateOrderDetails(id: string, formData: FormData) {
  const customer_name = (formData.get("customer_name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const address = (formData.get("address") as string) || "";
  const wrist_inches = Number(formData.get("wrist_inches")) || 7.0;
  const status = (formData.get("status") as string) || "draft";

  const { error } = await getSupabaseAdmin()
    .from("bracelets")
    .update({
      customer_name,
      email,
      phone,
      address,
      wrist_inches,
      status,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}
