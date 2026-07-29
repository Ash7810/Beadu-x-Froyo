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
      const dbBeadsMap = new Map(data.map((r: any) => [
        r.id,
        {
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
        }
      ]));

      // 1. Reconstruct INITIAL_BEADS in order, overriding with DB values if they exist
      const mergedList = INITIAL_BEADS.map((catBead) => {
        if (dbBeadsMap.has(catBead.id)) {
          return dbBeadsMap.get(catBead.id)!;
        }
        return catBead;
      });

      // 2. Add brand-new beads created from Admin (not in INITIAL_BEADS), sorted alphabetically by ID
      const initialIds = new Set(INITIAL_BEADS.map((b) => b.id));
      const customDbBeads = Array.from(dbBeadsMap.values())
        .filter((b) => !initialIds.has(b.id))
        .sort((a, b) => a.id.localeCompare(b.id));

      return NextResponse.json([...mergedList, ...customDbBeads]);
    }
  } catch (_) {
    // DB unavailable — serve catalog only
  }

  return NextResponse.json(INITIAL_BEADS);
}
