"use client";

import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden pt-4 sm:pt-6 pb-10 sm:pb-12 bg-background">
      {/* Main Banner Wrapper */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
        {/* Banner Card Container with Organic Wavy Edges */}
        <div className="relative w-full rounded-3xl overflow-hidden min-h-[360px] sm:min-h-[460px] lg:min-h-[520px] xl:min-h-[580px] flex items-center justify-center text-center shadow-xl border border-border/40">
          {/* Background Photoshoot Image */}
          <Image
            src="/beads/pomelli_photoshoot_image_1_1_0726.png"
            alt="Beadu Handmade Jewellery Collection"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            quality={95}
            className="object-cover object-center brightness-95"
          />

          {/* Semi-transparent Light Backdrop Overlay */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

          {/* Top Wavy Graphic Overlay Mask */}
          <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 pointer-events-none z-10">
            <svg viewBox="0 0 1440 120" fill="none" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <path
                d="M0 0H1440V40C1200 90 960 20 720 60C480 100 240 30 0 70V0Z"
                fill="#fcfcfc"
              />
            </svg>
          </div>

          {/* Bottom Wavy Graphic Overlay Mask */}
          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 pointer-events-none z-10">
            <svg viewBox="0 0 1440 120" fill="none" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <path
                d="M0 120H1440V60C1200 20 960 90 720 40C480 80 240 20 0 50V120Z"
                fill="#fcfcfc"
              />
            </svg>
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-20 max-w-3xl px-6 py-12 lg:py-16 space-y-4">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-[#1e1b18] tracking-tight drop-shadow-sm leading-tight">
              Handmade with Love, Crafted with Care
            </h1>

            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-block bg-[#7c2d12] hover:bg-[#9a3412] text-white px-7 sm:px-9 py-3 sm:py-3.5 rounded-lg text-xs sm:text-sm lg:text-base font-semibold shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                See What&apos;s New
              </Link>
            </div>
          </div>
        </div>

        {/* Sub-hero Tagline Text matching beadu.in screenshot */}
        <div className="mt-8 text-center max-w-4xl mx-auto px-4">
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed font-sans font-medium">
            Discover handmade jewellery in India by Beadu. Shop wooden, glass &amp; clay earrings, bracelets, keychains, necklaces, cute magnets, charms &amp; trinkets—handmade with love by artisans ✨
          </p>
        </div>
      </div>
    </section>
  );
}
