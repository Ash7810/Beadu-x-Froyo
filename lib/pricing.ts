import { PlacedBead, PricingResult, BraceletConfig, CordType } from "./types";

export const CORD_PRICES: Record<CordType, number> = {
  elastic: 0,
  leather: 249,
  silver_chain: 699,
  gold_chain: 999,
};

export const KNOT_ALLOWANCE_INCHES = 2.0; // 2.0 inches extra string to tie knot

export function getStrandSpecFromWrist(wristInches: number) {
  const sanitizedWrist = Math.max(4.0, Math.min(12.0, Number(wristInches) || 7.0));
  const knotExtensionInches = KNOT_ALLOWANCE_INCHES;
  const totalCutInches = sanitizedWrist + knotExtensionInches;
  const capacityMm = Math.round(sanitizedWrist * 25.4);
  const lengthCm = Math.round(sanitizedWrist * 2.54 * 10) / 10;
  const totalSlots = Math.max(10, Math.round(sanitizedWrist * 2.57));
  const freeSlotLimit = Math.max(6, Math.round(totalSlots * 0.66));

  return {
    wristInches: sanitizedWrist,
    knotExtensionInches,
    totalCutInches,
    lengthCm,
    capacityMm,
    totalSlots,
    freeSlotLimit,
  };
}

export function getUsableStringLength(config: BraceletConfig) {
  const spec = getStrandSpecFromWrist(config.wristInches || 7.0);
  return spec.capacityMm;
}

export function calculateStrandPhysicalCapacity(
  placedBeads: PlacedBead[],
  config: BraceletConfig
) {
  const spec = getStrandSpecFromWrist(config.wristInches || 7.0);
  const capacityMm = config.wristSizeMm || spec.capacityMm;
  const usedMm = placedBeads.reduce((acc, b) => acc + (b.widthMm || b.sizeMm || Math.round(8 * (b.size || 1))), 0);
  const remainingMm = Math.max(0, capacityMm - usedMm);
  const percentUsed = Math.min(100, Math.round((usedMm / capacityMm) * 100));

  return {
    wristInches: spec.wristInches,
    knotExtensionInches: spec.knotExtensionInches,
    totalCutInches: spec.totalCutInches,
    usableLengthCm: spec.lengthCm,
    capacityMm,
    usedMm,
    remainingMm,
    percentUsed,
    totalSlots: spec.totalSlots,
    freeSlotLimit: spec.freeSlotLimit,
    isFull: remainingMm <= 4,
  };
}

/**
 * Rule: the first `freeSlotLimit` non-premium beads are complimentary.
 * Any premium bead is always chargeable, regardless of slot position.
 * Any bead placed beyond the free slot limit is chargeable even if it's
 * a "free tier" category bead.
 * Cord upgrades add a base price.
 */
export function calculateTotal(
  placedBeads: PlacedBead[],
  config: BraceletConfig
): PricingResult {
  let freeBeadCount = 0;
  let beadsTotal = 0;
  let premiumBeadsTotal = 0;

  const cordBasePrice = (config.cordType && CORD_PRICES[config.cordType]) || 0;

  const sorted = [...placedBeads].sort((a, b) => a.slotIndex - b.slotIndex);

  sorted.forEach((bead) => {
    if (bead.isPremium) {
      premiumBeadsTotal += bead.price;
      beadsTotal += bead.price;
    } else {
      const withinFreeWindow = freeBeadCount < config.freeSlotLimit;
      if (withinFreeWindow) {
        freeBeadCount += 1;
      } else {
        beadsTotal += bead.price;
      }
    }
  });

  const grandTotal = cordBasePrice + beadsTotal;

  return {
    total: Math.round(grandTotal * 100) / 100,
    cordBasePrice,
    freeBeadCount,
    chargeableBeadCount: placedBeads.length - freeBeadCount,
    premiumBeadsTotal: Math.round(premiumBeadsTotal * 100) / 100,
    remainingSlots: Math.max(0, config.totalSlots - placedBeads.length),
  };
}

