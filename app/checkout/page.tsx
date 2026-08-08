"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/ecom/Header";
import { Footer } from "@/components/ecom/Footer";
import { BottomNavigation } from "@/components/ecom/BottomNavigation";
import { Toast } from "@/components/ecom/Toast";
import { useEcomStore, Address } from "@/store/ecomStore";
import { initializeSMEPayTransaction } from "@/lib/smePay";
import { checkDelhiveryServiceability } from "@/lib/delhivery";
import { CustomBraceletPreview } from "@/components/builder/CustomBraceletPreview";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    addresses,
    addAddress,
    createOrder,
    getCartSubtotal,
    getGiftWrapTotal,
    getPlatformFee,
    getGrandTotal,
    addToast,
  } = useEcomStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMode, setPaymentMode] = useState<
    "SME_PAY_UPI" | "SME_PAY_CARD" | "SME_PAY_NETBANKING" | "COD"
  >("SME_PAY_UPI");
  const [isProcessing, setIsProcessing] = useState(false);

  const [newAddr, setNewAddr] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const subtotal = getCartSubtotal();
  const giftWrapFee = getGiftWrapTotal();
  const platformFee = getPlatformFee();
  const grandTotal = getGrandTotal();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-16 text-center">
          <div className="clay-panel p-8 max-w-md mx-auto space-y-4">
            <h1 className="font-heading text-2xl">Your Bag is Empty</h1>
            <p className="text-xs text-muted-foreground">Add items to your cart before proceeding to checkout.</p>
            <Link href="/shop" className="bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-full inline-block">
              Go to Shop
            </Link>
          </div>
        </main>
        <Footer />
        <BottomNavigation />
        <Toast />
      </div>
    );
  }

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.street || !newAddr.city || !newAddr.zipCode || !newAddr.phone) {
      addToast("Missing Fields", "Please complete all address details.", "warning");
      return;
    }

    const pinCheck = checkDelhiveryServiceability(newAddr.zipCode);
    if (!pinCheck.serviceable) {
      addToast("Invalid PIN", pinCheck.message, "warning");
      return;
    }

    addAddress({ ...newAddr, isDefault: true });
    setShowNewAddressForm(false);
    setNewAddr({ fullName: "", street: "", city: "", state: "", zipCode: "", phone: "" });
  };

  const handlePlaceOrder = async () => {
    const selectedAddr = addresses.find((a) => a.id === selectedAddressId) || (addresses.length > 0 ? addresses[0] : null);
    if (!selectedAddr) {
      setShowNewAddressForm(true);
      addToast("Address Required", "Please fill in your shipping address details to proceed.", "warning");
      return;
    }

    setIsProcessing(true);

    try {
      // SME Pay Transaction Handshake
      const payRes = await initializeSMEPayTransaction({
        orderId: `TMP-${Date.now()}`,
        amount: grandTotal,
        customerName: selectedAddr.fullName,
        customerEmail: "customer@beadu.in",
        customerPhone: selectedAddr.phone,
        paymentMode,
      });

      if (payRes.success) {
        const newOrder = createOrder(selectedAddr, payRes.paymentMode, payRes.transactionId);
        router.push("/profile");
      } else {
        addToast("Payment Failed", "Payment gateway encountered an issue. Please try again.", "warning");
      }
    } catch {
      addToast("Error", "Could not complete transaction. Please try again.", "warning");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-10 lg:px-12 py-8 pb-24 md:pb-8">
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal mb-8">
          Checkout &amp; Shipping Terminal
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Shipping Address & Payment Selection */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Address Selection Radio Matrix */}
            <div className="clay-panel p-6 bg-white space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border/40">
                <h3 className="font-heading text-xl text-foreground">1. Select Shipping Address</h3>
                <button
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {showNewAddressForm ? "Cancel" : "+ Add New Address"}
                </button>
              </div>

              {/* Saved Address Radio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30"
                          : "border-border/60 hover:border-primary/40 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-foreground">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                      </p>
                      <p className="text-xs font-semibold text-foreground mt-2">📞 {addr.phone}</p>
                    </div>
                  );
                })}
              </div>

              {/* Inline Add Address Form */}
              {showNewAddressForm && (
                <form onSubmit={handleAddNewAddress} className="pt-4 border-t border-border/40 space-y-4 animate-in fade-in">
                  <h4 className="text-xs font-bold uppercase text-foreground">New Address Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      required
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="clay-input w-full text-xs"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="clay-input w-full text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Street Address *"
                      required
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="clay-input w-full text-xs sm:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="City *"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="clay-input w-full text-xs"
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="clay-input w-full text-xs"
                    />
                    <input
                      type="text"
                      placeholder="6-digit PIN Code *"
                      required
                      maxLength={6}
                      value={newAddr.zipCode}
                      onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                      className="clay-input w-full text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm"
                  >
                    Save Address & Select
                  </button>
                </form>
              )}
            </div>

            {/* Step 2: Payment Gateway Selection */}
            <div className="clay-panel p-6 bg-white space-y-4">
              <h3 className="font-heading text-xl text-foreground pb-3 border-b border-border/40">
                2. Select Payment Method
              </h3>

              <div className="space-y-3">
                {/* Instant UPI */}
                <label
                  onClick={() => setPaymentMode("SME_PAY_UPI")}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMode === "SME_PAY_UPI"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">Instant UPI (GPay / PhonePe / Paytm)</p>
                      <p className="text-[10px] text-muted-foreground">Instant payment authorization</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymode"
                    checked={paymentMode === "SME_PAY_UPI"}
                    onChange={() => {}}
                    className="accent-primary"
                  />
                </label>

                {/* Credit / Debit Card */}
                <label
                  onClick={() => setPaymentMode("SME_PAY_CARD")}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMode === "SME_PAY_CARD"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💳</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">Credit / Debit Card (Visa / Mastercard / RuPay)</p>
                      <p className="text-[10px] text-muted-foreground">Secure encrypted card processing</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymode"
                    checked={paymentMode === "SME_PAY_CARD"}
                    onChange={() => {}}
                    className="accent-primary"
                  />
                </label>

                {/* Net Banking */}
                <label
                  onClick={() => setPaymentMode("SME_PAY_NETBANKING")}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMode === "SME_PAY_NETBANKING"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏦</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">Net Banking</p>
                      <p className="text-[10px] text-muted-foreground">All major Indian banks supported</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymode"
                    checked={paymentMode === "SME_PAY_NETBANKING"}
                    onChange={() => {}}
                    className="accent-primary"
                  />
                </label>

                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMode("COD")}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMode === "COD"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💵</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">Cash on Delivery (COD)</p>
                      <p className="text-[10px] text-muted-foreground">Pay cash upon doorstep delivery</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymode"
                    checked={paymentMode === "COD"}
                    onChange={() => {}}
                    className="accent-primary"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Items Snapshot & Order Summary */}
          <div className="lg:col-span-4 clay-panel p-6 bg-white space-y-6 sticky top-28">
            <h3 className="font-heading text-xl text-foreground pb-3 border-b border-border/40">
              Items ({cart.length})
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {cart.map((item) => {
                const isCustom = item.product.id.startsWith("custom") || item.product.category === "Custom Builder";
                const img = item.product.image;
                return (
                  <div key={item.product.id} className="flex gap-3 items-center text-xs">
                    {isCustom ? (
                      <CustomBraceletPreview beads={(item.product as any).customBeads} size={44} />
                    ) : (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border flex-shrink-0">
                        <Image src={img} alt={item.product.name} fill sizes="40px" className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{item.product.name}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">Qty: {item.quantity} × ₹{item.product.price}</p>
                    </div>
                    <span className="font-bold text-foreground">₹{item.product.price * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-xs font-medium pt-3 border-t border-border/40">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="text-foreground font-bold">₹{subtotal}</span>
              </div>
              {giftWrapFee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Gift Wrap Fee:</span>
                  <span className="text-foreground font-bold">₹{giftWrapFee}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee:</span>
                <span className="text-foreground font-bold">₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Express Insured Shipping:</span>
                <span className="text-green-700 font-bold">FREE</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between items-baseline">
                <span className="text-sm font-bold text-foreground">Total Payable:</span>
                <span className="text-2xl font-bold text-foreground">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-[#7c2d12] hover:bg-[#9a3412] text-white text-xs font-bold uppercase tracking-wider py-4 rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Processing Order...</span>
              ) : (
                <span>Pay ₹{grandTotal} & Complete Order</span>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNavigation />
      <Toast />
    </div>
  );
}
