"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { PRODUCTS_CATALOG, Product } from "@/lib/ecomData";
import { useEcomStore } from "@/store/ecomStore";

export function FeaturedSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { cart, addToCart, toggleWishlist, isInWishlist, updateQuantity } = useEcomStore();

  const featuredProducts = PRODUCTS_CATALOG.filter((p) => p.isBestSeller || p.isNewArrival);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-primary font-heading">
              Artisan Picks
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl text-foreground font-normal mt-1">
              Best Sellers & New Arrivals
            </h2>
          </div>

          {/* Desktop Arrow Controls */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center transition-colors shadow-sm"
              aria-label="Scroll Previous"
            >
              ←
            </button>
            <button
              onClick={scrollRight}
              className="w-10 h-10 rounded-full border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center transition-colors shadow-sm"
              aria-label="Scroll Next"
            >
              →
            </button>
          </div>
        </div>

        {/* Horizontal Slider */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-6 snap-x"
        >
          {featuredProducts.map((product) => {
            const isFav = isInWishlist(product.id);
            const cartItem = cart.find((item) => item.product.id === product.id);

            return (
              <div
                key={product.id}
                className="w-[200px] sm:w-[260px] flex-shrink-0 clay-panel overflow-hidden flex flex-col justify-between group snap-start transition-all duration-300 hover:shadow-lg"
              >
                {/* Product Image Panel */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 200px, 260px"
                    className="object-cover"
                  />

                  {/* Badge */}
                  {product.isBestSeller && (
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      Best Seller
                    </span>
                  )}
                  {product.isNewArrival && !product.isBestSeller && (
                    <span className="absolute top-3 left-3 bg-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      New
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-foreground flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Toggle Wishlist"
                  >
                    <svg
                      className={`w-4 h-4 transition-all duration-300 ${
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

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {product.material}
                    </span>
                    <Link href={`/shop/${product.id}`}>
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors mt-0.5">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                      <span className="text-sm sm:text-base font-bold text-foreground">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through ml-1.5">
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
      </div>
    </section>
  );
}
