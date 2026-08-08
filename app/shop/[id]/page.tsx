"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/ecom/Header";
import { Footer } from "@/components/ecom/Footer";
import { BottomNavigation } from "@/components/ecom/BottomNavigation";
import { Toast } from "@/components/ecom/Toast";
import { PRODUCTS_CATALOG, MOCK_REVIEWS } from "@/lib/ecomData";
import { checkDelhiveryServiceability, ServiceabilityResult } from "@/lib/delhivery";
import { useEcomStore } from "@/store/ecomStore";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const isCustom = id.startsWith("custom");
  const product = isCustom
    ? {
        id,
        name: "Bespoke Custom Handcrafted Bracelet",
        price: 499,
        originalPrice: 699,
        rating: 5.0,
        reviewsCount: 1,
        category: "Custom Builder" as const,
        material: "Wooden Beads" as const,
        image: "/beads/pomelli_photoshoot_image_1_1_0726.png",
        images: ["/beads/pomelli_photoshoot_image_1_1_0726.png"],
        description: "Custom artisan bracelet created in the Beadu digital customizer studio.",
        details: [
          "Custom bead strand combination",
          "Hand-finished in signature velvet box",
          "Free Express Insured Shipping across India",
        ],
        inStock: true,
      }
    : PRODUCTS_CATALOG.find((p) => p.id === id) || PRODUCTS_CATALOG[0];

  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [quantity, setQuantity] = useState<number>(1);
  const [pincode, setPincode] = useState<string>("");
  const [pinResult, setPinResult] = useState<ServiceabilityResult | null>(null);

  const { addToCart, toggleWishlist, isInWishlist, addToast } = useEcomStore();
  const isFav = isInWishlist(product.id);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      addToast("Invalid PIN", "Please enter a valid 6-digit PIN code.", "warning");
      return;
    }
    const res = checkDelhiveryServiceability(pincode);
    setPinResult(res);
  };

  // Mock Histogram Ratios for Reviews Breakdown
  const histogram = [
    { stars: 5, percentage: 85, count: 36 },
    { stars: 4, percentage: 10, count: 4 },
    { stars: 3, percentage: 3, count: 1 },
    { stars: 2, percentage: 2, count: 1 },
    { stars: 1, percentage: 0, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 py-8 pb-24 md:pb-8">
        {/* Breadcrumb Links */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 font-medium">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main Product Layout Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mb-16">
          {/* Left Column: Image Gallery System */}
          <div className="space-y-3">
            {/* Active Large Image Container with Arrow Navigation */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-border shadow-md group">
              <Image
                key={selectedImage}
                src={selectedImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                quality={95}
                className="object-cover transition-opacity duration-300"
              />

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-lg shadow-md hover:scale-110 active:scale-95 transition-transform z-10"
                aria-label="Wishlist"
              >
                <svg
                  className={`w-5 h-5 transition-all duration-300 ${
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

              {/* Arrow Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const currentIdx = product.images.indexOf(selectedImage);
                      const prevIdx = currentIdx <= 0 ? product.images.length - 1 : currentIdx - 1;
                      setSelectedImage(product.images[prevIdx]);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                    aria-label="Previous image"
                  >
                    <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const currentIdx = product.images.indexOf(selectedImage);
                      const nextIdx = currentIdx >= product.images.length - 1 ? 0 : currentIdx + 1;
                      setSelectedImage(product.images[nextIdx]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                    aria-label="Next image"
                  >
                    <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {product.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`rounded-full transition-all duration-300 ${
                          selectedImage === imgUrl
                            ? "w-6 h-2 bg-primary"
                            : "w-2 h-2 bg-white/70 hover:bg-white"
                        }`}
                        aria-label={`View image ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Image Counter */}
                  <span className="absolute top-4 left-4 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
                    {product.images.indexOf(selectedImage) + 1} / {product.images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail Gallery Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                      selectedImage === imgUrl
                        ? "border-primary ring-2 ring-primary/20 scale-95 shadow-md"
                        : "border-border/40 opacity-60 hover:opacity-100 hover:border-border"
                    }`}
                  >
                    <Image src={imgUrl} alt={`${product.name} view ${idx + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Controls */}
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                {product.material}
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl text-foreground font-normal mt-3 leading-tight">
                {product.name}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex text-amber-500 text-sm">
                  {"★".repeat(Math.floor(product.rating))}
                </div>
                <span className="text-xs font-bold text-foreground">{product.rating}</span>
                <span className="text-xs text-muted-foreground">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-base text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                Free Delivery Included
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Specifications List */}
            <div className="clay-panel p-4 bg-white/60 space-y-2">
              <h4 className="text-xs font-bold uppercase text-foreground">Artisan Product Details</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {product.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isCustom && (
              <div className="clay-panel p-4 bg-primary/10 border border-primary/30 space-y-2">
                <h4 className="text-xs font-bold text-primary">Custom Artisan Creation</h4>
                <p className="text-xs text-muted-foreground">
                  This piece was customized in our studio. You can edit your strand or design a new piece anytime.
                </p>
                <Link
                  href="/builder"
                  className="gold-shimmer text-on-primary-container text-xs font-bold px-4 py-2 rounded-xl inline-block shadow-sm"
                >
                  Open Custom Builder Studio →
                </Link>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {/* Stepper */}
              <div className="flex items-center justify-between border border-border rounded-2xl bg-white px-4 py-3 sm:w-36">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-foreground hover:text-primary font-bold text-base px-2"
                >
                  −
                </button>
                <span className="text-sm font-bold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-foreground hover:text-primary font-bold text-base px-2"
                >
                  +
                </button>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => {
                  addToCart(product, quantity);
                  addToast("Added to Bag", `${product.name} added to your cart.`, "success");
                }}
                className="flex-1 bg-[#7c2d12] hover:bg-[#9a3412] text-white text-sm font-bold uppercase tracking-wider py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <span>🛒 Add to Shopping Bag</span>
              </button>
            </div>

            {/* Express Delivery Serviceability Box */}
            <div className="clay-panel p-4 bg-muted/30 space-y-3 border border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚚</span>
                  <h4 className="text-xs font-bold text-foreground">Express Delivery Check</h4>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">Live Logistics</span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit PIN Code"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="clay-input flex-1 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-primary/90"
                >
                  Check
                </button>
              </form>

              {pinResult && (
                <div className={`p-3 rounded-xl text-xs font-medium ${pinResult.serviceable ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"}`}>
                  <p className="font-bold">{pinResult.message}</p>
                  {pinResult.serviceable && (
                    <p className="text-[11px] mt-1 opacity-90">
                      Partner: {pinResult.courierPartner} • Cash on Delivery Available
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Histogram Breakdown Section */}
        <section className="border-t border-border/40 pt-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <h3 className="font-heading text-2xl font-normal text-foreground text-center">
              Customer Ratings & Reviews
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center clay-panel p-6 sm:p-8 bg-white">
              {/* Overall Score */}
              <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-border/40 pb-6 md:pb-0">
                <span className="font-heading text-5xl text-foreground font-normal">{product.rating}</span>
                <div className="flex justify-center text-amber-500 text-lg my-1">
                  {"★".repeat(5)}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  Based on {product.reviewsCount} verified reviews
                </p>
              </div>

              {/* Rating Bars */}
              <div className="md:col-span-8 space-y-2">
                {histogram.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3 text-xs">
                    <span className="w-8 text-right font-bold text-foreground">{item.stars} ★</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-muted-foreground font-medium">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews List */}
            <div className="space-y-4">
              {MOCK_REVIEWS.map((rev) => (
                <div key={rev.id} className="clay-panel p-5 bg-white space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">{rev.userName}</span>
                    <span className="text-muted-foreground">{rev.date}</span>
                  </div>
                  <div className="text-amber-500 text-xs">{"★".repeat(rev.rating)}</div>
                  <h5 className="font-heading text-sm text-foreground">&ldquo;{rev.title}&rdquo;</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNavigation />
      <Toast />
    </div>
  );
}
