import { createClient } from "@supabase/supabase-js";
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

  console.log("=== DB BEADS DUMP ===");
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
