"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/ecom/Header";
import { Footer } from "@/components/ecom/Footer";
import { BottomNavigation } from "@/components/ecom/BottomNavigation";
import { Toast } from "@/components/ecom/Toast";
import { PRODUCTS_CATALOG, PRODUCT_CATEGORIES, MATERIAL_FILTERS, Product } from "@/lib/ecomData";
import { useEcomStore } from "@/store/ecomStore";

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("All Materials");
  const [maxPrice, setMaxPrice] = useState<number>(1200);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [localSearch, setLocalSearch] = useState<string>(initialQuery);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { cart, addToCart, toggleWishlist, isInWishlist, updateQuantity } = useEcomStore();

  useEffect(() => {
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    if (query !== null) setLocalSearch(query);
    if (category !== null) setSelectedCategory(category);
  }, [searchParams]);

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 500);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS_CATALOG.filter((p) => {
      // Category filter
      if (selectedCategory !== "All" && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Material filter
      if (selectedMaterial !== "All Materials" && p.material !== selectedMaterial) {
        return false;
      }
      // Price filter
      if (p.price > maxPrice) {
        return false;
      }
      // Search query
      if (
        localSearch.trim() &&
        !p.name.toLowerCase().includes(localSearch.toLowerCase()) &&
        !p.description.toLowerCase().includes(localSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [selectedCategory, selectedMaterial, maxPrice, localSearch, sortBy]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedMaterial("All Materials");
    setMaxPrice(1200);
    setLocalSearch("");
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-10 lg:px-12 py-8 pb-24 md:pb-8">
        {/* Page Header */}
        <div className="mb-6 space-y-1">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground">
            Artisan Handmade Jewellery Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Explore authentic Indian handmade wooden, glass, terracotta clay, &amp; gemstone creations
          </p>
        </div>

        {/* Quick Category Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search catalog..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full clay-input py-2 text-xs"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-3 top-2.5 text-muted-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden px-4 py-2 bg-muted rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <span>⚙ Filters</span>
            </button>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-muted-foreground font-semibold">
              Showing {filteredProducts.length} items
            </span>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="clay-input py-2 px-3 text-xs font-semibold bg-background"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Main Grid Split: Sidebar + Products */}
        <div className="flex gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block w-1/4 clay-panel p-6 sticky top-28 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-border/40">
              <h3 className="font-heading text-lg font-normal text-foreground">Filters</h3>
              <button onClick={clearFilters} className="text-[11px] text-primary font-bold hover:underline">
                Reset All
              </button>
            </div>

            {/* Material Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Material</h4>
              <div className="space-y-1.5">
                {MATERIAL_FILTERS.map((mat) => (
                  <label key={mat} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="material"
                      checked={selectedMaterial === mat}
                      onChange={() => setSelectedMaterial(mat)}
                      className="accent-primary"
                    />
                    <span>{mat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Max Price:</span>
                <span className="text-primary font-bold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="199"
                max="1200"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </aside>

          {/* Product Grid Container */}
          <div className="flex-1 w-full">
            {filteredProducts.length === 0 ? (
              <div className="clay-panel p-12 text-center space-y-4 my-8">
                <p className="text-3xl">🔍</p>
                <h3 className="font-heading text-xl text-foreground">No Items Found</h3>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your filters or search term to discover more pieces.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => {
                  const isFav = isInWishlist(product.id);
                  const cartItem = cart.find((i) => i.product.id === product.id);

                  return (
                    <div
                      key={product.id}
                      className="clay-panel overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-lg bg-white"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square w-full bg-muted/20 overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          className="object-cover"
                        />

                        {/* Wishlist Toggle */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-xs shadow-md hover:scale-110 active:scale-95 transition-transform"
                          aria-label="Wishlist"
                        >
                          <svg
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
                              isFav ? "text-red-500 fill-red-500 stroke-red-500 scale-110" : "text-gray-400 fill-none stroke-current"
                            }`}
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      </div>

                      {/* Info & CTA */}
                      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2">
                        <div>
                          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">
                            {product.material}
                          </span>
                          <Link href={`/shop/${product.id}`}>
                            <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors mt-0.5">
                              {product.name}
                            </h3>
                          </Link>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
                          <div>
                            <span className="text-xs sm:text-base font-bold text-foreground">
                              ₹{product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] sm:text-xs text-muted-foreground line-through ml-1">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>

                          {cartItem ? (
                            <div className="w-20 h-8 flex items-center justify-between bg-[#f9fafb] border border-primary/40 rounded-full px-1 shadow-xs shrink-0 select-none">
                              <button
                                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center font-bold text-primary hover:bg-primary/10 rounded-full text-xs active:scale-95 transition-transform"
                                title="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="font-bold text-xs text-primary font-mono w-5 text-center">{cartItem.quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center font-bold text-primary hover:bg-primary/10 rounded-full text-xs active:scale-95 transition-transform"
                                title="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="w-20 h-8 flex items-center justify-center bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-full shadow-xs active:scale-95 transition-all shrink-0"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative bg-background rounded-t-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto space-y-6 animate-in slide-in-from-bottom duration-300 z-10 font-sans">
            {/* Action Sheet Pull Bar */}
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-2" />

            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h3 className="font-heading text-xl font-normal text-foreground">Filter Catalog</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                ✕ Close
              </button>
            </div>

            {/* Material Options */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">Select Material</h4>
              <div className="space-y-2">
                {MATERIAL_FILTERS.map((mat) => (
                  <label key={mat} className="flex items-center gap-3 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="mobile-material"
                      checked={selectedMaterial === mat}
                      onChange={() => setSelectedMaterial(mat)}
                      className="accent-primary"
                    />
                    <span>{mat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between text-xs font-semibold">
                <span>Max Price:</span>
                <span className="text-primary font-bold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="199"
                max="1200"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 bg-muted text-xs font-bold rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-40 w-11 h-11 rounded-full bg-primary text-white font-bold text-lg shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
          aria-label="Back to Top"
        >
          ↑
        </button>
      )}

      <Footer />
      <BottomNavigation />
      <Toast />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-sm font-sans">Loading Catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
