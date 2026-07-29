"use client";

import { useBraceletStore } from "@/store/braceletStore";
import { Button } from "@/components/ui/button";
import { calculateStrandPhysicalCapacity } from "@/lib/pricing";

type Props = {
  onSave: () => void;
  onShare: () => void;
  onSubmit: () => void;
};

export function SummaryPanel({ onSave, onShare, onSubmit }: Props) {
  const {
    placedBeads,
    pricing,
    config,
    setWristInches,
    undo,
    redo,
    reset,
    historyIndex,
    history,
  } = useBraceletStore();

  const PRESET_SIZES = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5];

  return (
    <div className="flex h-full flex-col justify-between border-l border-border bg-card/60 p-5 font-sans select-none overflow-y-auto">
      <div className="space-y-5">
        {/* Title */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
            Design Summary
          </h2>
          <p className="text-xs text-muted-foreground">Real-time valuation & customization</p>
        </div>

        {/* History Toolbar with Step Counters */}
        <div className="flex gap-2 p-1 bg-muted/60 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="flex-1 h-8 text-xs font-semibold gap-1 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">undo</span>
            Undo {historyIndex > 0 ? `(${historyIndex})` : ""}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="flex-1 h-8 text-xs font-semibold gap-1 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">redo</span>
            Redo {history.length - 1 - historyIndex > 0 ? `(${history.length - 1 - historyIndex})` : ""}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={placedBeads.length === 0}
            className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1 px-2 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Reset
          </Button>
        </div>

        {/* Precise Wrist Size Selector */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-medium text-muted-foreground">Wrist Circumference</label>
            <span className="text-foreground font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
              {config.wristInches.toFixed(1)}" ({Math.round(config.wristInches * 2.54)} cm)
            </span>
          </div>

          <div className="flex flex-wrap gap-1 p-1 bg-background rounded-xl border border-border">
            {PRESET_SIZES.map((sz) => (
              <button
                key={sz}
                onClick={() => setWristInches(sz)}
                className={`flex-1 min-w-[42px] py-1.5 text-xs font-bold rounded-lg transition-all ${
                  Math.abs(config.wristInches - sz) < 0.05
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {sz}"
              </button>
            ))}
          </div>

          {/* Precision Slider */}
          <div className="px-1 space-y-1">
            <input
              type="range"
              min="5.0"
              max="9.0"
              step="0.25"
              value={config.wristInches}
              onChange={(e) => setWristInches(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>5.0" Petite</span>
              <span>7.0" Medium</span>
              <span>9.0" Large</span>
            </div>
          </div>
        </div>



        {/* Slot Progress */}
        <div className="space-y-2 bg-background p-3 rounded-xl border border-border">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Strand Capacity</span>
            <span className="text-foreground font-bold">
              {placedBeads.length} / {config.totalSlots} Slots
            </span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${(placedBeads.length / config.totalSlots) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Free Slot Limit: {config.freeSlotLimit}</span>
            <span>{pricing.remainingSlots} slots left</span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2.5 bg-muted/30 p-3.5 rounded-xl border border-border/60 text-xs font-sans">
          <div className="flex justify-between items-center text-muted-foreground font-medium">
            <span>Total Placed Beads</span>
            <span className="font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded">
              {placedBeads.length} Beads
            </span>
          </div>

          {/* Itemized Placed Bead Breakdown */}
          {placedBeads.length > 0 && (
            <div className="pt-2 border-t border-border/40 space-y-1.5">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Itemized Bead Breakdown:
              </span>
              {Object.entries(
                placedBeads.reduce((acc, bead) => {
                  const name = bead.name || bead.id;
                  if (!acc[name]) {
                    acc[name] = { count: 0, price: bead.price };
                  }
                  acc[name].count += 1;
                  return acc;
                }, {} as Record<string, { count: number; price: number }>)
              ).map(([name, item]) => (
                <div key={name} className="flex justify-between items-center text-[11px] text-muted-foreground">
                  <span className="truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="truncate">{name} (x{item.count})</span>
                  </span>
                  <span className="font-medium text-foreground shrink-0 ml-2">
                    {item.price > 0 ? `₹${item.price * item.count}` : "FREE"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2.5 border-t border-border flex justify-between items-center">
            <div>
              <span className="block font-semibold text-foreground text-sm">Total Pricing</span>
              <span className="text-[10px] text-muted-foreground">Event complimentary offer</span>
            </div>
            <div className="text-right">
              {pricing.total > 0 && (
                <span className="text-xs text-muted-foreground line-through block">
                  ₹{pricing.total}
                </span>
              )}
              <span className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                FREE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-border mt-4">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onSave} className="text-xs font-semibold gap-1">
            <span className="material-symbols-outlined text-sm">bookmark</span>
            Save Draft
          </Button>
          <Button variant="outline" size="sm" onClick={onShare} className="text-xs font-semibold gap-1">
            <span className="material-symbols-outlined text-sm">share</span>
            Share Link
          </Button>
        </div>

        <button
          onClick={onSubmit}
          disabled={placedBeads.length === 0}
          className={`w-full py-3.5 px-4 rounded-full font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${placedBeads.length === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "gold-shimmer text-on-primary-container hover:scale-[1.02] active:scale-95 shadow-primary/20"
            }`}
        >
          <span className="material-symbols-outlined text-lg">shopping_bag</span>
          <span>{pricing.total > 0 ? "Proceed to Checkout" : "Claim Custom Piece"}</span>
        </button>
      </div>
    </div>
  );
}

