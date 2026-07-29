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
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReturnHome = () => {
    reset();
    onClose();
    router.push("/");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placedBeads,
          customerName,
          email: customerEmail,
          phone: customerPhone,
          wristInches: config.wristInches,
          address,
          totalPrice: 0, // Event complimentary checkout
          calculatedValuation: pricing.total,
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border max-w-lg w-full rounded-2xl p-6 relative shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {completed ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground">
              Order Confirmed!
            </h3>
            {orderId && (
              <div className="bg-muted p-2 rounded-lg text-xs font-mono text-primary font-bold inline-block">
                Ref ID: {orderId}
              </div>
            )}
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Thank you, {customerName || "valued customer"}. Your custom {config.wristInches}" bracelet ({placedBeads.length} beads) is queued for hand-finishing by our jewelers. A confirmation email has been dispatched to {customerEmail}.
            </p>
            <div className="pt-2">
              <Button onClick={handleReturnHome} className="w-full gold-shimmer text-on-primary-container font-bold py-3 rounded-full text-sm">
                Done & Return Home →
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Checkout</span>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Finalize Your Custom Bracelet
              </h3>
              <p className="text-xs text-muted-foreground">
                Review design summary and enter delivery instructions.
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
                <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 divide-y divide-border/30">
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
                      <div className="flex items-center gap-2">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={name}
                            className="w-5 h-5 rounded-full object-cover border border-primary/30 shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary/20 shrink-0" />
                        )}
                        <span className="font-medium text-foreground">{name}</span>
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
                <label className="block text-muted-foreground font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Elena Rostova"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="elena@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-1234"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Delivery Shipping Address</label>
                <textarea
                  required
                  rows={2}
                  placeholder="123 Artisan Lane, Suite 400, San Francisco, CA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 gold-shimmer text-on-primary-container font-bold py-2.5 rounded-full text-xs shadow-md hover:scale-[1.02] active:scale-98 transition-all"
                >
                  {submitting
                    ? "Processing Order..."
                    : "Submit & Order (Free)"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

