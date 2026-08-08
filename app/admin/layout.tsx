"use client";

import { useState, useEffect, useRef } from "react";

const ADMIN_PIN = "7810";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("admin_unlocked");
      if (stored === "true") {
        setUnlocked(true);
      }
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    if (!unlocked && !checking && inputRef.current) {
      inputRef.current.focus();
    }
  }, [unlocked, checking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem("admin_unlocked", "true");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 600);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_unlocked");
    setUnlocked(false);
    setPin("");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground animate-pulse">Loading...</span>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 font-sans">
        <div className={`w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 transition-transform ${error ? "animate-shake" : ""}`}>
          {/* Lock Icon */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary">lock</span>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">Admin Access</h1>
              <p className="text-xs text-muted-foreground mt-1">Enter your 4-digit PIN to continue</p>
            </div>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setPin(val);
                  setError(false);
                }}
                placeholder="• • • •"
                className={`w-full text-center text-2xl tracking-[0.5em] font-bold py-4 px-6 bg-background border-2 rounded-xl focus:outline-none transition-colors ${
                  error
                    ? "border-destructive text-destructive focus:ring-2 focus:ring-destructive/30"
                    : "border-border focus:border-primary focus:ring-2 focus:ring-primary/30"
                }`}
                autoComplete="off"
              />
            </div>

            {error && (
              <p className="text-center text-xs font-semibold text-destructive animate-in fade-in">
                Incorrect PIN. Try again.
              </p>
            )}

            <button
              type="submit"
              disabled={pin.length !== 4}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                pin.length === 4
                  ? "gold-shimmer text-on-primary-container hover:scale-[1.02] active:scale-98 shadow-md"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Unlock Dashboard
            </button>
          </form>

          <p className="text-center text-[10px] text-muted-foreground">
            Access is restricted to authorized personnel only.
          </p>
        </div>

        {/* Shake animation */}
        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 font-sans">
      {/* Admin Top Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span className="hidden sm:inline">Back to Site</span>
            </a>
            <span className="text-border select-none">|</span>
            <span className="font-display text-lg text-primary font-light">Beadu Admin</span>
          </div>

          {/* Nav Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-muted/60 p-0.5 rounded-full border border-border/80 text-xs font-medium">
            <a
              href="/admin"
              className="px-3 py-1.5 rounded-full transition-all hover:bg-card hover:text-foreground text-muted-foreground"
            >
              Dashboard
            </a>
            <a
              href="/admin/orders"
              className="px-3 py-1.5 rounded-full transition-all hover:bg-card hover:text-foreground text-muted-foreground"
            >
              Orders
            </a>
            <a
              href="/admin/beads"
              className="px-3 py-1.5 rounded-full transition-all hover:bg-card hover:text-foreground text-muted-foreground"
            >
              Products &amp; Beads
            </a>
            <a
              href="/admin/logistics"
              className="px-3 py-1.5 rounded-full transition-all hover:bg-card hover:text-foreground text-muted-foreground"
            >
              🚚 Logistics &amp; Express Tracking
            </a>
            <a
              href="/admin/payments"
              className="px-3 py-1.5 rounded-full transition-all hover:bg-card hover:text-foreground text-muted-foreground"
            >
              💳 Payment Terminal
            </a>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive border border-border/80 hover:border-destructive/40 rounded-full transition-all"
            title="Lock admin dashboard"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>

        {/* Mobile Admin Nav Strip */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-2 bg-muted/30 border-t border-border/40 text-[11px] font-medium">
          <a href="/admin" className="px-2.5 py-1 rounded-full bg-card border border-border shrink-0 text-foreground">
            Overview
          </a>
          <a href="/admin/orders" className="px-2.5 py-1 rounded-full bg-card border border-border shrink-0 text-foreground">
            Orders
          </a>
          <a href="/admin/beads" className="px-2.5 py-1 rounded-full bg-card border border-border shrink-0 text-foreground">
            Products
          </a>
          <a href="/admin/logistics" className="px-2.5 py-1 rounded-full bg-card border border-border shrink-0 text-foreground">
            🚚 Logistics
          </a>
          <a href="/admin/payments" className="px-2.5 py-1 rounded-full bg-card border border-border shrink-0 text-foreground">
            💳 Payments
          </a>
        </div>
      </div>

      {/* Page Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
