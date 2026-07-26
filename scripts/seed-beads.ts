import { createClient } from "@supabase/supabase-js";
import { INITIAL_BEADS } from "../lib/catalog";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log(`⏳ Seeding ${INITIAL_BEADS.length} beads into Supabase 'beads' table...`);

  const rows = INITIAL_BEADS.map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category,
    price: b.price,
    material: b.material,
    image_url: b.imageUrl,
    is_premium: b.isPremium,
    rotation_allowed: b.rotationAllowed,
    size: b.size,
    size_mm: b.sizeMm,
    width_mm: b.widthMm,
    active: b.active,
  }));

  const { data, error } = await supabase.from("beads").upsert(rows, { onConflict: "id" }).select();

  if (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${data?.length || rows.length} beads to Supabase!`);
}

seed().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
