import type { Metadata } from "next";
import { INITIAL_BEADS } from "@/lib/catalog";
import { Bead } from "@/lib/types";
import { BeadManagerClient } from "./BeadManagerClient";

export const metadata: Metadata = {
  title: "Manage Beads — Beadu Admin",
  description: "Add, edit, or remove catalog beads",
};

export const dynamic = "force-dynamic";

type DbBeadRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  material: string | null;
  image_url: string | null;
  is_premium: boolean;
  rotation_allowed: boolean;
  size: number;
  size_mm: number;
  width_mm: number;
  active: boolean;
};

async function fetchBeads(): Promise<Bead[]> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase");
    const { data, error } = await getSupabaseAdmin()
      .from("beads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // DB empty — show catalog beads only
      return INITIAL_BEADS;
    }

    const dbBeads: Bead[] = (data as DbBeadRow[]).map((r) => ({
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

    // Merge: DB beads override catalog beads with same ID, then append catalog-only
    const dbIds = new Set(dbBeads.map((b) => b.id));
    const catalogOnly = INITIAL_BEADS.filter((b) => !dbIds.has(b.id));
    return [...dbBeads, ...catalogOnly];
  } catch (e) {
    return INITIAL_BEADS;
  }
}

export default async function ManageBeadsPage() {
  const beads = await fetchBeads();
  return <BeadManagerClient initialBeads={beads} />;
}
