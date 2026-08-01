"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBraceletStore } from "@/store/braceletStore";
import { Button } from "@/components/ui/button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function Checkout({ isOpen, onClose, onSuccess }: Props) {
  const router = useRouter();
  const { placedBeads, pricing, config, reset } = useBraceletStore();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (!isOpen) return null;
  if (!placedBeads || placedBeads.length === 0) return null;

  const handleReturnHome = () => {
    reset();
    onClose();
    router.push("/");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!placedBeads || placedBeads.length === 0) {
      alert("Your bracelet strand is empty. Please add at least 1 bead before checking out.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placedBeads,
          customerName,
          email: "",
          phone: customerPhone ? `+91 ${customerPhone}` : "",
          wristInches: config.wristInches,
          cordType: config.cordType || "elastic",
          address: "",
          totalPrice: 0, // Event complimentary checkout
          calculatedValuation: placedBeads.reduce((acc, b) => acc + (Number(b.price) || 0), 0),
        }),
      });

      const data = await response.json();
      setSubmitting(false);

      if (data.success && data.order) {
        setOrderId(data.order.orderId);
        setCompleted(true);
        onSuccess();
      } else {
        alert(data.error || "Failed to process order.");
      }
    } catch {
      setSubmitting(false);
      // Fallback order ID if offline
      setOrderId(`BDU-LOCAL-${Math.floor(1000 + Math.random() * 9000)}`);
      setCompleted(true);
      onSuccess();
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-scrollbar">
      <div className="bg-background border border-border max-w-lg w-full rounded-2xl p-4 sm:p-6 relative shadow-2xl space-y-3.5 my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground z-10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          title="Close Modal"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {completed ? (
          <div className="text-center py-6 space-y-4 my-auto px-2 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-4xl border-2 border-emerald-500/30 shadow-md animate-bounce">
              ✓
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">Order Successfully Received</span>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Thank You, {customerName || "Valued Artisan"}!
              </h3>
            </div>

            {orderId && (
              <div className="bg-muted p-2.5 rounded-xl border border-border/80 text-xs font-mono text-primary font-bold inline-flex items-center gap-2 shadow-xs">
                <span className="material-symbols-outlined text-sm">tag</span>
                <span>Ref ID: {orderId}</span>
              </div>
            )}

            <div className="bg-muted/40 p-3.5 rounded-xl border border-border/70 text-xs text-muted-foreground max-w-sm mx-auto space-y-2 text-left">
              <div className="flex justify-between items-center border-b border-border/50 pb-1.5">
                <span className="font-medium">Customer:</span>
                <strong className="text-foreground font-semibold">{customerName}</strong>
              </div>
              {customerPhone && (
                <div className="flex justify-between items-center border-b border-border/50 pb-1.5">
                  <span className="font-medium">Phone:</span>
                  <strong className="text-foreground font-semibold">+91 {customerPhone}</strong>
                </div>
              )}
              <div className="flex justify-between items-center border-b border-border/50 pb-1.5">
                <span className="font-medium">Bracelet Spec:</span>
                <strong className="text-foreground font-semibold">{config.wristInches}" Wrist ({placedBeads.length} beads)</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Queued for Hand-Finishing
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleReturnHome} className="w-full gold-shimmer text-on-primary-container font-bold py-3.5 rounded-full text-sm shadow-md hover:scale-[1.02] cursor-pointer">
                Done & Start New Design →
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto overflow-x-hidden no-scrollbar px-0.5 sm:px-1 space-y-3.5 flex-1">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Checkout</span>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
                Finalize Your Custom Bracelet
              </h3>
              <p className="text-xs text-muted-foreground">
                Review design summary and enter customer details.
              </p>
            </div>

            {/* Design Summary Strip with Bead Counts */}
            <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Total Beads Placed:</span>
                <span className="font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
                  {placedBeads.length} Beads
                </span>
              </div>

              {/* Itemized Bead Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Beads Used Summary:
                </span>
                <div className="max-h-32 overflow-y-auto pr-1 space-y-1.5 divide-y divide-border/30">
                  {Object.entries(
                    placedBeads.reduce((acc, bead) => {
                      const name = bead.name || bead.id;
                      if (!acc[name]) {
                        acc[name] = { count: 0, imageUrl: bead.imageUrl, price: bead.price };
                      }
                      acc[name].count += 1;
                      return acc;
                    }, {} as Record<string, { count: number; imageUrl: string; price: number }>)
                  ).map(([name, item]) => (
                    <div key={name} className="pt-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={name}
                            className="w-6 h-6 rounded-md object-contain bg-muted/20 border border-primary/30 p-0.5 shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary/20 shrink-0" />
                        )}
                        <span className="font-medium text-foreground truncate">{name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-primary bg-background px-2 py-0.5 rounded border border-border">
                          x{item.count}
                        </span>
                        {item.price > 0 && (
                          <span className="text-muted-foreground text-[11px]">
                            (₹{item.price * item.count})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-border/60">
                <span className="text-muted-foreground">Strand Spec:</span>
                <span className="font-semibold text-foreground capitalize">Artisan Strand • {config.wristInches}" fit</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-border/60">
                <div>
                  <span className="font-bold text-foreground block">Total Pricing:</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Event Special Offer
                  </span>
                </div>
                <div className="text-right">
                  {pricing.total > 0 && (
                    <span className="text-xs text-muted-foreground line-through block">
                      ₹{pricing.total}
                    </span>
                  )}
                  <span className="font-display font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    FREE
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details Form */}
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Phone Number *</label>
                <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                  <span className="px-3 py-2 bg-muted/60 text-muted-foreground font-semibold text-xs border-r border-border shrink-0 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="^[0-9]{10}$"
                    title="Please enter a valid 10-digit Indian phone number"
                    placeholder="Enter 10-digit mobile number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full px-3 py-2 bg-transparent focus:outline-none text-foreground min-h-[38px]"
                  />
                </div>
              </div>

              <div className="pt-3 pb-1 sticky bottom-0 bg-background/95 backdrop-blur-md flex gap-2 border-t border-border/40 -mx-1 px-1">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-full text-xs py-2.5 min-h-[40px]">
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={submitting || placedBeads.length === 0}
                  className={`flex-1 font-bold py-2.5 rounded-full text-xs shadow-md transition-all min-h-[40px] ${
                    submitting || placedBeads.length === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border/60"
                      : "gold-shimmer text-on-primary-container hover:scale-[1.02] active:scale-98 cursor-pointer"
                  }`}
                >
                  {submitting
                    ? "Processing Order..."
                    : "Submit & Order (Free)"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

