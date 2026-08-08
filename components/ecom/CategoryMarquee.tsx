"use client";

import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  {
    name: "Bracelets",
    image: "/beads/pomelli_photoshoot_image_1_1_0726.png",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-900",
    badge: "Bestseller",
    href: "/shop?category=Bracelets",
  },
  {
    name: "Earrings",
    image: "/beads/pomelli_photoshoot_image_9_16_0726 (1).png",
    color: "bg-rose-500/10 border-rose-500/30 text-rose-900",
    badge: "New",
    href: "/shop?category=Earrings",
  },
  {
    name: "Keychains",
    image: "/beads/pomelli_photoshoot_image_9_16_0726 (2).png",
    color: "bg-purple-500/10 border-purple-500/30 text-purple-900",
    badge: "Trending",
    href: "/shop?category=Keychains",
  },
  {
    name: "Necklaces",
    image: "/beads/pomelli_photoshoot_image_9_16_0726 (3).png",
    color: "bg-sky-500/10 border-sky-500/30 text-sky-900",
    badge: "Luxury",
    href: "/shop?category=Necklaces",
  },
  {
    name: "Charms & Trinkets",
    image: "/beads/pomelli_photoshoot_image_9_16_0726 (4).png",
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-900",
    badge: "Popular",
    href: "/shop?category=Charms",
  },
  {
    name: "Custom Studio",
    image: "/beads/pomelli_photoshoot_image_9_16_0726 (5).png",
    color: "bg-primary/10 border-primary/30 text-primary font-bold",
    badge: "Studio 🎨",
    href: "/builder",
  },
];

export function CategoryMarquee() {
  return (
    <section className="py-10 bg-background border-y border-border/40 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl text-foreground font-normal">
              Explore Jewellery Collections
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hand-picked artisan collections &amp; custom studio creations
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Categories</span>
            <span>→</span>
          </Link>
        </div>

        {/* Clean 6-Category Showcase Grid (No duplicates, no cut-offs) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex flex-col items-center gap-2.5 group text-center w-full max-w-[130px]"
            >
              <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full overflow-hidden clay-panel bg-white p-1 border border-border/80 group-hover:border-primary/60 group-hover:scale-105 transition-all duration-300 shadow-sm group-hover:shadow-md">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 80px, 100px"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block truncate group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium block">
                  {cat.badge}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
