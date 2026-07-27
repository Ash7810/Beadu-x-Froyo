"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
  DragStartEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { BeadLibrary } from "@/components/builder/BeadLibrary";
import { BraceletCanvas } from "@/components/builder/BraceletCanvas";
import { Checkout } from "@/components/builder/Checkout";
import { INITIAL_BEADS, PRESET_DESIGNS } from "@/lib/catalog";
import { Bead, PlacedBead } from "@/lib/types";
import { useBraceletStore } from "@/store/braceletStore";
import { getStrandSpecFromWrist, calculateStrandPhysicalCapacity } from "@/lib/pricing";
import { CraftingTray } from "@/components/builder/CraftingTray";
import { Button } from "@/components/ui/button";

function BuilderContent() {
  const [customBeads, setCustomBeads] = useState<Bead[]>([]);
  const beads: Bead[] = [...INITIAL_BEADS, ...customBeads];

  // Crafting Tray state (pre-populated with starter beads)
  const [trayBeads, setTrayBeads] = useState<Bead[]>(INITIAL_BEADS.slice(0, 6));

  // Selection & Swap mode state
  const [selectedTrayBeadId, setSelectedTrayBeadId] = useState<string | null>(null);
  const [swappingPlacedBead, setSwappingPlacedBead] = useState<PlacedBead | null>(null);

  const { addBead, swapBead, moveBead, placedBeads, config, pricing, reset, loadDesign, setWristInches, startNewCustomer, clearError } = useBraceletStore();
  const searchParams = useSearchParams();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Exact 3-Step Flow:
  // Step 1: Select Beads for Tray
  // Step 2: Wrist Size & Design Strand
  // Step 3: Review & Order
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const handleNewCustomer = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Start a new customer? This will clear the current design.");
      if (confirmed) {
        startNewCustomer();
        setTrayBeads(INITIAL_BEADS.slice(0, 6));
        setSelectedTrayBeadId(null);
        setSwappingPlacedBead(null);
        setCurrentStep(1);
      }
    }
  };

  const handleAddCustomBead = (newBead: Bead) => {
    setCustomBeads((prev) => [...prev, newBead]);
    setTrayBeads((prev) => [...prev, newBead]);
  };

  // LocalStorage persistence hydration on mount (clears any stale testing state if preset is not active)
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!searchParams.get("preset")) {
        reset();
      }
    }
  }, [searchParams, reset]);

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
    setTrayBeads([]);
    setSelectedTrayBeadId(null);
  };

  const [activeDragItem, setActiveDragItem] = useState<{
    type: "placed-bead";
    bead: Bead;
  } | null>(null);

  // Drag Sensors for bounded placed-bead reordering only
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 4 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 80, tolerance: 12 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  // Preset Loader
  useEffect(() => {
    const presetId = searchParams.get("preset");
    if (presetId) {
      const preset = PRESET_DESIGNS.find((p) => p.id === presetId);
      if (preset) {
        const loadedBeads: PlacedBead[] = [];
        preset.beadIds.forEach((beadId, idx) => {
          const found = beads.find((b) => b.id === beadId);
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
      }
    }
  }, [searchParams, loadDesign, beads]);

  const handleSelectBead = (bead: Bead) => {
    handleAddToTray(bead);
  };

  // TRAY BEAD TAP HANDLER (Handles normal selection vs swap-target mode)
  const handleTapTrayBead = (bead: Bead) => {
    clearError();
    if (swappingPlacedBead) {
      // Execute Swap
      const success = swapBead(swappingPlacedBead.placedId, bead);
      if (success) {
        setSwappingPlacedBead(null);
      }
    } else {
      // Toggle selection ring
      if (selectedTrayBeadId === bead.id) {
        setSelectedTrayBeadId(null);
      } else {
        setSelectedTrayBeadId(bead.id);
      }
    }
  };

  // CANVAS OPEN SLOT TAP HANDLER (Places selected tray bead)
  const handleSelectSlot = (slotIndex: number) => {
    clearError();
    if (swappingPlacedBead) {
      setSwappingPlacedBead(null);
      return;
    }
    if (!selectedTrayBeadId) return;

    const trayBead = trayBeads.find((b) => b.id === selectedTrayBeadId);
    if (!trayBead) return;

    const success = addBead(trayBead, slotIndex);
    if (success) {
      // Keep or clear selection per UX (deselect on placement)
      setSelectedTrayBeadId(null);
    }
  };

  // START SWAP FLOW FROM PLACED BEAD DETAIL CARD
  const handleStartSwap = (placedBead: PlacedBead) => {
    clearError();
    setSelectedTrayBeadId(null);
    setSwappingPlacedBead(placedBead);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data && data.type === "placed-bead") {
      setActiveDragItem({ type: "placed-bead", bead: data.placed });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const activeData = active.data.current;
    if (!activeData || activeData.type !== "placed-bead") return;

    const overData = over.data.current;
    // Bounded drag reorder: only swap when dropped over another placed bead
    if (overData && overData.type === "placed-bead") {
      const activePlaced: PlacedBead = activeData.placed;
      const targetPlaced: PlacedBead = overData.placed;
      if (activePlaced.placedId !== targetPlaced.placedId) {
        moveBead(activePlaced.placedId, targetPlaced.slotIndex);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans select-none">
        
        {/* Top Header Bar */}
        <header className="h-12 sm:h-16 px-2.5 sm:px-4 md:px-8 bg-card/90 border-b border-border/80 flex justify-between items-center z-30 shrink-0 shadow-xs backdrop-blur-md w-full">
          {/* LEFT GROUP: Brand Identity */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors p-1 sm:px-2.5 sm:py-1.5 rounded-full border border-border/70 hover:bg-muted/60"
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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Decoupled 3-Step Breadcrumb Stepper */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/60 p-0.5 sm:p-1 rounded-full border border-border/80 text-xs font-semibold shrink-0">
              <button
                onClick={() => setCurrentStep(1)}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full transition-all flex items-center gap-1 ${
                  currentStep === 1
                    ? "bg-primary text-primary-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
                title="Step 1: Select Beads"
              >
                <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center ${
                  currentStep === 1 ? "bg-white/20 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                }`}>1</span>
                <span className="hidden xl:inline text-xs font-medium">Select Beads</span>
              </button>

              <span className="text-muted-foreground/40 text-[10px] font-bold">›</span>

              <button
                onClick={() => setCurrentStep(2)}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full transition-all flex items-center gap-1 ${
                  currentStep === 2
                    ? "bg-primary text-primary-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
                title="Step 2: Design Strand"
              >
                <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center ${
                  currentStep === 2 ? "bg-white/20 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                }`}>2</span>
                <span className="hidden xl:inline text-xs font-medium">Design Strand</span>
              </button>

              <span className="text-muted-foreground/40 text-[10px] font-bold">›</span>

              <button
                onClick={() => placedBeads.length > 0 && setCurrentStep(3)}
                disabled={placedBeads.length === 0 && currentStep !== 3}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full transition-all flex items-center gap-1 ${
                  currentStep === 3
                    ? "bg-primary text-primary-foreground shadow-sm font-bold"
                    : placedBeads.length === 0
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
                title={placedBeads.length === 0 ? "Add at least 1 bead to continue." : "Step 3: Review & Order"}
              >
                <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center ${
                  currentStep === 3 ? "bg-white/20 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                }`}>3</span>
                <span className="hidden xl:inline text-xs font-medium">Review & Order</span>
              </button>
            </div>

            {/* Valuation Price Badge */}
            <div className="text-xs text-muted-foreground font-semibold hidden lg:block bg-muted/40 px-3 py-1.5 rounded-full border border-border/60 shrink-0">
              Valuation: <strong className="text-primary font-bold text-sm ml-1">{pricing.total === 0 ? "Free" : `₹${pricing.total}`}</strong>
            </div>

            {/* New Customer / Reset Button - Compact Icon Button */}
            <button
              onClick={handleNewCustomer}
              className="p-1.5 sm:p-2 text-xs text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all rounded-full border border-border/80 shadow-xs flex items-center justify-center shrink-0"
              title="Reset / New Customer"
              aria-label="Reset / New Customer"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">refresh</span>
            </button>

            {/* Primary Action CTA Button - Fits perfectly on all mobile screens */}
            {currentStep === 3 ? (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                disabled={placedBeads.length === 0}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-xs rounded-full shadow-md transition-all shrink-0 whitespace-nowrap ${
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
                className="gold-shimmer text-on-primary-container px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-xs rounded-full shadow-md hover:scale-105 transition-all shrink-0 whitespace-nowrap"
              >
                Design →
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(3)}
                disabled={placedBeads.length === 0}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-xs rounded-full shadow-md transition-all shrink-0 whitespace-nowrap ${
                  placedBeads.length === 0
                    ? "bg-muted text-muted-foreground cursor-not-allowed border border-border/60"
                    : "gold-shimmer text-on-primary-container hover:scale-105"
                }`}
              >
                Review →
              </button>
            )}
          </div>
        </header>

        {/* ========================================================================= */}
        {/* STEP 1: SELECT BEADS FOR TRAY */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="flex-1 flex flex-col justify-between min-h-0 p-2.5 sm:p-4 md:p-6 max-w-6xl mx-auto w-full gap-3">
            <div className="flex-1 min-h-0 bg-card rounded-2xl border border-border/80 p-3 sm:p-5 shadow-xs flex flex-col">
              <BeadLibrary
                beads={beads}
                trayBeadIds={trayBeads.map((b) => b.id)}
                onSelectBead={handleSelectBead}
                onAddCustomBead={handleAddCustomBead}
                onAddToTray={handleAddToTray}
                onRemoveFromTrayByBeadId={handleRemoveFromTrayByBeadId}
              />
            </div>

            {/* Step 1 Bottom Proceed Bar */}
            <div className="w-full shrink-0">
              <div className="flex flex-row justify-between items-center bg-card border border-border/80 p-3 sm:p-4 rounded-2xl shadow-sm gap-2">
                <div className="text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">shopping_bag</span>
                  <div>
                    <span className="text-muted-foreground font-medium hidden xs:inline">Tray Inventory: </span>
                    <strong className="text-foreground font-bold">{trayBeads.length} Collected</strong>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 gold-shimmer text-on-primary-container font-bold text-xs rounded-full shadow-md hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Design Strand →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: DESIGN STRAND & CRAFTING TRAY */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden p-2 sm:p-4 max-w-6xl mx-auto w-full gap-2.5">
            {/* Main Interactive Strand Canvas Stage */}
            <div className="flex-1 w-full min-h-0 flex items-center justify-center">
              <BraceletCanvas
                allBeads={beads}
                onSelectSlot={handleSelectSlot}
                onStartSwap={handleStartSwap}
                isSwapMode={!!swappingPlacedBead}
                hasSelectedTrayBead={!!selectedTrayBeadId}
              />
            </div>

            {/* Bottom Crafting Tray */}
            <div className="w-full shrink-0">
              <CraftingTray
                trayBeads={trayBeads}
                selectedBeadId={selectedTrayBeadId}
                isSwapMode={!!swappingPlacedBead}
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Custom Artisan Creation</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Review Your Custom Order</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Hand-finished by master jewelers to your exact wrist specifications.
              </p>
            </div>

            {/* Design Summary Card */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left Mini Canvas Preview */}
                <div className="w-full h-60 bg-muted/20 rounded-xl border border-border/80 flex items-center justify-center p-3 relative overflow-hidden shadow-inner">
                  <BraceletCanvas allBeads={beads} compact={true} readOnly={true} defaultViewMode="preview" />
                </div>

                {/* Right Design Specs */}
                <div className="space-y-4 text-xs">
                  <h3 className="font-display text-xl font-bold text-foreground">Custom Piece Specifications</h3>

                  <div className="space-y-2.5 border-t border-b border-border/60 py-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Wrist Size (Fit):</span>
                      <strong className="text-foreground font-bold">{config.wristInches.toFixed(1)} inches ({Math.round(config.wristInches * 2.54)} cm)</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Cut Cable Spec:</span>
                      <strong className="text-foreground font-bold">{(config.wristInches + 2.0).toFixed(1)}" (includes 2.0" knot allowance)</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Placed Components:</span>
                      <strong className="text-foreground font-bold">{placedBeads.length} Beads</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div>
                      <span className="block font-bold text-foreground text-sm">Total Valuation</span>
                      <span className="text-[11px] text-muted-foreground">Includes artisan hand finishing & presentation box</span>
                    </div>
                    <span className="font-display text-2xl font-bold text-primary">
                      {pricing.total === 0 ? "Complimentary" : `₹${pricing.total}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/80 items-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:flex-1 text-xs font-bold py-3 rounded-full border-border/80"
                >
                  ← Edit Strand & Size
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
                    {placedBeads.length === 0
                      ? "Proceed to Checkout"
                      : `Proceed to Checkout (${placedBeads.length} Beads)`}
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

        {/* Floating Touch Drag Overlay */}
        <DragOverlay>
          {activeDragItem ? (
            <div className="w-12 h-12 rounded-full bg-card/90 border-2 border-primary shadow-2xl p-1 flex items-center justify-center pointer-events-none scale-125 backdrop-blur-md">
              <img
                src={activeDragItem.bead.imageUrl}
                alt={activeDragItem.bead.name}
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
          ) : null}
        </DragOverlay>


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