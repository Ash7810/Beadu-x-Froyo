import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { deleteOrder, updateOrderStatus, updateOrderDetails } from "./actions";
import { OrderCardClient } from "./OrderCardClient";
import { PlacedBead } from "@/lib/types";

export const metadata: Metadata = {
  title: "Order Dashboard — Beadu Admin",
  description: "View, manage, edit, and fulfill all bracelet orders",
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "bg-gray-100 text-gray-600 border-gray-200" },
  confirmed: { label: "Confirmed", color: "bg-amber-50 text-amber-700 border-amber-200" },
  shipped:   { label: "Shipped",   color: "bg-blue-50 text-blue-700 border-blue-200" },
  delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const ALL_STATUSES = ["draft", "confirmed", "shipped", "delivered"];

type Order = {
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

async function fetchOrders(): Promise<Order[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("bracelets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return [];
    }
    return (data as Order[]) ?? [];
  } catch (e) {
    return [];
  }
}

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

// ─── Delete Button ────────────────────────────────────────────────────────────
function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await deleteOrder(id);
      }}
    >
      <button
        type="submit"
        className="px-2.5 py-1 text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
        title="Delete this order permanently"
      >
        <span className="material-symbols-outlined text-sm">delete</span>
        Delete
      </button>
    </form>
  );
}

// ─── Edit Order Modal/Form ──────────────────────────────────────────────────
function EditOrderForm({ order }: { order: Order }) {
  return (
    <details className="relative">
      <summary className="cursor-pointer px-3 py-1 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 rounded-full transition-colors flex items-center gap-1 select-none">
        <span className="material-symbols-outlined text-sm">edit</span>
        Edit
      </summary>
      <div className="absolute right-0 top-9 z-50 w-80 bg-card border border-border/80 rounded-2xl p-5 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <h4 className="text-xs font-bold text-foreground">
            Edit Order #{order.id.slice(0, 8).toUpperCase()}
          </h4>
          <span className="text-[10px] text-muted-foreground">Admin Override</span>
        </div>

        <form
          action={async (formData: FormData) => {
            "use server";
            await updateOrderDetails(order.id, formData);
          }}
          className="space-y-2.5 text-xs"
        >
          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Customer Name</label>
            <input
              name="customer_name"
              defaultValue={order.customer_name || ""}
              className="w-full px-3 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={order.email || ""}
                className="w-full px-2.5 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Phone</label>
              <input
                name="phone"
                defaultValue={order.phone || ""}
                className="w-full px-2.5 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Wrist Size (Inches)</label>
            <input
              name="wrist_inches"
              type="number"
              step="0.1"
              defaultValue={order.wrist_inches || 7.0}
              className="w-full px-3 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Delivery Address</label>
            <textarea
              name="address"
              rows={2}
              defaultValue={order.address || ""}
              className="w-full px-3 py-1.5 bg-background border border-border/80 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Order Status</label>
            <select
              name="status"
              defaultValue={order.status}
              className="w-full px-3 py-1.5 bg-background border border-border/80 rounded-lg text-xs font-semibold capitalize"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]?.label ?? s}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="w-full gold-shimmer text-on-primary-container py-2 font-bold rounded-full text-xs shadow-md transition-all hover:scale-[1.02]"
            >
              Save Order Details
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}

// ─── Status Selector ──────────────────────────────────────────────────────────
function StatusSelector({ id, current }: { id: string; current: string }) {
  return (
    <form
      className="flex items-center gap-1.5"
      action={async (formData: FormData) => {
        "use server";
        const status = formData.get("status") as string;
        await updateOrderStatus(id, status);
      }}
    >
      <select
        name="status"
        defaultValue={current}
        className="text-[11px] font-semibold border border-border/80 rounded-lg px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary/60"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]?.label ?? s}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="px-2 py-1 text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
      >
        Save
      </button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default async function AdminOrdersPage() {
  const orders = await fetchOrders();

  const totals = {
    all:       orders.length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped:   orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue:   orders.reduce((sum, o) => sum + (o.total_price ?? 0), 0),
  };

  const isSupabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-card via-background to-card border border-border/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Order Fulfillment Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review custom customer designs, track shipping status, and update customer addresses.
            </p>
          </div>
        </div>
        <div className="text-xs font-bold px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
          {orders.length} Active {orders.length === 1 ? "Order" : "Orders"}
        </div>
      </div>

      {/* Supabase Not Configured Warning */}
      {!isSupabaseConfigured && (
        <div className="flex items-start gap-3 px-5 py-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
          <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5">warning</span>
          <div>
            <p className="font-bold">Database connection notice</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local to persist live customer orders.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: totals.all,                      icon: "receipt_long",   color: "text-foreground", bg: "bg-muted/50" },
          { label: "Confirmed",    value: totals.confirmed,                 icon: "check_circle",   color: "text-amber-600",  bg: "bg-amber-500/10" },
          { label: "Shipped",      value: totals.shipped,                   icon: "local_shipping", color: "text-blue-600",   bg: "bg-blue-500/10" },
          { label: "Revenue",      value: formatPrice(totals.revenue),      icon: "currency_rupee", color: "text-emerald-600", bg: "bg-emerald-500/10" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5 transition-all hover:border-primary/40"
          >
            <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-xl ${stat.color}`}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Modern Grid Section */}
      {orders.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-2xl p-16 text-center shadow-xs space-y-2">
          <span className="material-symbols-outlined text-5xl text-muted-foreground/40">inventory_2</span>
          <p className="text-foreground font-bold text-sm">No Customer Orders Yet</p>
          <p className="text-xs text-muted-foreground">
            Custom bracelet orders submitted through the builder will appear here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">orders</span>
              Customer Orders Catalog
            </h2>
            <span className="text-xs text-muted-foreground font-medium">{orders.length} Live Records</span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order, idx) => (
              <OrderCardClient key={order.id} order={order} index={idx + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
