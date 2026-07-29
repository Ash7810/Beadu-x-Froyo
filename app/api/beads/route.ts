import { NextResponse } from "next/server";
import { INITIAL_BEADS } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * GET /api/beads
 * Serves the live bead catalog.
 * If admin has added custom beads via Supabase, those are merged on top.
 * Falls back to catalog.ts if DB is unavailable.
 */
export async function GET() {
  try {
    // Try to load any admin-added beads from Supabase on top of catalog
    const { getSupabaseAdmin } = await import("@/lib/supabase");
    const { data } = await getSupabaseAdmin()
      .from("beads")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      // Merge: admin DB beads take precedence, then catalog fills the rest
      const dbIds = new Set(data.map((r: any) => r.id));
      const catalogOnly = INITIAL_BEADS.filter((b) => !dbIds.has(b.id));

      const dbBeads = data.map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        price: r.price,
        material: r.material || "",
        imageUrl: r.image_url || "",
        isPremium: r.is_premium,
        rotationAllowed: r.rotation_allowed,
        size: r.size || (r.width_mm ? Number((r.width_mm / 8).toFixed(2)) : 1),
        sizeMm: r.size_mm || 8,
        widthMm: r.width_mm || 8,
        active: r.active,
      }));

      return NextResponse.json([...dbBeads, ...catalogOnly]);
    }
  } catch (_) {
    // DB unavailable — serve catalog only
  }

  return NextResponse.json(INITIAL_BEADS);
}
