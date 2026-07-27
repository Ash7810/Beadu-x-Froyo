import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase";
import { INITIAL_BEADS } from "@/lib/catalog";
import { Bead } from "@/lib/types";
import { addBead, updateBead, deleteBead } from "./actions";

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
    const { data, error } = await getSupabaseAdmin()
      .from("beads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_BEADS;
    }

    return (data as DbBeadRow[]).map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category as any,
      price: r.price,
      material: r.material || "",
      imageUrl: r.image_url || "",
      isPremium: r.is_premium,
      rotationAllowed: r.rotation_allowed,
      size: r.size || 1,
      sizeMm: r.size_mm || 8,
      widthMm: r.width_mm || 8,
      active: r.active,
    }));
  } catch (e) {
    return INITIAL_BEADS;
  }
}

export default async function ManageBeadsPage() {
  const beads = await fetchBeads();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Bead Catalog Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add new beads, modify prices/dimensions, or remove items from the catalog.
          </p>
        </div>
      </div>

      {/* Add New Bead Card Form */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-base">add_circle</span>
          Add New Catalog Bead
        </h2>
        <form
          action={async (formData: FormData) => {
            "use server";
            await addBead(formData);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"
        >
          <div>
            <label className="block text-muted-foreground font-medium mb-1">ID (unique string)</label>
            <input
              name="id"
              required
              placeholder="e.g. bead-topaz-gem"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-1">Bead Name</label>
            <input
              name="name"
              required
              placeholder="e.g. Imperial Topaz Sphere"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-1">Category</label>
            <select name="category" className="w-full px-3 py-2 bg-background border border-border rounded-lg">
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="crystal">Crystal</option>
              <option value="pearl">Pearl</option>
              <option value="letter">Letter</option>
              <option value="zodiac">Zodiac</option>
              <option value="birthstone">Birthstone</option>
              <option value="heart">Heart</option>
              <option value="premium-charm">Premium Charm</option>
            </select>
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-1">Price (₹)</label>
            <input
              name="price"
              type="number"
              defaultValue={0}
              min={0}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-1">Material</label>
            <input
              name="material"
              placeholder="e.g. Fired Terracotta & Gold Leaf"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-1">Image URL / Data URL</label>
            <input
              name="image_url"
              placeholder="https://... or data:image/..."
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-1">Diameter / Width (mm)</label>
            <div className="flex gap-2">
              <input
                name="size_mm"
                type="number"
                defaultValue={8}
                placeholder="Size mm"
                className="w-full px-2 py-2 bg-background border border-border rounded-lg"
              />
              <input
                name="width_mm"
                type="number"
                defaultValue={8}
                placeholder="Width mm"
                className="w-full px-2 py-2 bg-background border border-border rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" name="is_premium" value="true" className="rounded" />
              <span>Premium</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" name="rotation_allowed" value="true" className="rounded" />
              <span>Rotation</span>
            </label>
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              + Create Bead
            </button>
          </div>
        </form>
      </div>

      {/* Existing Beads List Table */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-bold text-muted-foreground uppercase">
                <th className="px-4 py-3">Bead</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Dimensions</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {beads.map((bead) => (
                <tr key={bead.id} className="hover:bg-muted/20">
                  {/* Bead Preview + Edit Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-border p-1 flex items-center justify-center shrink-0 bg-background">
                        {bead.imageUrl ? (
                          <img src={bead.imageUrl} alt={bead.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="material-symbols-outlined text-muted-foreground text-sm">circle</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-xs">{bead.name}</p>
                        <p className="text-[11px] text-muted-foreground">{bead.material || "No material"}</p>
                        <span className="font-mono text-[10px] text-muted-foreground/60">{bead.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-xs capitalize">{bead.category}</td>

                  <td className="px-4 py-3 text-xs font-bold">
                    {bead.price > 0 ? `₹${bead.price}` : <span className="text-green-600">Free</span>}
                  </td>

                  <td className="px-4 py-3 text-xs">
                    {bead.sizeMm}mm × {bead.widthMm}mm
                  </td>

                  <td className="px-4 py-3 text-xs space-x-1">
                    {bead.isPremium && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Premium
                      </span>
                    )}
                    {bead.rotationAllowed && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        Rotatable
                      </span>
                    )}
                  </td>

                  {/* Delete / Update Actions */}
                  <td className="px-4 py-3">
                    <form
                      action={async () => {
                        "use server";
                        await deleteBead(bead.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
