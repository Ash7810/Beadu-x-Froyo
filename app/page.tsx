"use client";

import { useState } from "react";
import Link from "next/link";
import { INITIAL_BEADS } from "@/lib/catalog";
import { Bead } from "@/lib/types";

export default function Home() {
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<{
    presetId: string;
    title: string;
    designer: string;
    image: string;
    description: string;
    beadsCount: number;
    material: string;
  } | null>(null);

  const [activeMiniBead, setActiveMiniBead] = useState<number>(0);
  const miniBeadList = INITIAL_BEADS.slice(0, 7);

  const galleryItems = [
    {
      presetId: "earth-cats-eye",
      title: "Earth & Cat's Eye Harmony",
      designer: "Elena R.",
      image: "/beads/pomelli_photoshoot_image_1_1_0726.png",
      description: "Carved Indian wood barrels interspersed with luminescent green cat's eye spheres and terracotta discs.",
      beadsCount: 16,
      material: "Sustainably Sourced Wood & Cat's Eye",
    },
    {
      presetId: "pastel-wood-cubes",
      title: "Hand-Painted Pastel Cubes",
      designer: "Marcus T.",
      image: "/beads/pomelli_photoshoot_image_9_16_0726 (1).png",
      description: "Artisan-painted wooden cube beads in vibrant spring pastel hues, strung on durable elastic cord.",
      beadsCount: 18,
      material: "Hand-Painted Wood Cubes",
    },
    {
      presetId: "carved-rosewood-ebony",
      title: "Carved Rosewood & Ebony",
      designer: "Sophie L.",
      image: "/beads/pomelli_photoshoot_image_9_16_0726 (2).png",
      description: "Deeply engraved rosewood spheres paired with light natural wood accents and pearl highlights.",
      beadsCount: 15,
      material: "Engraved Indian Rosewood & Pearl",
    },
    {
      presetId: "jade-terracotta",
      title: "Jade Gemstone & Terracotta",
      designer: "David K.",
      image: "/beads/pomelli_photoshoot_image_9_16_0726 (5).png",
      description: "Natural green jade gemstones set against golden-turned wood beads on an earthy strand.",
      beadsCount: 17,
      material: "Natural Jade & Fired Clay",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 dark:bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/beadu-logo.png" alt="Beadu" className="h-8 md:h-10 object-contain" />
          </Link>

          <div className="hidden md:flex gap-8 items-center text-sm font-medium text-muted-foreground">
            <a href="#collections" className="hover:text-primary transition-colors">
              Collections
            </a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              Process
            </a>
            <a href="#showcase" className="hover:text-primary transition-colors">
              Community Gallery
            </a>
            <a href="#upgrades" className="hover:text-primary transition-colors">
              Rare Materials
            </a>
          </div>

          <Link
            href="/builder"
            className="gold-shimmer text-on-primary-container px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            Start Designing
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-36 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto space-y-6">

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-normal text-foreground leading-tight tracking-tight">
              Beadu x Froyo
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed font-sans">
              Indian handmade jewellery offering artisan-crafted accessories made from natural, eco-friendly materials like terracotta clay, glass, and rosewood. Blending boho-chic cultural aesthetics with soulful craftsmanship.
            </p>

            <div className="pt-6 flex justify-center items-center">
              <Link
                href="/builder"
                className="gold-shimmer text-on-primary-container px-10 py-4 rounded-full text-base font-bold shadow-xl shadow-primary-container/20 hover:scale-105 transition-all duration-300"
              >
                Start Designing
              </Link>
            </div>
          </div>

          {/* Floating Hero Visual */}
          <div className="mt-16 relative w-full max-w-5xl mx-auto">
            <div className="floating relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border-4 border-white/80 dark:border-white/10">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                style={{
                  backgroundImage:
                    "url('/beads/pomelli_photoshoot-3.png')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white text-left">

                <Link
                  href="/builder"
                  className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold hover:bg-white hover:text-black transition-all"
                >
                  Customize This Style →
                </Link>
              </div>
            </div>

            {/* Glowing ambient background halos */}
            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-primary/15 blur-3xl -z-10" />
            <div className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full bg-primary-container/20 blur-3xl -z-10" />
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 px-6 md:px-12 bg-muted/40 transition-all duration-500">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Craftsmanship</span>
              <h2 className="font-display text-3xl md:text-4xl font-normal text-foreground">
                Crafting Your Piece in Three Simple Steps
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Intention in every detail, from curation to final hand-assembly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center space-y-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-display text-xl font-bold">
                  1
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">Shop the Collection</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Explore our curated selection of high-grade materials, precious metals, natural pearls, and hand-sculpted charms.
                </p>
                <div className="w-full aspect-square rounded-xl overflow-hidden mt-4 shadow-sm">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    alt="Artisan terracotta red and orange wood bead bracelet"
                    src="/beads/pomelli_photoshoot_image_9_16_0726 (4).png"
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center space-y-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-display text-xl font-bold">
                  2
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">Design Your Bracelet</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use our fluid digital builder to arrange your components and visualize your signature look in real-time.
                </p>
                <div className="w-full aspect-square rounded-xl overflow-hidden mt-4 shadow-sm">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    alt="Design custom Indian handmade bracelet"
                    src="/beads/pomelli_photoshoot_image_9_16_0726.png"
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center space-y-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-display text-xl font-bold">
                  3
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">Receive Your Custom Piece</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hand-finished by master jewelers and delivered in our signature velvet-lined presentation box.
                </p>
                <div className="w-full aspect-square rounded-xl overflow-hidden mt-4 shadow-sm">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    alt="Hand-finished artisan bracelet on wrist"
                    src="/beads/pomelli_photoshoot_image_9_16_0726 (3).png"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bracelet Showcase Section */}
        <section id="showcase" className="py-24 px-6 md:px-12 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-primary">Inspiration</span>
                <h2 className="font-display text-3xl md:text-4xl font-normal text-foreground">
                  Designed by the Community
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">Get inspired by what others are crafting.</p>
              </div>
              <Link
                href="/builder"
                className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
              >
                <span>Try Customizer</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>

            {/* Horizontal Scroll Showcase Cards */}
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 snap-x">
              {galleryItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedGalleryItem(item)}
                  className="min-w-[300px] sm:min-w-[340px] h-[440px] rounded-2xl overflow-hidden relative group cursor-pointer border border-border shadow-md hover:shadow-2xl transition-all duration-500 snap-start"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                    <h3 className="font-display text-2xl font-light">{item.title}</h3>
                    <p className="text-xs opacity-80 mt-1 line-clamp-2">{item.description}</p>
                    <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-xs">
                      <span className="font-medium opacity-90">{item.material}</span>
                      <span className="font-semibold text-primary-fixed hover:underline flex items-center gap-1">
                        View Details <span className="material-symbols-outlined text-sm">visibility</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Upgrades Section */}
        <section id="upgrades" className="py-24 px-6 md:px-12 bg-muted/20">
          <div className="max-w-7xl mx-auto bg-card rounded-3xl overflow-hidden border border-border shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center space-y-6">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight">
                Authentic Indian Craftsmanship & Eco Materials
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Every Beadu piece is handcrafted from sustainable Indian rosewood, fired terracotta clay, hand-blown glass, and natural gemstones. Mindful, lightweight jewelry that serves as expressions of emotion and individuality.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm text-xs font-medium">
                  <span className="material-symbols-outlined text-primary text-sm">eco</span>
                  <span>Sustainability</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm text-xs font-medium">
                  <span className="material-symbols-outlined text-primary text-sm">handshake</span>
                  <span>Artisan Craftsmanship</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm text-xs font-medium">
                  <span className="material-symbols-outlined text-primary text-sm">verified</span>
                  <span>Authenticity</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm text-xs font-medium">
                  <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                  <span>Individuality</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                >
                  <span>Explore Premium Charms in Builder</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 relative min-h-[350px]">
              <img
                className="w-full h-full object-cover"
                alt="Authentic Indian handcrafted wrist jewelry photoshoot"
                src="/beads/newimg.png"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 md:px-12 text-center bg-background relative overflow-hidden">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-primary">Your Canvas Awaits</span>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-foreground tracking-tight">
              Ready to start your story?
            </h2>
            <p className="text-muted-foreground text-base">
              The process is fluid, the result is permanent. Create your Aura x Gilded piece today.
            </p>
            <div className="pt-6">
              <Link
                href="/builder"
                className="gold-shimmer text-on-primary-container px-12 py-5 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                <span>Design My Bracelet</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4 max-w-xs">
            <span className="font-display text-2xl text-primary font-light">Beadu</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Crafting meaningful connections through bespoke jewelry and artisanal collaboration.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">share</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">camera_enhance</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">chat</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-sm">
            <div className="space-y-3 flex flex-col">
              <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Shop</h4>
              <a href="#collections" className="hover:text-primary transition-colors">Collections</a>
              <a href="#showcase" className="hover:text-primary transition-colors">Best Sellers</a>
              <Link href="/builder" className="hover:text-primary transition-colors">Customizer</Link>
            </div>
            <div className="space-y-3 flex flex-col">
              <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Support</h4>
              <a href="#" className="hover:text-primary transition-colors">Shipping & Delivery</a>
              <a href="#" className="hover:text-primary transition-colors">Returns & Guarantee</a>
              <a href="#" className="hover:text-primary transition-colors">Care Guide</a>
            </div>
            <div className="space-y-3 flex flex-col">
              <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Legal</h4>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© 2026 Beadu. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <span>Hand-finished in San Francisco</span>
            <span>•</span>
            <span>Sustainably Sourced</span>
          </div>
        </div>
      </footer>

      {/* Showcase Detail Dialog Modal */}
      {selectedGalleryItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border max-w-lg w-full rounded-2xl p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedGalleryItem(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="aspect-video w-full rounded-xl overflow-hidden">
              <img src={selectedGalleryItem.image} alt={selectedGalleryItem.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-primary">
                Featured Design
              </span>
              <h3 className="font-display text-2xl font-semibold mt-1">{selectedGalleryItem.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{selectedGalleryItem.description}</p>
            </div>
            <div className="bg-muted/40 p-4 rounded-xl flex justify-between text-xs font-medium">
              <div>
                <span className="text-muted-foreground block">Artisan Collection</span>
                <span className="text-foreground font-semibold">Beadu x Froyo</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Primary Material</span>
                <span className="text-foreground font-semibold">{selectedGalleryItem.material}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedGalleryItem(null)}
                className="flex-1 py-2.5 rounded-full border border-border text-sm font-semibold hover:bg-muted"
              >
                Close
              </button>
              <Link
                href={`/builder?preset=${selectedGalleryItem.presetId}`}
                className="flex-1 gold-shimmer text-on-primary-container text-center py-2.5 rounded-full text-sm font-bold shadow-md hover:scale-105 transition-all flex items-center justify-center gap-1"
              >
                <span>Remix Design</span>
                <span className="material-symbols-outlined text-base">auto_awesome</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
