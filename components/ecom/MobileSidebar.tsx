"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex md:hidden">
      {/* Backdrop Tint */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-sm bg-background h-full shadow-2xl flex flex-col justify-between p-6 z-10 font-sans animate-in slide-in-from-left duration-300">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center pb-6 border-b border-border">
            <Image src="/beadu-logo.png" alt="Beadu" width={110} height={40} className="h-8 w-auto object-contain" />
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav List */}
          <nav className="mt-6 flex flex-col gap-2">
            <Link
              href="/"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span>Home to Handmade Jewellery</span>
              <span>→</span>
            </Link>

            <Link
              href="/shop"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span>Shop All Jewelry</span>
              <span>→</span>
            </Link>

            <Link
              href="/builder"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-between"
            >
              <span>✨ Custom Bracelet Builder</span>
              <span>→</span>
            </Link>

            <Link
              href="/cart"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span>Shopping Cart</span>
              <span>→</span>
            </Link>

            <Link
              href="/checkout"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span>Checkout</span>
              <span>→</span>
            </Link>

            <Link
              href="/profile"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span>My Account & Orders</span>
              <span>→</span>
            </Link>
          </nav>
        </div>

        {/* Footer Support Info */}
        <div className="pt-6 border-t border-border text-xs text-muted-foreground space-y-2">
          <p className="font-bold text-foreground">Need Assistance?</p>
          <p>📞 WhatsApp Support: +91 98765 43210</p>
          <p>✉️ Email: hello@beadu.in</p>
          <p className="pt-2 text-[10px] text-muted-foreground/80">© 2026 Beadu • Handmade in India</p>
        </div>
      </div>
    </div>
  );
}
