import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const url = rawUrl.replace("/rest/v1/", "").replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !key) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase
    .from("beads")
    .select("*")
    .eq("active", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching beads:", error.message);
    process.exit(1);
  }

  // Format beads correctly to match lib/types.ts Bead type
  const beadsCodeList = data.map((r: any) => {
    return `  {
    id: ${JSON.stringify(r.id)},
    name: ${JSON.stringify(r.name)},
    category: ${JSON.stringify(r.category)},
    price: ${r.price},
    material: ${JSON.stringify(r.material || "")},
    imageUrl: ${JSON.stringify(r.image_url || "")},
    isPremium: ${r.is_premium},
    rotationAllowed: ${r.rotation_allowed},
    size: ${r.size || (r.width_mm ? Number((r.width_mm / 8).toFixed(2)) : 1)},
    sizeMm: ${r.size_mm || 8},
    widthMm: ${r.width_mm || 8},
    active: ${r.active},
  }`;
  });

  const catalogFilePath = path.join(process.cwd(), "lib", "catalog.ts");
  
  // Read current catalog.ts to preserve PRESET_DESIGNS section
  const currentContent = fs.readFileSync(catalogFilePath, "utf-8");
  const presetStartIndex = currentContent.indexOf("export const PRESET_DESIGNS");
  if (presetStartIndex === -1) {
    console.error("Could not find PRESET_DESIGNS section in lib/catalog.ts");
    process.exit(1);
  }
  const presetSection = currentContent.substring(presetStartIndex);

  const newContent = `import { Bead, PresetDesign } from "./types";

// Real photoshoot beads — permanently updated from live database
export const INITIAL_BEADS: Bead[] = [
${beadsCodeList.join(",\n")}
];

${presetSection}`;

  fs.writeFileSync(catalogFilePath, newContent, "utf-8");
  console.log("✓ Successfully updated lib/catalog.ts with live database beads permanently!");
}

main().catch(console.error);
