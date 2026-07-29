import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { INITIAL_BEADS } from "@/lib/catalog";
import { Bead } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("beads")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json(INITIAL_BEADS);
    }

    const dbBeads: Bead[] = data.map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category as any,
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

    return NextResponse.json(dbBeads);
  } catch (e) {
    return NextResponse.json(INITIAL_BEADS);
  }
}
