"use client";

import { useState, useEffect, memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Bead } from "@/lib/types";

type Props = {
  beads: Bead[];
  trayBeadIds?: string[];
  onSelectBead: (bead: Bead) => void;
  onAddCustomBead: (bead: Bead) => void;
  onAddToTray: (bead: Bead) => void;
  onRemoveFromTrayByBeadId?: (beadId: string) => void;
};



export const DraggableBeadItem = memo(function DraggableBeadItem({
  bead,
  isSelected,
  isInTray,
  onSelectBead,
  onAddToTray,
  onRemoveFromTrayByBeadId,
}: {
  bead: Bead;
  isSelected?: boolean;
  isInTray?: boolean;
  onSelectBead: (bead: Bead) => void;
  onAddToTray: (bead: Bead) => void;
  onRemoveFromTrayByBeadId?: (beadId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `catalog-${bead.id}`,
    data: { type: "catalog-bead", bead },
  });

  const handleToggle = () => {
    if (isInTray) {
      onRemoveFromTrayByBeadId?.(bead.id);
    } else {
      onAddToTray(bead);
    }
  };

  return (
    <div
      ref={(node: HTMLDivElement | null) => setNodeRef(node as unknown as HTMLElement)}
      {...listeners}
      {...attributes}
      onClick={handleToggle}
      className={`group relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none h-36 sm:h-40 ${
        isSelected
          ? "border-primary ring-2 ring-primary/40 bg-primary/10 shadow-xs"
          : isInTray
            ? "border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 shadow-xs"
            : "border-border/80 bg-card hover:bg-muted/40 hover:border-primary/50 hover:shadow-md"
      } ${isDragging ? "opacity-30 scale-95 ring-2 ring-primary" : ""}`}
    >
      {isSelected ? (
        <span className="absolute left-1.5 top-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground shadow-xs">
          Active
        </span>
      ) : isInTray ? (
        <span className="absolute left-1.5 top-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
          ✓ In Tray
        </span>
      ) : bead.isPremium || bead.price > 0 ? (
        <span className="absolute left-1.5 top-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          Premium
        </span>
      ) : null}

      <div className="w-12 h-12 sm:w-14 sm:h-14 my-1 flex items-center justify-center group-hover:scale-110 transition-transform">
        <img
          src={bead.imageUrl}
          alt={bead.name}
          className="w-full h-full object-cover drop-shadow-sm pointer-events-none rounded-full"
        />
      </div>

      <div className="w-full text-center space-y-1 mt-auto">
        <span className="block text-xs font-bold text-foreground truncate px-0.5" title={bead.name}>
          {bead.name}
        </span>
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <span className="text-[11px] text-primary font-bold">
            {bead.isPremium || bead.price > 0 ? `₹${bead.price}` : "Free"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
              isInTray
                ? "bg-emerald-600/15 text-emerald-600 hover:bg-destructive/10 hover:text-destructive"
                : "bg-primary/10 hover:bg-primary/20 text-primary"
            }`}
          >
            {isInTray ? "✓ In Tray" : "+ Collect"}
          </button>
        </div>
      </div>
    </div>
  );
});

export function BeadLibrary({
  beads,
  trayBeadIds = [],
  onSelectBead,
  onAddCustomBead,
  onAddToTray,
  onRemoveFromTrayByBeadId,
}: Props) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Custom bead form state
  const [customName, setCustomName] = useState("");
  const [customMaterial, setCustomMaterial] = useState("Custom Photo Locket");
  const [customPrice, setCustomPrice] = useState(250);
  const [customSizeMm, setCustomSizeMm] = useState<number>(10);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const [activeBeadId, setActiveBeadId] = useState<string | null>(null);

  useEffect(() => {
    beads.forEach((b: any) => {
      const width = b.widthMm ?? b.sizeMm;
      if (!width || isNaN(width)) {
        console.warn('Bead missing widthMm:', b.name);
      }
    });
  }, [beads]);

  const filtered = beads.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.material.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCustomImage(String(e.target.result));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCustomBead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customImage) return;

    const newBead: Bead = {
      id: `custom-bead-${Date.now()}`,
      name: customName || "Bespoke Photo Locket",
      category: "custom" as any,
      price: Number(customPrice) || 0,
      material: customMaterial || "Personalized Custom Charm",
      imageUrl: customImage,
      isPremium: Number(customPrice) > 0,
      rotationAllowed: true,
      size: 1,
      sizeMm: Number(customSizeMm) || 10,
      widthMm: Number(customSizeMm) || 10,
      active: true,
    };

    onAddCustomBead(newBead);
    setIsUploadOpen(false);
    setCustomName("");
    setCustomImage(null);
  };

  return (
    <div className="flex h-full flex-col gap-3.5 bg-card p-1 sm:p-2 font-sans select-none min-h-0">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">category</span>
              Bead Catalog
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Click "+ Collect" to add items into your Crafting Tray.</p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-base">add_photo_alternate</span>
            <span>+ Custom Bead</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-foreground text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Search beads, metals, stones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-background border border-border/80 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
          />
        </div>
      </div>

      {/* Bead Grid - 3 columns, all cards fully visible, overflow scrollable */}
      <div className="grid grid-cols-3 gap-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground space-y-2">
            <span className="material-symbols-outlined text-3xl opacity-40">inventory_2</span>
            <p>No beads found in this category.</p>
          </div>
        ) : (
          filtered.map((bead) => (
            <DraggableBeadItem
              key={bead.id}
              bead={bead}
              isSelected={activeBeadId === bead.id}
              isInTray={trayBeadIds.includes(bead.id)}
              onSelectBead={(b) => {
                if (activeBeadId === b.id || trayBeadIds.includes(b.id)) {
                  setActiveBeadId(null);
                  onRemoveFromTrayByBeadId?.(b.id);
                } else {
                  setActiveBeadId(b.id);
                  onSelectBead(b);
                }
              }}
              onAddToTray={onAddToTray}
              onRemoveFromTrayByBeadId={onRemoveFromTrayByBeadId}
            />
          ))
        )}
      </div>

      {/* Custom Bead Upload Modal Dialog */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border max-w-md w-full rounded-2xl p-6 relative shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Bespoke Jewelry</span>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Create Custom Image Charm
              </h3>
              <p className="text-xs text-muted-foreground">
                Upload your own photo or graphics to create a personalized photo locket or custom bead.
              </p>
            </div>

            <form onSubmit={handleCreateCustomBead} className="space-y-3 text-xs">
              {/* Image Upload Area */}
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Upload Photo / Graphic</label>
                <div className="border-2 border-dashed border-border hover:border-primary p-4 rounded-xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/20 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {customImage ? (
                    <div className="relative w-20 h-20 rounded-full border-2 border-primary overflow-hidden shadow-md">
                      <img src={customImage} alt="Custom Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-primary">add_a_photo</span>
                      <span className="text-xs font-semibold text-foreground">Click to upload image file</span>
                      <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP supported</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Charm Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Family Memory Locket"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-muted-foreground font-medium mb-1">Material</label>
                  <input
                    type="text"
                    required
                    placeholder="Gold Frame"
                    value={customMaterial}
                    onChange={(e) => setCustomMaterial(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="249"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground font-medium mb-1">Diameter (mm)</label>
                  <select
                    value={customSizeMm}
                    onChange={(e) => setCustomSizeMm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={6}>6 mm</option>
                    <option value={8}>8 mm</option>
                    <option value={10}>10 mm</option>
                    <option value={12}>12 mm</option>
                    <option value={14}>14 mm</option>
                    <option value={16}>16 mm</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customImage}
                  className={`flex-1 font-bold py-2.5 rounded-lg text-xs shadow-md transition-all ${!customImage
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "gold-shimmer text-on-primary-container hover:scale-105"
                    }`}
                >
                  Add to Customizer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

