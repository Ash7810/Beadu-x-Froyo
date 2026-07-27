"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function addBead(formData: FormData) {
  const id = (formData.get("id") as string)?.trim();
  if (!id) throw new Error("Bead ID is required");

  const { error } = await getSupabaseAdmin()
    .from("beads")
    .insert({
      id,
      name: (formData.get("name") as string) || "Untitled Bead",
      category: (formData.get("category") as string) || "crystal",
      price: Number(formData.get("price")) || 0,
      material: (formData.get("material") as string) || "",
      image_url: (formData.get("image_url") as string) || "",
      is_premium: formData.get("is_premium") === "true",
      rotation_allowed: formData.get("rotation_allowed") === "true",
      size: Number(formData.get("size")) || 1,
      size_mm: Number(formData.get("size_mm")) || 8,
      width_mm: Number(formData.get("width_mm")) || 8,
      active: formData.get("active") !== "false",
    });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/beads");
}

export async function updateBead(id: string, formData: FormData) {
  const { error } = await getSupabaseAdmin()
    .from("beads")
    .update({
      name: (formData.get("name") as string) || "Untitled Bead",
      category: (formData.get("category") as string) || "crystal",
      price: Number(formData.get("price")) || 0,
      material: (formData.get("material") as string) || "",
      image_url: (formData.get("image_url") as string) || "",
      is_premium: formData.get("is_premium") === "true",
      rotation_allowed: formData.get("rotation_allowed") === "true",
      size: Number(formData.get("size")) || 1,
      size_mm: Number(formData.get("size_mm")) || 8,
      width_mm: Number(formData.get("width_mm")) || 8,
      active: formData.get("active") !== "false",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/beads");
}

export async function deleteBead(id: string) {
  const { error } = await getSupabaseAdmin()
    .from("beads")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/beads");
}
