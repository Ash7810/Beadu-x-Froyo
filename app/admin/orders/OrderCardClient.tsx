"use client";

import { useState } from "react";
import { PlacedBead } from "@/lib/types";
import { deleteOrder, updateOrderStatus, updateOrderDetails } from "./actions";
import { BraceletCanvas } from "@/components/builder/BraceletCanvas";

const STATUS_LABELS: Record<string, { label: string; color: string; badge: string }> = {
  draft:     { label: "Draft",     color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800", badge: "bg-slate-500" },
  confirmed: { label: "Confirmed", color: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50", badge: "bg-amber-500" },
  shipped:   { label: "Shipped",   color: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50", badge: "bg-blue-500" },
  delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50", badge: "bg-emerald-500" },
};

const ALL_STATUSES = ["draft", "confirmed", "shipped", "delivered"];

export type Order = {
  id: string;
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  wrist_inches: number;
  cord_type: string;
  placed_beads: PlacedBead[];
  total_price: number;
  status: string;
  preview_image_url: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

function formatPrice(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderCardClient({ order, index }: { order: Order; index: number }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const placedArray = Array.isArray(order.placed_beads) ? order.placed_beads : [];
  const statusStyle = STATUS_LABELS[order.status] ?? STATUS_LABELS.draft;

  // Group bead quantities for clean jeweler recipe
  const beadCounts = placedArray.reduce((acc, bead) => {
    const name = bead.name || bead.id;
    if (!acc[name]) {
      acc[name] = { count: 0, imageUrl: bead.imageUrl, material: bead.material };
    }
    acc[name].count += 1;
    return acc;
  }, {} as Record<string, { count: number; imageUrl: string; material?: string }>);

  return (
    <div className="bg-card border border-border/80 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Top Header Row — Sequential Order # & Primary Info */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 bg-muted/30 border-b border-border/60 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/50 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            #{index}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-sm">
                {order.customer_name || "Guest Customer"}
              </h3>
              <span className="font-mono text-[11px] text-muted-foreground">
                ({order.id.slice(0, 8).toUpperCase()})
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>{formatDate(order.created_at)}</span>
              <span>•</span>
              <strong className="text-foreground font-semibold">{placedArray.length} Beads ({order.wrist_inches}&quot; Fit)</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status Dropdown Pill */}
          <form
            action={async (formData: FormData) => {
              const status = formData.get("status") as string;
              await updateOrderStatus(order.id, status);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1"
          >
            <select
              name="status"
              defaultValue={order.status}
              onChange={(e) => e.target.form?.requestSubmit()}
              className={`text-xs font-bold px-3 py-1 rounded-full border focus:outline-none cursor-pointer ${statusStyle.color}`}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]?.label ?? s}
                </option>
              ))}
            </select>
          </form>

          {/* Expand/Collapse Chevron Button */}
          <button 
            className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center transition-transform"
            aria-label={isExpanded ? "Collapse Details" : "Expand Details"}
          >
            <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>
        </div>
      </div>

      {/* Primary Summary Bar (Always Visible) */}
      <div className="px-5 py-3 bg-background border-b border-border/40 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 truncate">
          <div className="flex items-center gap-1.5 shrink-0">
            {order.total_price > 0 ? (
              <strong className="font-bold text-foreground">{formatPrice(order.total_price)}</strong>
            ) : (
              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                FREE (Complimentary)
              </span>
            )}
          </div>
          {order.phone && <span className="text-muted-foreground truncate hidden xs:inline">📞 {order.phone}</span>}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>{isExpanded ? "Hide Details" : "View Full Order & Render"}</span>
          <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
            arrow_drop_down
          </span>
        </button>
      </div>

      {/* Collapsible Expanded Details Section */}
      {isExpanded && (
        <div className="p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Customer & Shipping Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border/40">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {order.email && <span className="flex items-center gap-1">✉ {order.email}</span>}
                {order.phone && <span className="flex items-center gap-1">📞 {order.phone}</span>}
              </div>
              {order.address && (
                <p className="text-xs text-muted-foreground/90 mt-1 flex items-start gap-1 font-sans">
                  <span className="shrink-0">📍</span>
                  <span>{order.address}</span>
                </p>
              )}
            </div>

            {/* Fit & Specs Badge */}
            <div className="shrink-0 text-left sm:text-right bg-muted/40 p-2.5 rounded-xl border border-border/70 text-xs">
              <span className="font-bold text-foreground block">{order.wrist_inches}&quot; Wrist Fit</span>
              <span className="text-[11px] text-muted-foreground capitalize">
                {order.cord_type?.replace("_", " ")} cord
              </span>
            </div>
          </div>

          {/* Visual Preview Strand / Closed-Loop Assembly */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-primary">palette</span>
                Bracelet Assembly Render ({placedArray.length} Beads)
              </span>
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">zoom_in</span>
                Enlarge Preview
              </button>
            </div>

            {/* Rendered Closed-Loop Bracelet Canvas */}
            <div
              onClick={() => setIsPreviewOpen(true)}
              className="w-full h-48 sm:h-52 rounded-xl bg-background border border-border/80 p-2 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors shadow-inner overflow-hidden"
            >
              {placedArray.length > 0 ? (
                <BraceletCanvas compact={true} readOnly={true} defaultViewMode="preview" customPlacedBeads={placedArray} />
              ) : (
                <span className="text-xs text-muted-foreground py-1">No beads placed</span>
              )}
            </div>
          </div>

        {/* Jeweler Bead Count Recipe */}
        {Object.keys(beadCounts).length > 0 && (
          <div className="bg-muted/40 p-3 rounded-xl border border-border/60 space-y-1.5 text-xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Jeweler Crafting Recipe (Quantities to use):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {Object.entries(beadCounts).map(([name, item]) => (
                <div
                  key={name}
                  className="flex items-center justify-between bg-card px-2.5 py-1.5 rounded-lg border border-border/60 text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={name}
                        className="w-5 h-5 rounded-full object-cover border border-primary/30 shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/20 shrink-0" />
                    )}
                    <span className="font-medium text-foreground truncate">{name}</span>
                  </div>
                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shrink-0">
                    x{item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card Footer Actions inside drawer */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Details
          </button>

          <form
            action={async () => {
              if (confirm("Delete this customer order permanently?")) {
                await deleteOrder(order.id);
              }
            }}
          >
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Delete
            </button>
          </form>
        </div>
      </div>
      )}

      {/* Full Design Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border max-w-2xl w-full rounded-2xl p-6 relative shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="material-symbols-outlined text-primary text-xl">palette</span>
              <div>
                <h3 className="font-bold text-foreground text-sm">
                  Bracelet Design Preview — #{order.id.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Customer: {order.customer_name || "Guest"} • {order.wrist_inches}&quot; Wrist Fit
                </p>
              </div>
            </div>

            {/* Custom Design Image Render or Closed-Loop Strand Canvas Preview */}
            {order.preview_image_url ? (
              <div className="w-full max-h-[360px] rounded-xl overflow-hidden border border-border bg-black/5 flex items-center justify-center">
                <img
                  src={order.preview_image_url}
                  alt="Custom design preview"
                  className="max-h-[360px] w-auto object-contain"
                />
              </div>
            ) : (
              <div className="p-4 bg-muted/20 rounded-xl border border-border/80 flex flex-col items-center justify-center space-y-2">
                <div className="w-full h-[220px] sm:h-[260px] flex items-center justify-center">
                  <BraceletCanvas compact={true} readOnly={true} defaultViewMode="preview" customPlacedBeads={placedArray} />
                </div>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  360° Closed-Loop Artisan Bracelet Assembly ({placedArray.length} Beads)
                </span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full hover:opacity-90 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border max-w-md w-full rounded-2xl p-6 relative shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">
                Edit Order #{order.id.slice(0, 8).toUpperCase()}
              </h3>
              <p className="text-xs text-muted-foreground">Update customer delivery details or status</p>
            </div>

            <form
              action={async (formData: FormData) => {
                await updateOrderDetails(order.id, formData);
                setIsEditOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Customer Name</label>
                <input
                  name="customer_name"
                  defaultValue={order.customer_name || ""}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={order.email || ""}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Phone</label>
                  <input
                    name="phone"
                    defaultValue={order.phone || ""}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Wrist Size (Inches)</label>
                <input
                  name="wrist_inches"
                  type="number"
                  step="0.1"
                  defaultValue={order.wrist_inches || 7.0}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Delivery Address</label>
                <textarea
                  name="address"
                  rows={2}
                  defaultValue={order.address || ""}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Order Status</label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs capitalize font-semibold"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]?.label ?? s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-2 border border-border rounded-full text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 gold-shimmer text-on-primary-container py-2 rounded-full text-xs font-bold shadow-md hover:scale-[1.02]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
