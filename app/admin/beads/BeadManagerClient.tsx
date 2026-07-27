"use client";

import { useState } from "react";
import { Bead } from "@/lib/types";
import { addBead, updateBead, deleteBead } from "./actions";

type Props = {
  initialBeads: Bead[];
};

export function BeadManagerClient({ initialBeads }: Props) {
  const [beads, setBeads] = useState<Bead[]>(initialBeads);
  const [editingBead, setEditingBead] = useState<Bead | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form image state (supports file upload or URL)
  const [addImagePreview, setAddImagePreview] = useState<string>("");
  const [editImagePreview, setEditImagePreview] = useState<string>("");

  const handleFileUpload = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(String(e.target.result));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/80 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">category</span>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Bead Catalog Studio</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your master jewelry catalog. Add custom designs, upload real photos, edit prices & mm sizes.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="gold-shimmer text-on-primary-container px-4 py-2.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">{isAddOpen ? "close" : "add"}</span>
          <span>{isAddOpen ? "Close Form" : "Add New Bead"}</span>
        </button>
      </div>

      {/* Add Bead Expandable Form */}
      {isAddOpen && (
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-lg space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">add_photo_alternate</span>
              Create New Catalog Item
            </h2>
            <span className="text-[11px] text-muted-foreground">Upload file or enter URL</span>
          </div>

          <form
            action={async (formData: FormData) => {
              if (addImagePreview) {
                formData.set("image_url", addImagePreview);
              }
              await addBead(formData);
              setIsAddOpen(false);
              setAddImagePreview("");
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Image Upload Box */}
              <div className="space-y-1.5">
                <label className="block text-muted-foreground font-medium">Bead Image / File</label>
                <div className="border-2 border-dashed border-border hover:border-primary p-4 rounded-xl text-center flex flex-col items-center justify-center gap-2 bg-muted/20 relative cursor-pointer min-h-[140px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], setAddImagePreview);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {addImagePreview ? (
                    <div className="relative w-20 h-20 rounded-full border-2 border-primary overflow-hidden shadow-md">
                      <img src={addImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
                      <span className="text-xs font-semibold text-foreground">Click or Drag Image Here</span>
                      <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP supported</span>
                    </>
                  )}
                </div>
                <input
                  type="text"
                  name="image_url"
                  value={addImagePreview}
                  onChange={(e) => setAddImagePreview(e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full px-3 py-1.5 bg-background border border-border/80 rounded-lg text-[11px]"
                />
              </div>

              {/* Core Fields */}
              <div className="space-y-3 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Unique Bead ID</label>
                  <input
                    name="id"
                    required
                    placeholder="e.g. bead-emerald-cut"
                    className="w-full px-3 py-2 bg-background border border-border/80 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Bead Name</label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Emerald Faceted Gem"
                    className="w-full px-3 py-2 bg-background border border-border/80 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Category</label>
                  <select name="category" className="w-full px-3 py-2 bg-background border border-border/80 rounded-lg text-xs">
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
                    className="w-full px-3 py-2 bg-background border border-border/80 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Material Description</label>
                  <input
                    name="material"
                    placeholder="e.g. Cut Emerald Gemstone"
                    className="w-full px-3 py-2 bg-background border border-border/80 rounded-lg text-xs"
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
                      className="w-full px-2 py-2 bg-background border border-border/80 rounded-lg text-xs"
                    />
                    <input
                      name="width_mm"
                      type="number"
                      defaultValue={8}
                      placeholder="Width mm"
                      className="w-full px-2 py-2 bg-background border border-border/80 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox Toggles & CTA */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input type="checkbox" name="is_premium" value="true" className="rounded" />
                  <span className="font-semibold text-amber-600">Mark as Premium</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input type="checkbox" name="rotation_allowed" value="true" className="rounded" />
                  <span className="font-medium text-foreground">Allow Rotation</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-border/80 rounded-full text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-shimmer text-on-primary-container px-6 py-2 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-all"
                >
                  Save to Catalog
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Master Inventory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{beads.length} Items</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3.5">Bead</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Dimensions</th>
                <th className="px-4 py-3.5">Badges</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {beads.map((bead) => (
                <tr key={bead.id} className="hover:bg-muted/30 transition-colors">
                  {/* Bead Info */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border border-primary/20 p-0.5 shrink-0 bg-background shadow-xs">
                        {bead.imageUrl ? (
                          <img src={bead.imageUrl} alt={bead.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-muted-foreground text-sm">circle</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-xs">{bead.name}</p>
                        <p className="text-[11px] text-muted-foreground">{bead.material || "Crafted Material"}</p>
                        <span className="font-mono text-[10px] text-muted-foreground/60">{bead.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 capitalize font-medium text-foreground">{bead.category}</td>

                  <td className="px-4 py-3.5 font-bold">
                    {bead.price > 0 ? (
                      <span className="text-foreground">₹{bead.price}</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Complimentary</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-medium text-foreground">
                    {bead.sizeMm}mm × {bead.widthMm}mm
                  </td>

                  <td className="px-4 py-3.5 space-x-1">
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

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBead(bead);
                          setEditImagePreview(bead.imageUrl);
                        }}
                        className="px-3 py-1 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                      </button>

                      <form
                        action={async () => {
                          await deleteBead(bead.id);
                          setBeads((prev) => prev.filter((b) => b.id !== bead.id));
                        }}
                      >
                        <button
                          type="submit"
                          className="px-3 py-1 text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Bead Modal Dialog */}
      {editingBead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border max-w-xl w-full rounded-2xl p-6 relative shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setEditingBead(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Catalog Editor</span>
              <h3 className="font-display text-xl font-bold text-foreground">
                Edit {editingBead.name}
              </h3>
            </div>

            <form
              action={async (formData: FormData) => {
                if (editImagePreview) {
                  formData.set("image_url", editImagePreview);
                }
                await updateBead(editingBead.id, formData);
                setEditingBead(null);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Image Upload */}
                <div className="space-y-1.5">
                  <label className="block text-muted-foreground font-medium">Image File / URL</label>
                  <div className="border-2 border-dashed border-border p-3 rounded-xl text-center flex flex-col items-center justify-center gap-2 bg-muted/20 relative cursor-pointer min-h-[120px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0], setEditImagePreview);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {editImagePreview ? (
                      <div className="w-16 h-16 rounded-full border-2 border-primary overflow-hidden shadow-md">
                        <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-foreground">Change Image</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="image_url"
                    value={editImagePreview}
                    onChange={(e) => setEditImagePreview(e.target.value)}
                    className="w-full px-2 py-1 bg-background border border-border/80 rounded-md text-[10px]"
                  />
                </div>

                {/* Form fields */}
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Bead Name</label>
                    <input
                      name="name"
                      defaultValue={editingBead.name}
                      required
                      className="w-full px-3 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-muted-foreground font-medium mb-1">Category</label>
                      <select
                        name="category"
                        defaultValue={editingBead.category}
                        className="w-full px-2.5 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
                      >
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
                        defaultValue={editingBead.price}
                        className="w-full px-2.5 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Material Description</label>
                    <input
                      name="material"
                      defaultValue={editingBead.material}
                      className="w-full px-3 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-muted-foreground font-medium mb-1">Size (mm)</label>
                      <input
                        name="size_mm"
                        type="number"
                        defaultValue={editingBead.sizeMm}
                        className="w-full px-2.5 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-muted-foreground font-medium mb-1">Width (mm)</label>
                      <input
                        name="width_mm"
                        type="number"
                        defaultValue={editingBead.widthMm}
                        className="w-full px-2.5 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      name="is_premium"
                      value="true"
                      defaultChecked={editingBead.isPremium}
                      className="rounded"
                    />
                    <span className="font-semibold text-amber-600">Premium</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      name="rotation_allowed"
                      value="true"
                      defaultChecked={editingBead.rotationAllowed}
                      className="rounded"
                    />
                    <span>Rotation</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingBead(null)}
                    className="px-4 py-2 border border-border/80 rounded-full text-xs font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gold-shimmer text-on-primary-container px-5 py-2 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
