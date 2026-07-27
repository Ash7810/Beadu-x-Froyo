"use client";

import { Bead } from "@/lib/types";

function TrayBeadItem({
  bead,
  isSelected,
  isSwapMode,
  onTapBead,
}: {
  bead: Bead;
  isSelected: boolean;
  isSwapMode: boolean;
  onTapBead: (bead: Bead) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onTapBead(bead)}
      className={`group relative flex flex-col items-center justify-between p-2.5 rounded-2xl bg-card border border-border/80 shadow-xs transition-all cursor-pointer select-none shrink-0 min-w-[84px] w-22 h-24 sm:w-26 sm:h-28 min-h-[48px] ${
        isSwapMode ? "border-amber-500/80 bg-amber-500/5 hover:bg-amber-500/10" : "hover:border-primary/60 hover:bg-muted/30"
      }`}
      title={isSwapMode ? `Swap with ${bead.name}` : `${bead.name} • ${bead.material}`}
    >
      <div className={`relative w-12 h-12 sm:w-14 sm:h-14 my-0.5 flex items-center justify-center rounded-full transition-all ${
        isSelected ? "ring-3 ring-primary ring-offset-2 ring-offset-background scale-105" : "group-hover:scale-105"
      }`}>
        <img
          src={bead.imageUrl}
          alt={bead.name}
          className="w-full h-full object-cover drop-shadow-xs pointer-events-none rounded-full border border-primary/20"
        />
      </div>

      <div className="w-full text-center space-y-0.5 text-[10px]">
        <span className="block font-medium text-foreground truncate w-full leading-tight px-0.5 text-[12px] sm:text-[13px]" title={bead.name}>
          {bead.name}
        </span>
        <span className="block text-[11px] text-primary font-medium">
          {bead.isPremium || bead.price > 0 ? `₹${bead.price}` : "Free"}
        </span>
      </div>
    </button>
  );
}

type Props = {
  trayBeads: Bead[];
  selectedBeadId?: string | null;
  isSwapMode?: boolean;
  onTapBead: (bead: Bead) => void;
  onClearTray: () => void;
};

export function CraftingTray({
  trayBeads,
  selectedBeadId,
  isSwapMode = false,
  onTapBead,
  onClearTray,
}: Props) {
  return (
    <div className={`w-full bg-card border rounded-2xl p-3 sm:p-4 shadow-sm font-sans select-none space-y-2 transition-all ${
      isSwapMode ? "border-amber-500/80 ring-2 ring-amber-500/20 bg-amber-500/5" : "border-border/80"
    }`}>
      {/* Header Bar */}
      <div className="flex justify-between items-center px-0.5">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-base ${isSwapMode ? "text-amber-500 animate-bounce" : "text-primary"}`}>
            {isSwapMode ? "swap_horiz" : "palette"}
          </span>
          <h3 className="text-[14px] font-medium text-foreground">
            {isSwapMode ? "Swap Mode: Pick Replacement Bead" : "Personal Crafting Tray"}
          </h3>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
            isSwapMode ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary"
          }`}>
            {isSwapMode ? "Tap bead to replace" : `${trayBeads.length} Items`}
          </span>
        </div>

        {trayBeads.length > 0 && !isSwapMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={onClearTray}
              className="min-h-[36px] min-w-[36px] px-3 py-1 text-[12px] font-medium text-muted-foreground hover:text-destructive border border-border/80 hover:border-destructive/40 rounded-full transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              <span className="hidden sm:inline">Clear Tray</span>
            </button>
          </div>
        )}
      </div>

      {/* Horizontally Scrollable Gamified Bead Tray Row - 8px gap */}
      {trayBeads.length === 0 ? (
        <div className="w-full py-4 rounded-xl border border-dashed border-border flex items-center justify-center gap-2 text-[12px] text-muted-foreground bg-muted/20">
          <span className="material-symbols-outlined text-primary text-base">add_shopping_cart</span>
          <span>Click beads from the library in Step 1 to collect items into your Crafting Tray.</span>
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto touch-pan-x no-scrollbar py-1 px-1.5 scroll-smooth">
          {trayBeads.map((bead, idx) => (
            <TrayBeadItem
              key={`tray-item-${idx}`}
              bead={bead}
              isSelected={selectedBeadId === bead.id}
              isSwapMode={isSwapMode}
              onTapBead={onTapBead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

