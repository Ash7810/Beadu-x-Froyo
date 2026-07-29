"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { BeadLibrary } from "@/components/builder/BeadLibrary";
import { BraceletCanvas } from "@/components/builder/BraceletCanvas";
import { Checkout } from "@/components/builder/Checkout";
import { INITIAL_BEADS, PRESET_DESIGNS } from "@/lib/catalog";
import { Bead, PlacedBead } from "@/lib/types";
import { useBraceletStore } from "@/store/braceletStore";
import { getStrandSpecFromWrist } from "@/lib/pricing";
import { CraftingTray } from "@/components/builder/CraftingTray";
import { Button } from "@/components/ui/button";

function BuilderContent() {
  // Start with INITIAL_BEADS immediately so catalog never appears empty,
  // then silently update from the API (DB may have admin overrides)
  const [liveBeads, setLiveBeads] = useState<Bead[]>(INITIAL_BEADS);
  const [customBeads, setCustomBeads] = useState<Bead[]>([]);
  
  // Memoize so the array reference is stable across renders (avoids triggering useEffect deps)
  const beads = useMemo<Bead[]>(() => [...liveBeads, ...customBeads], [liveBeads, customBeads]);
  // Keep a ref so the preset loader can read the latest beads without being a dependency
  const beadsRef = useRef<Bead[]>(beads);
  useEffect(() => { beadsRef.current = beads; }, [beads]);

  // Tray starts empty for a clean customer design session
  const [trayBeads, setTrayBeads] = useState<Bead[]>([]);

  useEffect(() => {
    fetch("/api/beads")
      .then((res) => res.json())
      .then((data: Bead[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveBeads(data);
        }
      })
      .catch(() => {});
  }, []);

  // Selection & Swap mode state
  const [selectedTrayBeadId, setSelectedTrayBeadId] = useState<string | null>(null);
  const [selectedPlacedBeadId, setSelectedPlacedBeadId] = useState<string | null>(null);

  const { addBead, swapBead, swapPlacedBeads, removeBead, placedBeads, config, pricing, reset, loadDesign, setWristInches, startNewCustomer, clearError } = useBraceletStore();
  const searchParams = useSearchParams();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Exact 3-Step Flow:
  // Step 1: Select Beads for Tray
  // Step 2: Wrist Size & Design Strand
  // Step 3: Review & Order
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Drag Sensors for Desktop/Tablet view (laptop/tablet mouse drag & touch drag)
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 4 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 100, tolerance: 10 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleNewCustomer = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Start a new customer? This will clear the current design.");
      if (confirmed) {
        startNewCustomer();
        setTrayBeads([]);
        setSelectedTrayBeadId(null);
        setSelectedPlacedBeadId(null);
        setCurrentStep(1);
      }
    }
  };

  const handleAddCustomBead = (newBead: Bead) => {
    setCustomBeads((prev) => [...prev, newBead]);
    setTrayBeads((prev) => [...prev, newBead]);
  };

  // Only reset the bracelet store when explicitly loading a fresh session via ?new=1
  // Do NOT reset on every mount — that was wiping the catalog/tray on every page load
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (searchParams.get("new") === "1") {
        reset();
      }
    }
  }, [searchParams, reset]);

  // Restore saved design from localStorage on initial page refresh mount
  useEffect(() => {
    if (typeof window !== "undefined" && !searchParams.get("new") && !searchParams.get("preset")) {
      try {
        const saved = localStorage.getItem("beadu_live_bracelet");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.placedBeads)) {
            loadDesign(parsed.placedBeads, parsed.config);
          }
        }
      } catch (e) {}
    }
  }, [loadDesign, searchParams]);

  const handleAddToTray = (bead: Bead) => {
    if (trayBeads.some((b) => b.id === bead.id)) {
      return;
    }
    setTrayBeads((prev) => [...prev, bead]);
  };

  const handleRemoveFromTrayByBeadId = (beadId: string) => {
    setTrayBeads((prev) => prev.filter((b) => b.id !== beadId));
    if (selectedTrayBeadId === beadId) {
      setSelectedTrayBeadId(null);
    }
  };

  const handleClearTray = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Are you sure you want to clear all beads from your crafting tray?");
      if (!confirmed) return;
    }
    setTrayBeads([]);
    setSelectedTrayBeadId(null);
    setSelectedPlacedBeadId(null);
  };

  // Preset Loader — reads beads via ref so it doesn't re-fire every time beads array updates
  useEffect(() => {
    const presetId = searchParams.get("preset");
    if (!presetId) return;
    const preset = PRESET_DESIGNS.find((p) => p.id === presetId);
    if (!preset) return;

    const latestBeads = beadsRef.current;
    const loadedBeads: PlacedBead[] = [];
    preset.beadIds.forEach((beadId, idx) => {
      const found = latestBeads.find((b) => b.id === beadId);
      if (found) {
        loadedBeads.push({
          ...found,
          slotIndex: idx,
          rotation: 0,
          placedId: `${found.id}-${idx}-${Date.now()}`,
        });
      }
    });
    const spec = getStrandSpecFromWrist(preset.wristInches || 7.0);
    loadDesign(loadedBeads, {
      wristInches: spec.wristInches,
      totalSlots: spec.totalSlots,
      freeSlotLimit: spec.freeSlotLimit,
    });
    setCurrentStep(2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loadDesign]); // beads intentionally excluded — read via ref

  const handleSelectBead = (bead: Bead) => {
    handleAddToTray(bead);
  };

  // TRAY BEAD TAP HANDLER:
  // 1) If a placed bead on the strand is selected -> Swap it directly with this tapped tray bead.
  // 2) Otherwise -> Set as active tray bead selection ring or iterate next empty slot placement.
  const handleTapTrayBead = (bead: Bead) => {
    clearError();

    // If a placed bead on string is selected -> Swap directly!
    if (selectedPlacedBeadId) {
      const success = swapBead(selectedPlacedBeadId, bead);
      setSelectedPlacedBeadId(null);
      if (success) return;
    }

    // Toggle tray selection or sequential auto-placement
    if (selectedTrayBeadId === bead.id) {
      setSelectedTrayBeadId(null);
    } else {
      setSelectedTrayBeadId(bead.id);

      // Auto-iterate: Place in next empty slot sequentially if slots available
      const occupiedSlots = new Set(placedBeads.map((b) => b.slotIndex));
      let nextEmptySlot = -1;
      for (let i = 0; i < config.totalSlots; i++) {
        if (!occupiedSlots.has(i)) {
          nextEmptySlot = i;
          break;
        }
      }

      if (nextEmptySlot !== -1) {
        const placedOk = addBead(bead, nextEmptySlot);
        if (placedOk) {
          setSelectedTrayBeadId(null);
        }
      }
    }
  };

  // PLACED BEAD TAP HANDLER:
  // 1) If a tray bead is selected -> Swap placed bead with selected tray bead directly!
  // 2) If another placed bead was selected -> Swap positions of the two placed beads directly!
  // 3) Otherwise -> Select this placed bead.
  const handleSelectPlacedBead = (placedBead: PlacedBead) => {
    clearError();

    // If a tray bead is selected -> Swap directly!
    if (selectedTrayBeadId) {
      const trayBead = trayBeads.find((b) => b.id === selectedTrayBeadId);
      if (trayBead) {
        swapBead(placedBead.placedId, trayBead);
        setSelectedTrayBeadId(null);
        setSelectedPlacedBeadId(null);
        return;
      }
    }

    // If another placed bead is already selected -> Swap their positions on the string!
    if (selectedPlacedBeadId && selectedPlacedBeadId !== placedBead.placedId) {
      swapPlacedBeads(selectedPlacedBeadId, placedBead.placedId);
      setSelectedPlacedBeadId(null);
      return;
    }

    // Toggle selection
    if (selectedPlacedBeadId === placedBead.placedId) {
      setSelectedPlacedBeadId(null);
    } else {
      setSelectedPlacedBeadId(placedBead.placedId);
    }
  };

  // CANVAS OPEN SLOT TAP HANDLER (Places selected tray bead into clicked slot)
  const handleSelectSlot = (slotIndex: number) => {
    clearError();
    setSelectedPlacedBeadId(null);

    if (!selectedTrayBeadId) return;

    const trayBead = trayBeads.find((b) => b.id === selectedTrayBeadId);
    if (!trayBead) return;

    const success = addBead(trayBead, slotIndex);
    if (success) {
      setSelectedTrayBeadId(null);
    }
  };

  // DESKTOP & TABLET DRAG HANDLER:
  // - Drop placed bead onto another placed bead -> Swap positions
  // - Drop placed bead onto trash zone -> Delete bead
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== "placed-bead") return;
    const activePlaced: PlacedBead = activeData.placed;

    // Case A: Drag to Trash Zone -> Delete bead directly
    if (overData && overData.type === "trash-zone") {
      removeBead(activePlaced.placedId);
      setSelectedPlacedBeadId(null);
      return;
    }

    // Case B: Drag to another Placed Bead -> Swap positions
    if (overData && overData.type === "placed-bead") {
      const targetPlaced: PlacedBead = overData.placed;
      if (activePlaced.placedId !== targetPlaced.placedId) {
        swapPlacedBeads(activePlaced.placedId, targetPlaced.placedId);
        setSelectedPlacedBeadId(null);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans select-none">
        {/* Top Header Bar — 52px height on mobile, 64px on tablet/desktop */}
        <header className="h-13 sm:h-16 px-4 md:px-8 bg-card/90 border-b border-border/80 flex justify-between items-center z-30 shrink-0 shadow-xs backdrop-blur-md w-full pt-[max(0px,env(safe-area-inset-top))]">
        {/* LEFT GROUP: Brand Identity */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/"
            className="flex items-center justify-center text-xs text-muted-foreground hover:text-foreground font-medium transition-colors w-9 h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 rounded-full border border-border/70 hover:bg-muted/60"
            title="Home"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="h-4 w-px bg-border/80 hidden sm:block" />
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <img src="/beadu-logo.png" alt="BEADU" className="h-5 sm:h-7 md:h-8 object-contain" />
          </Link>
        </div>

        {/* RIGHT GROUP: Actionable Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Decoupled 3-Step Breadcrumb Stepper — Icon/number only below 480px */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/60 p-0.5 sm:p-1 rounded-full border border-border/80 text-xs font-medium shrink-0">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-2 py-1 rounded-full transition-all flex items-center gap-1 min-h-[36px] ${
                currentStep === 1
                  ? "bg-primary text-primary-foreground shadow-xs font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
              title="Step 1: Select Beads"
            >
              <span className={`w-5 h-5 rounded-full text-[11px] font-medium flex items-center justify-center ${
                currentStep === 1 ? "bg-white/20 text-white" : "bg-muted-foreground/20 text-muted-foreground"
              }`}>1</span>
              <span className="hidden md:inline text-[12px] font-medium">Select Beads</span>
            </button>

            <span className="text-muted-foreground/40 text-[10px] font-bold">›</span>

            <button
              onClick={() => setCurrentStep(2)}
              className={`px-2 py-1 rounded-full transition-all flex items-center gap-1 min-h-[36px] ${
                currentStep === 2
                  ? "bg-primary text-primary-foreground shadow-xs font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
              title="Step 2: Design Strand"
            >
              <span className={`w-5 h-5 rounded-full text-[11px] font-medium flex items-center justify-center ${
                currentStep === 2 ? "bg-white/20 text-white" : "bg-muted-foreground/20 text-muted-foreground"
              }`}>2</span>
              <span className="hidden md:inline text-[12px] font-medium">Design Strand</span>
            </button>

            <span className="text-muted-foreground/40 text-[10px] font-bold">›</span>

            <button
              onClick={() => placedBeads.length > 0 && setCurrentStep(3)}
              disabled={placedBeads.length === 0 && currentStep !== 3}
              className={`px-2 py-1 rounded-full transition-all flex items-center gap-1 min-h-[36px] ${
                currentStep === 3
                  ? "bg-primary text-primary-foreground shadow-xs font-medium"
                  : placedBeads.length === 0
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
              title={placedBeads.length === 0 ? "Add at least 1 bead to continue." : "Step 3: Review & Order"}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] font-medium flex items-center justify-center ${
                currentStep === 3 ? "bg-white/20 text-white" : "bg-muted-foreground/20 text-muted-foreground"
              }`}>3</span>
              <span className="hidden md:inline text-[12px] font-medium">Review & Order</span>
            </button>
          </div>

          {/* Valuation Price Badge */}
          <div className="text-[12px] text-muted-foreground font-medium hidden lg:block bg-muted/40 px-3 py-1.5 rounded-full border border-border/60 shrink-0">
            Valuation: <strong className="text-primary font-medium text-[13px] ml-1">{pricing.total === 0 ? "Free" : `₹${pricing.total}`}</strong>
          </div>

          {/* New Customer / Reset Button - 40x40px touch zone */}
          <button
            onClick={handleNewCustomer}
            className="w-9 h-9 sm:w-10 sm:h-10 text-xs text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all rounded-full border border-border/80 shadow-xs flex items-center justify-center shrink-0 cursor-pointer active:scale-95 min-w-[36px] min-h-[36px]"
            title="Reset / New Customer"
            aria-label="Reset / New Customer"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
          </button>

          {/* Primary Action CTA Button - Minimum 44-48px touch height */}
          {currentStep === 3 ? (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={placedBeads.length === 0}
              className={`px-3.5 py-2 sm:px-4 sm:py-2 font-medium text-[13px] rounded-full shadow-md transition-all shrink-0 whitespace-nowrap min-h-[40px] flex items-center ${
                placedBeads.length === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed border border-border/60"
                  : "gold-shimmer text-on-primary-container hover:scale-105"
              }`}
            >
              Checkout
            </button>
          ) : currentStep === 1 ? (
            <button
              onClick={() => setCurrentStep(2)}
              className="gold-shimmer text-on-primary-container px-3.5 py-2 sm:px-4 sm:py-2 font-medium text-[13px] rounded-full shadow-md hover:scale-105 transition-all shrink-0 whitespace-nowrap min-h-[40px] flex items-center"
            >
              <span>Design</span>
              <span className="hidden xs:inline ml-1">→</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(3)}
              disabled={placedBeads.length === 0}
              className={`px-3.5 py-2 sm:px-4 sm:py-2 font-medium text-[13px] rounded-full shadow-md transition-all shrink-0 whitespace-nowrap min-h-[40px] flex items-center ${
                placedBeads.length === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed border border-border/60"
                  : "gold-shimmer text-on-primary-container hover:scale-105"
              }`}
            >
              <span>Review</span>
              <span className="hidden xs:inline ml-1">→</span>
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* STEP 1: SELECT BEADS FOR TRAY */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative w-full">
          {/* Fixed height layout that fills space but never scrolls */}
          <div className="flex-1 min-h-0 p-2 sm:p-4 max-w-6xl mx-auto w-full pb-0 flex flex-col">
            <div className="flex-1 min-h-0 bg-card rounded-2xl border border-border/80 p-2.5 sm:p-5 shadow-xs flex flex-col">
              <BeadLibrary
                beads={beads}
                trayBeadIds={trayBeads.map((b) => b.id)}
                onSelectBead={handleSelectBead}
                onAddToTray={handleAddToTray}
                onRemoveFromTrayByBeadId={handleRemoveFromTrayByBeadId}
              />
            </div>
          </div>

          {/* Sticky bottom action bar — always visible above mobile browser chrome */}
          <div className="sticky bottom-0 left-0 right-0 z-20 w-full px-2 sm:px-4 max-w-6xl mx-auto shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 bg-gradient-to-t from-background via-background/95 to-transparent">
            <div className="flex flex-row justify-between items-center bg-card/95 backdrop-blur-md border border-border/80 p-2.5 sm:p-3.5 rounded-2xl shadow-lg gap-2">
              <div className="text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">shopping_bag</span>
                <div>
                  <span className="text-muted-foreground font-medium hidden xs:inline">Tray: </span>
                  <strong className="text-foreground font-bold text-xs">{trayBeads.length} Selected</strong>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 gold-shimmer text-on-primary-container font-bold text-xs rounded-full shadow-md hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-1 shrink-0 min-h-[40px] cursor-pointer"
              >
                <span>Start Designing →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: DESIGN STRAND & CRAFTING TRAY */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden px-2 pt-1.5 pb-2 sm:p-4 max-w-6xl mx-auto w-full gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {/* Canvas — fills remaining vertical space */}
          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            <BraceletCanvas
              allBeads={beads}
              onSelectSlot={handleSelectSlot}
              onSelectPlacedBead={handleSelectPlacedBead}
              selectedPlacedBeadId={selectedPlacedBeadId}
              hasSelectedTrayBead={!!selectedTrayBeadId}
            />
          </div>

          {/* Crafting Tray — fixed height at bottom */}
          <div className="w-full shrink-0">
            <CraftingTray
              trayBeads={trayBeads}
              selectedBeadId={selectedTrayBeadId}
              isSwapMode={!!selectedPlacedBeadId}
              onTapBead={handleTapTrayBead}
              onClearTray={handleClearTray}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: REVIEW & ORDERING PAGE */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-primary">Custom Artisan Creation</span>
            <h2 className="font-display text-xl sm:text-3xl font-bold text-foreground">Review Your Order</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Hand-finished by master jewelers to your exact wrist specifications.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-8 shadow-lg space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
              {/* Mini Canvas Preview — shorter on mobile */}
              <div className="w-full h-44 sm:h-60 bg-muted/20 rounded-xl border border-border/80 flex items-center justify-center p-3 relative overflow-hidden shadow-inner">
                <BraceletCanvas allBeads={beads} compact={true} readOnly={true} defaultViewMode="preview" />
              </div>

              {/* Design Specs */}
              <div className="space-y-3 text-xs">
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">Order Specifications</h3>

                <div className="space-y-2 border-t border-b border-border/60 py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Wrist Size:</span>
                    <strong className="text-foreground font-bold">{config.wristInches.toFixed(1)}" ({Math.round(config.wristInches * 2.54)} cm)</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Cable Spec:</span>
                    <strong className="text-foreground font-bold">{(config.wristInches + 2.0).toFixed(1)}" (incl. 2.0" knot)</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Components:</span>
                    <strong className="text-foreground font-bold">{placedBeads.length} Beads</strong>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="block font-bold text-foreground text-sm">Total Valuation</span>
                    <span className="text-[11px] text-muted-foreground">Incl. hand finishing &amp; box</span>
                  </div>
                  <span className="font-display text-2xl font-bold text-primary">
                    {pricing.total === 0 ? "Complimentary" : `₹${pricing.total}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 sm:pt-4 border-t border-border/80 items-center">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full sm:flex-1 text-xs font-bold py-3 rounded-full border-border/80">
                ← Edit Strand &amp; Size
              </Button>
              <div className="w-full sm:flex-1 flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  disabled={placedBeads.length === 0}
                  className={`w-full font-bold py-3 text-xs sm:text-sm rounded-full shadow-lg transition-all ${
                    placedBeads.length === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border/60"
                      : "gold-shimmer text-on-primary-container hover:scale-[1.02] active:scale-98"
                  }`}
                >
                  {placedBeads.length === 0 ? "Proceed to Checkout" : `Proceed to Checkout (${placedBeads.length} Beads)`}
                </button>
                {placedBeads.length === 0 && (
                  <span className="text-xs text-muted-foreground font-medium text-center animate-in fade-in">
                    Add at least 1 bead to your strand to continue.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal Dialog */}
      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          reset();
        }}
      />
    </div>
  </DndContext>
);
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-background text-muted-foreground text-xs font-semibold animate-pulse">
          Initializing Customizer Studio...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}