"use client";

import { useState, useEffect, memo } from "react";
import { Bead } from "@/lib/types";

type Props = {
  beads: Bead[];
  trayBeadIds?: string[];
  onSelectBead: (bead: Bead) => void;
  onAddToTray: (bead: Bead) => void;
  onRemoveFromTrayByBeadId?: (beadId: string) => void;
};

export const BeadItem = memo(function BeadItem({
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
  const handleToggle = () => {
    if (isInTray) {
      onRemoveFromTrayByBeadId?.(bead.id);
    } else {
      onAddToTray(bead);
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`group relative flex flex-col items-center justify-between p-2 sm:p-3 rounded-2xl border border-border/80 bg-card hover:bg-muted/40 hover:border-primary/50 transition-all cursor-pointer select-none ${isInTray ? "border-emerald-500/60 bg-emerald-500/5 hover:bg-emerald-500/10" : ""
        }`}
    >
      {isSelected ? (
        <span className="absolute left-2 top-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground shadow-xs">
          Active
        </span>
      ) : isInTray ? (
        <span className="absolute left-2 top-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
          ✓ In Tray
        </span>
      ) : bead.isPremium || bead.price > 0 ? (
        <span className="absolute left-2 top-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          Premium
        </span>
      ) : null}

      <div className={`relative w-14 h-14 sm:w-20 sm:h-20 my-1 mt-2 flex items-center justify-center rounded-xl bg-muted/30 p-1.5 transition-all ${isSelected ? "scale-105 ring-2 ring-primary" : "group-hover:scale-105"
        }`}>
        <img
          src={bead.imageUrl}
          alt={bead.name}
          className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-sm pointer-events-none"
        />
      </div>

      <div className="w-full text-center space-y-1 mt-1.5">
        <span className="block text-xs font-semibold text-foreground truncate px-0.5" title={bead.name}>
          {bead.name}
        </span>
        <div className="flex items-center justify-between pt-1.5 border-t border-border/50 gap-1">
          <span className="text-xs text-primary font-bold">
            {bead.isPremium || bead.price > 0 ? `₹${bead.price}` : "Free"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors whitespace-nowrap cursor-pointer active:scale-95 ${isInTray
                ? "bg-emerald-600/15 text-emerald-600 hover:bg-destructive/10 hover:text-destructive"
                : "bg-primary/10 hover:bg-primary/20 text-primary"
              }`}
          >
            {isInTray ? "✓ Added" : "Collect"}
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
  onAddToTray,
  onRemoveFromTrayByBeadId,
}: Props) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeBeadId, setActiveBeadId] = useState<string | null>(null);

  const categories = Array.from(new Set(beads.map((b) => b.category).filter(Boolean)));

  const filtered = beads.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full flex-col gap-3.5 bg-card p-1 sm:p-2 font-sans select-none min-h-0">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-[14px] sm:text-lg font-medium text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">category</span>
              Bead Catalog
            </h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Click "Collect" to add items into your Crafting Tray.</p>
          </div>
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div className="space-y-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-foreground text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Search beads, metals, stones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 min-h-[40px] bg-background border border-border/80 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/60 hover:bg-muted text-muted-foreground"
                }`}
              >
                All ({beads.length})
              </button>
              {categories.map((cat) => {
                const count = beads.filter((b) => b.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/60 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {cat.replace("-", " ")} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bead Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 overflow-y-auto overflow-x-hidden flex-1 min-h-0 pr-0.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[12px] text-muted-foreground space-y-2">
            <span className="material-symbols-outlined text-3xl opacity-40">inventory_2</span>
            <p>No beads found in this category.</p>
          </div>
        ) : (
          filtered.map((bead) => (
            <BeadItem
              key={bead.id}
              bead={bead}
              isSelected={activeBeadId === bead.id}
              isInTray={trayBeadIds.includes(bead.id)}
              onSelectBead={(b) => {
                if (trayBeadIds.includes(b.id)) {
                  onRemoveFromTrayByBeadId?.(b.id);
                } else {
                  onAddToTray(b);
                }
              }}
              onAddToTray={onAddToTray}
              onRemoveFromTrayByBeadId={onRemoveFromTrayByBeadId}
            />
          ))
        )}
      </div>
    </div>
  );
}
