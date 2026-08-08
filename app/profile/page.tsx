"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/ecom/Header";
import { Footer } from "@/components/ecom/Footer";
import { BottomNavigation } from "@/components/ecom/BottomNavigation";
import { useEcomStore, Order } from "@/store/ecomStore";
import { generateDelhiveryTracking } from "@/lib/delhivery";
import { CustomBraceletPreview } from "@/components/builder/CustomBraceletPreview";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "payments" | "support">("profile");
  const [mobileSubView, setMobileSubView] = useState<null | "edit-profile" | "orders" | "addresses" | "payments" | "support">(null);
  
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<"All" | "Delivered" | "In Transit">("All");

  const { orders, addresses, addAddress, removeAddress, setDefaultAddress, addToast, syncDelhiveryAutoStatuses } = useEcomStore();

  useEffect(() => {
    syncDelhiveryAutoStatuses();
  }, [syncDelhiveryAutoStatuses]);

  // Profile Data State
  const [profileData, setProfileData] = useState({
    firstName: "Ananya",
    lastName: "Sharma",
    gender: "female" as "male" | "female",
    email: "ananya.sharma@example.com",
    phone: "+91 98765 43210",
  });
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Address State
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState({
    fullName: "Ananya Sharma",
    street: "Flat 402, Royal Palms, Link Road",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400053",
    phone: "9876543210",
    addressType: "HOME" as "HOME" | "WORK",
  });

  // Support inquiry state
  const [supportOrderRef, setSupportOrderRef] = useState<string>("");
  const [supportMessage, setSupportMessage] = useState<string>("");
  const [supportTickets, setSupportTickets] = useState<Array<{ id: string; orderId: string; date: string; message: string; status: string }>>([
    {
      id: "TICK-9082",
      orderId: orders[0]?.id || "BEADU-8921",
      date: new Date().toLocaleDateString("en-IN"),
      message: "Inquiry regarding wrist size adjustment for custom wooden bead strand.",
      status: "In Progress",
    },
  ]);

  // Payment methods state
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPaymentUpi, setNewPaymentUpi] = useState("");
  const [savedUpiList, setSavedUpiList] = useState([
    { id: "upi-1", provider: "Google Pay UPI", vpa: "ananya@okaxis", isDefault: true },
    { id: "upi-2", provider: "PhonePe UPI", vpa: "ananya.sharma@ybl", isDefault: false },
  ]);

  const handleStartEditAddress = (addr: any) => {
    setEditingAddrId(addr.id);
    setNewAddr({
      fullName: addr.fullName,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      phone: addr.phone,
      addressType: addr.addressType || "HOME",
    });
    setShowAddAddr(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.street || !newAddr.city || !newAddr.zipCode || !newAddr.phone) {
      addToast("Error", "Please fill in all address fields.", "warning");
      return;
    }

    if (editingAddrId) {
      import("@/store/ecomStore").then((m) => {
        const currentAddrs = m.useEcomStore.getState().addresses;
        const updated = currentAddrs.map((a) => (a.id === editingAddrId ? { ...a, ...newAddr } : a));
        m.useEcomStore.setState({ addresses: updated });
      });
      addToast("Address Updated", "Shipping address updated successfully.", "success");
    } else {
      addAddress({ ...newAddr, isDefault: addresses.length === 0 });
      addToast("Address Saved", "Shipping address added to your account.", "success");
    }

    setEditingAddrId(null);
    setShowAddAddr(false);
  };

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    const newTicket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: supportOrderRef || "General Inquiry",
      date: new Date().toLocaleDateString("en-IN"),
      message: supportMessage,
      status: "In Progress",
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    setSupportMessage("");
    setSupportOrderRef("");
    addToast("Ticket Raised", "Our support team will respond within 2 hours.", "success");
  };

  let trackingDetails = null;
  if (selectedTrackingOrder) {
    trackingDetails = generateDelhiveryTracking(
      selectedTrackingOrder.id,
      selectedTrackingOrder.createdAt,
      selectedTrackingOrder.awbNumber
    );
  }

  // Filtered orders list for search & pills
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.items.some((i) => i.product.name.toLowerCase().includes(orderSearchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (orderFilter === "Delivered") return o.status === "Delivered";
    if (orderFilter === "In Transit") return o.status !== "Delivered" && o.status !== "Cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-800 flex flex-col font-sans">
      <Header />

      {/* ========================================================================= */}
      {/* MOBILE APP LAYOUT VIEW (Visible on Mobile / Small Screens) */}
      {/* ========================================================================= */}
      <div className="block md:hidden flex-1 pb-24 bg-[#f1f3f6]">
        {/* MOBILE SUB-VIEW: EDIT PROFILE */}
        {mobileSubView === "edit-profile" ? (
          <div className="bg-white min-h-screen">
            {/* Top Bar */}
            <div className="bg-primary text-white p-4 flex items-center gap-4 shadow-sm">
              <button onClick={() => setMobileSubView(null)} className="text-lg font-bold">
                ←
              </button>
              <h2 className="font-bold text-base">Profile Information</h2>
            </div>

            {/* Blue Brand Banner with Avatar Selector */}
            <div className="bg-primary p-6 text-white text-center flex items-center justify-center gap-6 border-t border-white/20">
              <div
                onClick={() => setProfileData({ ...profileData, gender: "male" })}
                className={`w-20 h-20 rounded-full border-4 ${
                  profileData.gender === "male" ? "border-white scale-105 shadow-lg" : "border-white/40 opacity-70"
                } bg-amber-100 text-slate-900 flex items-center justify-center text-3xl cursor-pointer transition-all`}
              >
                👨
              </div>
              <span className="text-sm font-semibold opacity-80">or</span>
              <div
                onClick={() => setProfileData({ ...profileData, gender: "female" })}
                className={`w-20 h-20 rounded-full border-4 ${
                  profileData.gender === "female" ? "border-white scale-105 shadow-lg" : "border-white/40 opacity-70"
                } bg-rose-100 text-slate-900 flex items-center justify-center text-3xl cursor-pointer transition-all`}
              >
                👩
              </div>
            </div>

            {/* Profile Form Fields */}
            <div className="p-6 space-y-6 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block text-[11px]">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full py-2.5 border-b-2 border-primary outline-none font-bold text-sm text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium block text-[11px]">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full py-2.5 border-b border-slate-300 outline-none font-bold text-sm text-slate-900"
                />
              </div>

              <button
                onClick={() => {
                  setMobileSubView(null);
                  addToast("Profile Updated", "Personal information saved successfully.", "success");
                }}
                className="w-full py-3.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-md active:scale-98 transition-transform"
              >
                SUBMIT
              </button>

              <div className="pt-4 space-y-5 border-t border-slate-100">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Mobile Number</span>
                    <span className="font-bold text-slate-900 text-xs">{profileData.phone}</span>
                  </div>
                  <button
                    onClick={() => addToast("Verification Sent", "OTP sent to registered phone.", "info")}
                    className="text-primary font-bold text-xs hover:underline"
                  >
                    Update
                  </button>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Email ID</span>
                    <span className="font-bold text-slate-900 text-xs">{profileData.email}</span>
                  </div>
                  <button
                    onClick={() => addToast("Verification Sent", "Confirmation link sent to email.", "info")}
                    className="text-primary font-bold text-xs hover:underline"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : mobileSubView === "orders" ? (
          /* MOBILE SUB-VIEW: MY ORDERS LIST */
          <div className="bg-white min-h-screen">
            {/* Top Header Bar */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 sticky top-0 z-10">
              <button onClick={() => setMobileSubView(null)} className="text-lg font-bold text-slate-800">
                ←
              </button>
              <h2 className="font-bold text-base text-slate-900">My Orders</h2>
            </div>

            <div className="p-4 space-y-4">
              {/* Search & Filters */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Search your order..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2">
                {(["All", "Delivered", "In Transit"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      orderFilter === filter
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Orders Roster */}
              <div className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                    <p>No orders found matching your search.</p>
                    <Link href="/shop" className="text-primary font-bold hover:underline block">
                      Shop Jewellery Collections →
                    </Link>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="py-4 space-y-3">
                      {order.items.map((item, idx) => {
                        const isCustom = item.product.id.startsWith("custom") || item.product.category === "Custom Builder";
                        return (
                          <div key={idx} className="flex items-center gap-3 group">
                            {isCustom ? (
                              <CustomBraceletPreview beads={(item.product as any).customBeads} previewImage={item.product.image} size={64} />
                            ) : (
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                <Image src={item.product.image} alt={item.product.name} fill sizes="64px" className="object-cover" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-slate-900">
                                {order.status === "Delivered" ? "Delivered on " : "In Transit • "}
                                <span className="font-normal text-slate-600">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                </span>
                              </p>
                              <p className="text-xs text-slate-600 truncate mt-0.5">{item.product.name}</p>
                            </div>

                            <button
                              onClick={() => setSelectedTrackingOrder(order)}
                              className="text-slate-400 text-lg font-bold group-hover:text-primary transition-colors pr-1"
                            >
                              ›
                            </button>
                          </div>
                        );
                      })}
                      <div className="flex gap-2 text-[10px] font-bold pt-1">
                        <button
                          onClick={() => setSelectedTrackingOrder(order)}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full"
                        >
                          🚚 Live Tracking
                        </button>
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200"
                        >
                          🧾 Tax Invoice
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : mobileSubView === "addresses" ? (
          /* MOBILE SUB-VIEW: SAVED ADDRESSES */
          <div className="bg-white min-h-screen">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 sticky top-0 z-10">
              <button onClick={() => setMobileSubView(null)} className="text-lg font-bold text-slate-800">
                ←
              </button>
              <h2 className="font-bold text-base text-slate-900">Manage Addresses</h2>
            </div>

            <div className="p-4 space-y-4">
              <button
                onClick={() => {
                  setEditingAddrId(null);
                  setNewAddr({ fullName: "", street: "", city: "", state: "", zipCode: "", phone: "", addressType: "HOME" });
                  setShowAddAddr(!showAddAddr);
                }}
                className="w-full py-3 px-4 border border-slate-200 text-primary font-bold text-xs rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <span>+</span>
                <span>{showAddAddr ? "Cancel" : "ADD A NEW ADDRESS"}</span>
              </button>

              {showAddAddr && (
                <form onSubmit={handleSaveAddress} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-xs">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    required
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="10-digit Phone Number *"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Street Address *"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City *"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="p-2.5 bg-white border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Pincode *"
                      required
                      maxLength={6}
                      value={newAddr.zipCode}
                      onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                      className="p-2.5 bg-white border border-slate-300 rounded"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold rounded">
                    Save Address
                  </button>
                </form>
              )}

              <div className="divide-y divide-slate-100">
                {addresses.map((addr) => (
                  <div key={addr.id} className="py-4 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded">
                        {addr.addressType || "HOME"}
                      </span>
                      <button onClick={() => handleStartEditAddress(addr)} className="text-primary font-bold text-[11px]">
                        Edit
                      </button>
                    </div>
                    <p className="font-bold text-slate-900">
                      {addr.fullName} <span className="font-normal text-slate-600 ml-2">{addr.phone}</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : mobileSubView === "payments" ? (
          /* MOBILE SUB-VIEW: SAVED PAYMENTS & UPI */
          <div className="bg-white min-h-screen">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 sticky top-0 z-10">
              <button onClick={() => setMobileSubView(null)} className="text-lg font-bold text-slate-800">
                ←
              </button>
              <h2 className="font-bold text-base text-slate-900">Saved Payments &amp; UPI</h2>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <button
                onClick={() => setShowAddPayment(!showAddPayment)}
                className="w-full py-3 px-4 border border-slate-200 text-primary font-bold rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <span>+</span>
                <span>{showAddPayment ? "Cancel" : "LINK NEW UPI ID"}</span>
              </button>

              {showAddPayment && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <input
                    type="text"
                    placeholder="Enter UPI VPA (e.g. name@upi)"
                    value={newPaymentUpi}
                    onChange={(e) => setNewPaymentUpi(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded"
                  />
                  <button
                    onClick={() => {
                      if (newPaymentUpi.trim()) {
                        setSavedUpiList((prev) => [
                          ...prev,
                          { id: `upi-${Date.now()}`, provider: "Saved UPI", vpa: newPaymentUpi, isDefault: false },
                        ]);
                        addToast("UPI Linked", `VPA ${newPaymentUpi} saved to account.`, "success");
                        setNewPaymentUpi("");
                        setShowAddPayment(false);
                      }
                    }}
                    className="w-full py-2.5 bg-primary text-white font-bold rounded"
                  >
                    Save VPA
                  </button>
                </div>
              )}

              <div className="divide-y divide-slate-100">
                {savedUpiList.map((upi) => (
                  <div key={upi.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{upi.provider}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{upi.vpa}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSavedUpiList((prev) => prev.filter((u) => u.id !== upi.id));
                        addToast("UPI Removed", "VPA deleted from account.", "info");
                      }}
                      className="text-red-500 font-semibold hover:underline text-[11px]"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : mobileSubView === "support" ? (
          /* MOBILE SUB-VIEW: HELP DESK & TICKETS */
          <div className="bg-white min-h-screen">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 sticky top-0 z-10">
              <button onClick={() => setMobileSubView(null)} className="text-lg font-bold text-slate-800">
                ←
              </button>
              <h2 className="font-bold text-base text-slate-900">Help Desk &amp; Tickets</h2>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <form onSubmit={handleAddTicket} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px]">Raise Support Ticket</h4>
                <textarea
                  rows={3}
                  placeholder="Describe your inquiry..."
                  required
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded"
                />
                <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold rounded">
                  Submit Ticket
                </button>
              </form>

              <div className="divide-y divide-slate-100">
                {supportTickets.map((t) => (
                  <div key={t.id} className="py-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{t.id}</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-slate-600">{t.message}</p>
                    <p className="text-[10px] text-slate-400">Submitted: {t.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* MOBILE MAIN DASHBOARD MENU (Mirroring Flipkart App Layout) */
          <div className="space-y-3">
            {/* User Hello Header Banner */}
            <div className="bg-white p-4 flex items-center gap-3 border-b border-slate-200">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-lg shadow-xs">
                AS
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Hello,</span>
                <h2 className="font-bold text-sm text-slate-900">Ananya Sharma</h2>
              </div>
            </div>

            {/* Categorized Menu Roster */}
            <div className="bg-white border-y border-slate-200 divide-y divide-slate-100 text-xs font-semibold">
              {/* Account Settings Section */}
              <div className="p-4 pb-2 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Account Settings
              </div>

              <button
                onClick={() => setMobileSubView("edit-profile")}
                className="w-full px-4 py-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary text-base">👤</span>
                  <span className="text-slate-800">Edit Profile</span>
                </div>
                <span className="text-slate-400 font-normal">›</span>
              </button>

              <button
                onClick={() => setMobileSubView("addresses")}
                className="w-full px-4 py-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary text-base">📍</span>
                  <span className="text-slate-800">Saved Addresses</span>
                </div>
                <span className="text-slate-400 font-normal">›</span>
              </button>

              <button
                onClick={() => setMobileSubView("payments")}
                className="w-full px-4 py-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary text-base">💳</span>
                  <span className="text-slate-800">Saved Credit / Debit &amp; UPI</span>
                </div>
                <span className="text-slate-400 font-normal">›</span>
              </button>

              {/* My Activity Section */}
              <div className="p-4 pb-2 text-slate-400 font-bold uppercase tracking-wider text-[10px] pt-4">
                My Activity
              </div>

              <button
                onClick={() => setMobileSubView("orders")}
                className="w-full px-4 py-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary text-base">📦</span>
                  <span className="text-slate-800">My Orders ({orders.length})</span>
                </div>
                <span className="text-slate-400 font-normal">›</span>
              </button>

              <button
                onClick={() => setMobileSubView("support")}
                className="w-full px-4 py-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary text-base">💬</span>
                  <span className="text-slate-800">Help Desk &amp; Tickets</span>
                </div>
                <span className="text-slate-400 font-normal">›</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP E-COMMERCE DASHBOARD VIEW (Visible on Medium / Large Screens) */}
      {/* ========================================================================= */}
      <main className="hidden md:block flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 pb-24 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="md:col-span-3 space-y-3">
            {/* Top User Greeting Card */}
            <div className="bg-white rounded-sm p-3.5 flex items-center gap-3 border border-slate-200/80 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-lg shrink-0 shadow-xs">
                AS
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-500 font-medium block">Hello,</span>
                <h2 className="font-bold text-sm text-slate-900 truncate">Ananya Sharma</h2>
              </div>
            </div>

            {/* Structured Navigation Panel */}
            <div className="bg-white rounded-sm border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden text-xs">
              {/* MY ORDERS */}
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full p-4 font-bold flex justify-between items-center transition-colors text-left ${
                  activeTab === "orders" ? "bg-sky-50/70 text-primary" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary text-base">📦</span>
                  <span className="uppercase tracking-wider">My Orders</span>
                </div>
                <span className="text-slate-400 font-normal text-sm">›</span>
              </button>

              {/* ACCOUNT SETTINGS SECTION */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-wider text-[11px]">
                  <span>👤</span>
                  <span>Account Settings</span>
                </div>
                <div className="pl-7 space-y-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`block text-left w-full transition-colors ${
                      activeTab === "profile" ? "font-bold text-primary" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab("addresses")}
                    className={`block text-left w-full transition-colors ${
                      activeTab === "addresses" ? "font-bold text-primary" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Manage Addresses
                  </button>
                </div>
              </div>

              {/* PAYMENTS SECTION */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-wider text-[11px]">
                  <span>💳</span>
                  <span>Payments</span>
                </div>
                <div className="pl-7 space-y-2">
                  <button
                    onClick={() => setActiveTab("payments")}
                    className={`block text-left w-full transition-colors ${
                      activeTab === "payments" ? "font-bold text-primary" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Saved UPI &amp; Cards
                  </button>
                </div>
              </div>

              {/* SUPPORT SECTION */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-wider text-[11px]">
                  <span>💬</span>
                  <span>Customer Support</span>
                </div>
                <div className="pl-7 space-y-2">
                  <button
                    onClick={() => setActiveTab("support")}
                    className={`block text-left w-full transition-colors ${
                      activeTab === "support" ? "font-bold text-primary" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Help Desk &amp; Tickets
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <section className="md:col-span-9 bg-white rounded-sm p-6 border border-slate-200/80 shadow-2xs min-h-[520px]">
            {/* 1. PROFILE INFORMATION TAB */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-base text-slate-900">Personal Information</h3>
                    <button
                      onClick={() => setIsEditingEmail(!isEditingEmail)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {isEditingEmail ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-2">Your Gender</span>
                    <div className="flex items-center gap-6 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={profileData.gender === "male"}
                          onChange={() => setProfileData({ ...profileData, gender: "male" })}
                        />
                        <span>Male</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={profileData.gender === "female"}
                          onChange={() => setProfileData({ ...profileData, gender: "female" })}
                        />
                        <span>Female</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-base text-slate-900">Email Address</h3>
                    <button
                      onClick={() => setIsEditingEmail(!isEditingEmail)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {isEditingEmail ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <div className="max-w-md">
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-base text-slate-900">Mobile Number</h3>
                    <button
                      onClick={() => setIsEditingPhone(!isEditingPhone)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {isEditingPhone ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <div className="max-w-md">
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. MANAGE ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <h3 className="font-bold text-base text-slate-900">Manage Addresses</h3>

                <button
                  onClick={() => {
                    setEditingAddrId(null);
                    setNewAddr({ fullName: "", street: "", city: "", state: "", zipCode: "", phone: "", addressType: "HOME" });
                    setShowAddAddr(!showAddAddr);
                  }}
                  className="w-full text-left p-4 rounded border border-slate-200 text-primary font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <span className="text-base">+</span>
                  <span>{showAddAddr ? "Cancel" : "ADD A NEW ADDRESS"}</span>
                </button>

                {showAddAddr && (
                  <form onSubmit={handleSaveAddress} className="p-5 rounded border border-slate-200 bg-slate-50/50 space-y-4 text-xs">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      {editingAddrId ? "Edit Address Details" : "Add New Delivery Address"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        required
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded bg-white"
                      />
                      <input
                        type="text"
                        placeholder="10-digit Phone Number *"
                        required
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Street Address *"
                      required
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="City *"
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded bg-white"
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        required
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded bg-white"
                      />
                      <input
                        type="text"
                        placeholder="6-digit PIN Code *"
                        required
                        maxLength={6}
                        value={newAddr.zipCode}
                        onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded bg-white"
                      />
                    </div>

                    <button type="submit" className="bg-primary text-white font-bold px-6 py-2 rounded text-xs shadow-xs">
                      Save Address
                    </button>
                  </form>
                )}

                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-4 rounded border border-slate-200 bg-white space-y-2 relative text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">
                          {addr.addressType || "HOME"}
                        </span>
                        <button onClick={() => handleStartEditAddress(addr)} className="text-primary font-bold hover:underline text-[11px]">
                          Edit
                        </button>
                      </div>
                      <p className="font-bold text-slate-900">
                        {addr.fullName} <span className="font-normal text-slate-600 ml-2">{addr.phone}</span>
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - <strong className="text-slate-800">{addr.zipCode}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MY ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="font-bold text-base text-slate-900">My Orders</h3>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded border border-slate-200 bg-white p-5 space-y-4 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="font-bold text-slate-900">{order.id}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedTrackingOrder(order)}
                            className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded"
                          >
                            🚚 Live Tracking
                          </button>
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded border border-slate-200"
                          >
                            🧾 Tax Invoice
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CustomBraceletPreview beads={(item.product as any).customBeads} previewImage={item.product.image} size={52} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                              <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.product.price}</p>
                            </div>
                            <span className="font-bold text-slate-900">₹{item.product.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PAYMENTS TAB */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <h3 className="font-bold text-base text-slate-900">Saved UPI &amp; Cards</h3>
                <div className="space-y-3 text-xs">
                  {savedUpiList.map((upi) => (
                    <div key={upi.id} className="p-4 rounded border border-slate-200 bg-white flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">{upi.provider}</p>
                        <p className="text-slate-500 font-mono text-[11px]">{upi.vpa}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. SUPPORT TAB */}
            {activeTab === "support" && (
              <div className="space-y-6">
                <h3 className="font-bold text-base text-slate-900">Help Desk &amp; Tickets</h3>
                <form onSubmit={handleAddTicket} className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3 text-xs">
                  <textarea
                    rows={3}
                    placeholder="Describe inquiry..."
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded"
                  />
                  <button type="submit" className="bg-primary text-white font-bold px-6 py-2 rounded">
                    Submit Ticket
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Tracking Modal */}
      {selectedTrackingOrder && trackingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedTrackingOrder(null)} />
          <div className="relative bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl space-y-4 z-10 text-xs border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">Live Order Tracking ({selectedTrackingOrder.id})</h3>
              <button onClick={() => setSelectedTrackingOrder(null)}>✕</button>
            </div>
            <p className="font-bold text-primary">Estimated Delivery: {trackingDetails.estimatedDeliveryDate}</p>
            <div className="space-y-3">
              {trackingDetails.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="font-bold">{step.completed ? "✓" : "○"}</span>
                  <div>
                    <p className="font-bold">{step.status}</p>
                    <p className="text-[11px] text-slate-500">{step.location} • {step.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedInvoiceOrder(null)} />
          <div className="relative bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl space-y-4 z-10 text-xs border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">Tax Invoice (#{selectedInvoiceOrder.id})</h3>
              <button onClick={() => setSelectedInvoiceOrder(null)}>✕</button>
            </div>
            <p className="font-bold text-slate-900">Total Paid: ₹{selectedInvoiceOrder.total}</p>
            <button onClick={() => window.print()} className="bg-primary text-white font-bold px-4 py-2 rounded">
              🖨️ Print PDF
            </button>
          </div>
        </div>
      )}

      <Footer />
      <BottomNavigation />
    </div>
  );
}
