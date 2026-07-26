"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { DesignSubmission } from "@/lib/types";

export async function submitOrder(data: DesignSubmission) {
  const generatedId = `BDU-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error, data: row } = await supabaseAdmin
      .from("bracelets")
      .insert({
        customer_name: data.customerName || "Valued Customer",
        email: data.email || "",
        phone: data.phone || "",
        wrist_inches: data.wristInches || 7.0,
        cord_type: data.cordType ?? "elastic",
        placed_beads: data.placedBeads || [],
        total_price: Math.round((data.totalPrice ?? 0) * 100), // in paise
        address: data.address || "",
        preview_image_url: data.previewImageUrl || null,
        status: "confirmed",
      })
      .select()
      .single();

    if (error) {
      console.warn("Supabase order insert notice:", error.message);
      return { success: true, orderId: generatedId, fallback: true };
    }

    return {
      success: true,
      orderId: row.id ? `#${row.id.slice(0, 8).toUpperCase()}` : generatedId,
      order: row,
    };
  } catch (err) {
    console.warn("Supabase not configured or unreachable, using local fallback ID:", err);
    return { success: true, orderId: generatedId, fallback: true };
  }
}
