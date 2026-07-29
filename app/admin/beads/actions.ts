"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";

// Revalidate all paths that serve bead data
function revalidateBeadPaths() {
  revalidatePath("/api/beads");
  revalidatePath("/admin/beads");
  revalidatePath("/builder");
  revalidatePath("/", "layout"); // clears any layout-level cache too
}

export async function addBead(formData: FormData) {
  const id = (formData.get("id") as string)?.trim();
  if (!id) throw new Error("Bead ID is required");

  const sizeMm = Number(formData.get("size_mm")) || 8;
  const widthMm = Number(formData.get("width_mm")) || sizeMm || 8;
  const relativeSize = Number((widthMm / 8).toFixed(2));

  try {
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
        size: relativeSize,
        size_mm: sizeMm,
        width_mm: widthMm,
        active: formData.get("active") !== "false",
      });

    if (error) {
      console.warn("Supabase insert warning:", error.message);
    }
  } catch (e: any) {
    console.warn("Supabase connection error in addBead:", e?.message || e);
  }

  revalidateBeadPaths();
}

export async function updateBead(id: string, formData: FormData) {
  const sizeMm = Number(formData.get("size_mm")) || 8;
  const widthMm = Number(formData.get("width_mm")) || sizeMm || 8;
  const relativeSize = Number((widthMm / 8).toFixed(2));

  try {
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
        size: relativeSize,
        size_mm: sizeMm,
        width_mm: widthMm,
        active: formData.get("active") !== "false",
      })
      .eq("id", id);

    if (error) {
      console.warn("Supabase update warning:", error.message);
    }
  } catch (e: any) {
    console.warn("Supabase connection error in updateBead:", e?.message || e);
  }

  revalidateBeadPaths();
}

export async function deleteBead(id: string) {
  try {
    const { error } = await getSupabaseAdmin()
      .from("beads")
      .delete()
      .eq("id", id);

    if (error) {
      console.warn("Supabase delete warning:", error.message);
    }
  } catch (e: any) {
    console.warn("Supabase connection error in deleteBead:", e?.message || e);
  }

  revalidateBeadPaths();
}
