"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function MaterialShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const materials = [
    {
      title: "Sustainable Indian Wood",
      description: "Hand-turned Indian rosewood, ebony, and natural timber beads coated in organic protective wax.",
      tag: "Eco-Friendly Wood",
      image: "/beads/pomelli_photoshoot_image_9_16_0726 (2).png",
    },
    {
      title: "Fired Terracotta Clay",
      description: "Artisan clay disc and sphere beads molded by hand and kiln-fired in Jaipur pottery tradition.",
      tag: "Earth & Clay",
      image: "/beads/pomelli_photoshoot_image_9_16_0726 (4).png",
    },
    {
      title: "Luminescent Gemstones",
      description: "Natural green jade, cat's eye spheres, and crystal beads that catch light with every gesture.",
      tag: "Natural Stones",
      image: "/beads/pomelli_photoshoot_image_1_1_0726.png",
    },
  ];

  // Auto-swipe horizontal carousel timer for Authentic Craftsmanship cards
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (scrollRef.current && typeof window !== "undefined" && window.innerWidth < 768) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth * 0.8, behavior: "smooth" });
        }
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-16 bg-muted/30 border-y border-border/40 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-primary font-heading">
            Authentic Craftsmanship
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl text-foreground font-normal">
            Pure Natural &amp; Sustainable Materials
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Every Beadu piece is handcrafted with love and care using natural materials—designed to celebrate individuality and emotion.
          </p>
        </div>

        {/* Auto-Swiping Authentic Craftsmanship Cards */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex md:grid overflow-x-auto snap-x snap-mandatory md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pb-4 no-scrollbar scroll-smooth"
        >
          {materials.map((mat, idx) => (
            <div
              key={idx}
              className="clay-panel p-6 flex flex-col justify-between shadow-sm transition-shadow duration-200 w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center bg-white"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                  {mat.tag}
                </span>
                <h3 className="font-heading text-xl text-foreground">{mat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{mat.description}</p>
              </div>

              {/* Clean Image Container — No Zoom Animations */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden mt-6 shadow-xs border border-border/40">
                <Image
                  src={mat.image}
                  alt={mat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Custom Builder Banner */}
        <div className="mt-12 clay-panel bg-gradient-to-r from-[#faf6f2] via-[#f5e5b8]/30 to-[#faf6f2] p-8 text-center space-y-4 border border-primary/20">
          <h3 className="font-heading text-2xl sm:text-3xl text-foreground">
            Want to create your own signature bracelet?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Use our interactive digital customizer to arrange your choice of beads, spacers, and charms in real-time.
          </p>
          <div className="pt-2">
            <Link
              href="/builder"
              className="gold-shimmer text-on-primary-container font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full inline-block shadow-lg active:scale-95 transition-transform"
            >
              Open Custom Bracelet Builder →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
