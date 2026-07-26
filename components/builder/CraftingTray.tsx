"use client";

import { useDraggable } from "@dnd-kit/core";
import { Bead } from "@/lib/types";
import { Button } from "@/components/ui/button";

function DraggableTrayBeadItem({
  bead,
  index,
  onPlaceBead,
}: {
  bead: Bead;
  index: number;
  onPlaceBead: (bead: Bead) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tray-${bead.id}-${index}`,
    data: { type: "tray-bead", bead, index },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onPlaceBead(bead)}
      className={`group relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl bg-card border border-border/80 shadow-xs hover:border-primary/60 hover:bg-muted/30 transition-all cursor-grab active:cursor-grabbing touch-pan-x select-none shrink-0 w-18 h-20 sm:w-22 sm:h-24 ${
        isDragging ? "opacity-30 scale-90 ring-2 ring-primary" : ""
      }`}
      title={`${bead.name} • ${bead.material}`}
    >
      <div className="w-10 h-10 my-0.5 flex items-center justify-center group-hover:scale-110 transition-transform">
        <img
          src={bead.imageUrl}
          alt={bead.name}
          className="w-full h-full object-cover drop-shadow-sm pointer-events-none rounded-full border border-primary/20"
        />
      </div>

      <div className="w-full text-center space-y-0 text-[10px]">
        <span className="block font-semibold text-foreground truncate w-full leading-tight px-1" title={bead.name}>
          {bead.name}
        </span>
        <span className="block text-[9px] text-primary font-bold">
          {bead.isPremium || bead.price > 0 ? `₹${bead.price}` : "Free"}
        </span>
      </div>
    </div>
  );
}

type Props = {
  trayBeads: Bead[];
  onPlaceBead: (bead: Bead) => void;
  onClearTray: () => void;
};

export function CraftingTray({
  trayBeads,
  onPlaceBead,
  onClearTray,
}: Props) {
  return (
    <div className="w-full bg-card border border-border/80 rounded-2xl p-3 sm:p-4 shadow-sm font-sans select-none space-y-2">
      {/* Header Bar */}
      <div className="flex justify-between items-center px-0.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">palette</span>
          <h3 className="text-xs font-bold text-foreground">Personal Crafting Tray</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            {trayBeads.length} Items Collected
          </span>
        </div>

        {trayBeads.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onClearTray}
              className="px-3 py-1 text-xs font-bold text-muted-foreground hover:text-destructive border border-border/80 hover:border-destructive/40 rounded-full transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-xs">delete_sweep</span>
              <span>Clear Tray</span>
            </button>
          </div>
        )}
      </div>

      {/* Horizontally Scrollable Gamified Bead Tray Row */}
      {trayBeads.length === 0 ? (
        <div className="w-full py-4 rounded-xl border border-dashed border-border flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/20">
          <span className="material-symbols-outlined text-primary text-base">add_shopping_cart</span>
          <span>Click beads from the library in Step 1 to collect items into your Crafting Tray.</span>
        </div>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto touch-pan-x no-scrollbar py-1 px-1.5 scroll-smooth">
          {trayBeads.map((bead, idx) => (
            <DraggableTrayBeadItem
              key={`tray-item-${idx}`}
              bead={bead}
              index={idx}
              onPlaceBead={onPlaceBead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

