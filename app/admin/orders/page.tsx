import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { deleteOrder, updateOrderStatus } from "./actions";
import { PlacedBead } from "@/lib/types";

export const metadata: Metadata = {
  title: "Order Dashboard — Beadu Admin",
  description: "View, manage, and delete all bracelet orders",
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "bg-gray-100 text-gray-600 border-gray-200" },
  confirmed: { label: "Confirmed", color: "bg-amber-50 text-amber-700 border-amber-200" },
  shipped:   { label: "Shipped",   color: "bg-blue-50 text-blue-700 border-blue-200" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200" },
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
    // Supabase not yet configured — return empty so the page still renders
    console.warn("Supabase not configured:", e);
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
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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
      <summary className="cursor-pointer px-2.5 py-1 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 rounded-lg flex items-center gap-1 select-none">
        <span className="material-symbols-outlined text-sm">edit</span>
        Edit
      </summary>
      <div className="absolute right-0 top-8 z-50 w-72 bg-card border border-border rounded-xl p-4 shadow-xl space-y-3 animate-in fade-in">
        <h4 className="text-xs font-bold text-foreground flex items-center justify-between">
          Edit Order #{order.id.slice(0, 6)}
        </h4>
        <form
          action={async (formData: FormData) => {
            "use server";
            const { updateOrderDetails } = await import("./actions");
            await updateOrderDetails(order.id, formData);
          }}
          className="space-y-2 text-xs"
        >
          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Customer Name</label>
            <input
              name="customer_name"
              defaultValue={order.customer_name || ""}
              className="w-full px-2 py-1 bg-background border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={order.email || ""}
              className="w-full px-2 py-1 bg-background border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Phone</label>
            <input
              name="phone"
              defaultValue={order.phone || ""}
              className="w-full px-2 py-1 bg-background border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Wrist (Inches)</label>
            <input
              name="wrist_inches"
              type="number"
              step="0.1"
              defaultValue={order.wrist_inches || 7.0}
              className="w-full px-2 py-1 bg-background border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Address</label>
            <textarea
              name="address"
              rows={2}
              defaultValue={order.address || ""}
              className="w-full px-2 py-1 bg-background border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-0.5">Status</label>
            <select
              name="status"
              defaultValue={order.status}
              className="w-full px-2 py-1 bg-background border border-border rounded-md"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]?.label ?? s}
                </option>
              ))}
            </select>
          </div>
          <div className="pt-1 flex gap-2">
            <button
              type="submit"
              className="w-full py-1.5 bg-primary text-primary-foreground font-bold rounded-md hover:opacity-90 text-xs"
            >
              Save Changes
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
      className="flex items-center gap-2"
      action={async (formData: FormData) => {
        "use server";
        const status = formData.get("status") as string;
        await updateOrderStatus(id, status);
      }}
    >
      <select
        name="status"
        defaultValue={current}
        className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary/60"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]?.label ?? s}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="px-2.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
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
    <div className="min-h-screen bg-muted/30 font-sans">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-30 bg-background border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to Site</span>
          </Link>
          <span className="text-border select-none">|</span>
          <span className="font-display text-lg text-primary font-light">Beadu Admin</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {orders.length} total order{orders.length !== 1 ? "s" : ""}
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Page Title ── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Order Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All bracelet orders submitted through the builder
          </p>
        </div>

        {/* ── Supabase Not Configured Warning ── */}
        {!isSupabaseConfigured && (
          <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <span className="material-symbols-outlined text-amber-500 text-lg mt-0.5">warning</span>
            <div>
              <p className="font-semibold">Supabase not configured</p>
              <p className="text-xs mt-0.5">
                Add <code className="bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="bg-amber-100 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
                <code className="bg-amber-100 px-1 py-0.5 rounded">.env.local</code> to see real orders.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Orders", value: totals.all,                      icon: "receipt_long",   color: "text-foreground" },
            { label: "Confirmed",    value: totals.confirmed,                 icon: "check_circle",   color: "text-amber-600"  },
            { label: "Shipped",      value: totals.shipped,                   icon: "local_shipping", color: "text-blue-600"   },
            { label: "Revenue",      value: formatPrice(totals.revenue),      icon: "currency_rupee", color: "text-green-600"  },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3"
            >
              <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Orders Table ── */}
        {orders.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-xs">
            <span className="material-symbols-outlined text-5xl text-muted-foreground/40">inbox</span>
            <p className="mt-4 text-muted-foreground font-semibold">No orders yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Once customers submit bracelets they&apos;ll appear here
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Order", "Customer", "Beads", "Wrist", "Price", "Status", "Date", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => {
                    const statusStyle = STATUS_LABELS[order.status] ?? STATUS_LABELS.draft;
                    const beadCount = Array.isArray(order.placed_beads) ? order.placed_beads.length : 0;

                    return (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                        {/* Order ID + Preview */}
                        <td className="px-4 py-4">
                          <span className="font-mono text-xs font-bold text-primary">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          {order.preview_image_url && (
                            <img
                              src={order.preview_image_url}
                              alt="preview"
                              className="w-10 h-10 object-contain rounded-lg border border-border bg-muted/40 mt-1.5"
                            />
                          )}
                        </td>

                        {/* Customer details */}
                        <td className="px-4 py-4">
                          <p className="font-semibold text-foreground text-xs">{order.customer_name || "—"}</p>
                          <p className="text-muted-foreground text-[11px]">{order.email || "—"}</p>
                          <p className="text-muted-foreground text-[11px]">{order.phone || "—"}</p>
                          {order.address && (
                            <p
                              className="text-muted-foreground text-[10px] mt-0.5 max-w-[140px] truncate"
                              title={order.address}
                            >
                              📍 {order.address}
                            </p>
                          )}
                        </td>

                        {/* Bead count + cord */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-primary">radio_button_checked</span>
                            <span className="font-bold text-foreground">{beadCount}</span>
                            <span className="text-muted-foreground text-xs">beads</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                            {order.cord_type?.replace("_", " ")} cord
                          </p>
                        </td>

                        {/* Wrist size */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-xs font-semibold text-foreground">{order.wrist_inches}&quot;</span>
                          <span className="text-[10px] text-muted-foreground ml-1">
                            ({Math.round(order.wrist_inches * 25.4)}mm)
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4">
                          {order.total_price > 0 ? (
                            <span className="text-sm font-bold text-foreground">{formatPrice(order.total_price)}</span>
                          ) : (
                            <span className="text-green-600 text-xs font-bold">Free</span>
                          )}
                        </td>

                        {/* Status badge + update form */}
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusStyle.color}`}
                            >
                              {statusStyle.label}
                            </span>
                            <StatusSelector id={order.id} current={order.status} />
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <EditOrderForm order={order} />
                            <DeleteButton id={order.id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="border-t border-border px-4 py-3 bg-muted/20 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Total revenue:{" "}
                <strong className="text-foreground">{formatPrice(totals.revenue)}</strong>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
