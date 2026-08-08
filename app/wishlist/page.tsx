"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/ecom/Header";
import { Footer } from "@/components/ecom/Footer";
import { BottomNavigation } from "@/components/ecom/BottomNavigation";
import { Toast } from "@/components/ecom/Toast";
import { PRODUCTS_CATALOG } from "@/lib/ecomData";
import { useEcomStore } from "@/store/ecomStore";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, addToast } = useEcomStore();

  const savedProducts = PRODUCTS_CATALOG.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground font-normal">
            Your Wishlist ({savedProducts.length})
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Handcrafted pieces saved for later.
          </p>
        </div>

        {savedProducts.length === 0 ? (
          <div className="clay-panel p-12 text-center max-w-md mx-auto my-12 space-y-4 bg-white">
            <div className="text-4xl">♥</div>
            <h2 className="font-heading text-xl text-foreground">Your Wishlist is Empty</h2>
            <p className="text-xs text-muted-foreground">
              Save your favorite handmade bracelets, wooden strands, and clay jewelry by tapping the heart icon.
            </p>
            <Link
              href="/shop"
              className="bg-[#7c2d12] text-white text-xs font-bold px-6 py-3 rounded-full inline-block shadow-md"
            >
              Explore Jewelry Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {savedProducts.map((product) => (
              <div
                key={product.id}
                className="clay-panel overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-lg bg-white"
              >
                <div className="relative aspect-square w-full bg-muted/20 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Remove from Wishlist"
                  >
                    <svg
                      className="w-4 h-4 text-red-500 fill-red-500 stroke-red-500"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {product.material}
                    </span>
                    <Link href={`/shop/${product.id}`}>
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors mt-0.5">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
                    <span className="text-sm font-bold text-foreground">₹{product.price}</span>
                    <button
                      onClick={() => {
                        addToCart(product);
                        addToast("Moved to Bag", `${product.name} moved to your shopping bag.`, "success");
                      }}
                      className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm"
                    >
                      + Move to Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNavigation />
      <Toast />
    </div>
  );
}
