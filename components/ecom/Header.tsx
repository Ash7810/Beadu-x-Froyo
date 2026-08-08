"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useEcomStore } from "@/store/ecomStore";
import { PRODUCTS_CATALOG } from "@/lib/ecomData";
import { MobileSidebar } from "./MobileSidebar";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { cart, wishlist, searchQuery, setSearchQuery, getCartItemCount } = useEcomStore();

  const searchRef = useRef<HTMLDivElement>(null);
  const cartCount = getCartItemCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSuggestions = searchQuery.trim()
    ? PRODUCTS_CATALOG.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.material.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border/50 transition-all duration-300">
        {/* Top Announcement Bar */}
        <div className="bg-primary/10 border-b border-primary/20 text-xs py-1.5 px-4 text-center text-primary font-medium flex items-center justify-center gap-2">
          <span>✨ Handmade with Love in India • Free Express Insured Shipping across India</span>
        </div>

        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-12 py-3">
          {/* Mobile Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted/80 transition-colors"
              aria-label="Open Mobile Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/beadu-logo.png"
                alt="Beadu"
                width={140}
                height={48}
                style={{ width: "auto" }}
                className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-sm font-medium text-muted-foreground font-sans">
            <Link href="/" className="hover:text-primary transition-colors">
              Home to Handmade Jewellery
            </Link>
            <Link href="/shop" className="hover:text-primary transition-colors">
              Shop
            </Link>
            <Link href="/cart" className="hover:text-primary transition-colors">
              Cart
            </Link>
            <Link href="/checkout" className="hover:text-primary transition-colors">
              Checkout
            </Link>
            <Link href="/profile" className="hover:text-primary transition-colors">
              My account
            </Link>
          </nav>

          {/* Search Box & Action Icons */}
          <div className="flex items-center gap-3">
            {/* Instant Search Bar */}
            <div ref={searchRef} className="relative hidden sm:block w-48 md:w-64 lg:w-80 xl:w-96">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bracelets, beads..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      setSearchOpen(false);
                      if (typeof window !== "undefined") {
                        window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
                      }
                    }
                  }}
                  className="w-full bg-muted/60 text-foreground text-xs rounded-full pl-9 pr-4 py-2 border border-border/80 focus:outline-none focus:border-primary focus:bg-background transition-all"
                />
                <svg
                  className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Suggestions Overlay */}
              {searchOpen && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border/60">
                    Products ({filteredSuggestions.length})
                  </div>
                  {filteredSuggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/shop/${item.id}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 p-2.5 hover:bg-muted/60 transition-colors"
                    >
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                        <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">₹{item.price}</p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/shop?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setSearchOpen(false)}
                    className="block p-2 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-border/60"
                  >
                    View All Results →
                  </Link>
                </div>
              )}
            </div>

            {/* Customizer CTA Button */}
            <Link
              href="/builder"
              className="gold-shimmer text-on-primary-container px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1"
            >
              <span>Customizer</span>
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-full hover:bg-muted/80 text-foreground transition-colors"
              aria-label="Wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {mounted && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-muted/80 text-foreground transition-colors"
              aria-label="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-white rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
