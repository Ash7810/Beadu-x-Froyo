import { useState, useEffect, useRef, useMemo } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useBraceletStore } from "@/store/braceletStore";
import { Bead, PlacedBead } from "@/lib/types";
import { calculateStrandPhysicalCapacity, REFERENCE_BEAD_SIZE_MM } from "@/lib/pricing";

export type ArcContourParams = {
  centerX: number;
  centerY: number;
  rx: number;
  ry: number;
  startAngle: number;
  endAngle: number;
};

// Perfectly proportioned Strand arc geometry centered in 750×200 viewBox
const DEFAULT_STRAND_ARC: ArcContourParams = {
  centerX: 375,
  centerY: 50,
  rx: 310,
  ry: 90,
  startAngle: Math.PI * 0.84,
  endAngle: Math.PI * 0.16,
};

const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 200;          // Strand builder mode height
const CANVAS_HEIGHT_PREVIEW = 280;  // Closed-loop preview mode height (taller to prevent cropping)
const MARGIN_BUFFER_PX = 24;        // ~5mm buffer reserved at both ends near clasps

// Perfectly proportioned closed-loop product preview ellipse — centered in 750×280 viewBox
const CLOSED_LOOP_CENTER_X = 375;
const CLOSED_LOOP_CENTER_Y = 140;
const CLOSED_LOOP_RX = 210;
const CLOSED_LOOP_RY = 100;

function getUniformSlotPositions(totalSlots: number, params: ArcContourParams = DEFAULT_STRAND_ARC) {
  const SAMPLES = 300;
  const angles: number[] = [];
  const lengths: number[] = [0];

  const { centerX, centerY, rx, ry, startAngle, endAngle } = params;

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const a = startAngle + t * (endAngle - startAngle);
    angles.push(a);
    if (i > 0) {
      const prevA = angles[i - 1];
      const x1 = centerX + rx * Math.cos(prevA);
      const y1 = centerY + ry * Math.sin(prevA);
      const x2 = centerX + rx * Math.cos(a);
      const y2 = centerY + ry * Math.sin(a);
      lengths.push(lengths[i - 1] + Math.hypot(x2 - x1, y2 - y1));
    }
  }

  const rawTotalArcLength = lengths[lengths.length - 1];
  const usableArcStart = MARGIN_BUFFER_PX;
  const usableArcEnd = Math.max(usableArcStart + 10, rawTotalArcLength - MARGIN_BUFFER_PX);
  const usableArcLength = usableArcEnd - usableArcStart;
  const stepLength = totalSlots > 1 ? usableArcLength / (totalSlots - 1) : 0;

  const positions: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i < totalSlots; i++) {
    const targetLen = totalSlots > 1 ? usableArcStart + i * stepLength : usableArcStart + usableArcLength / 2;
    let idx = 0;
    while (idx < lengths.length - 1 && lengths[idx + 1] < targetLen) {
      idx++;
    }
    const len1 = lengths[idx];
    const len2 = lengths[idx + 1] || len1;
    const a1 = angles[idx];
    const a2 = angles[idx + 1] || a1;
    const frac = len2 > len1 ? (targetLen - len1) / (len2 - len1) : 0;
    const angle = a1 + frac * (a2 - a1);

    const x = centerX + rx * Math.cos(angle);
    const y = centerY + ry * Math.sin(angle);
    const dx = -rx * Math.sin(angle);
    const dy = ry * Math.cos(angle);
    const tangentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    positions.push({ x, y, angle: tangentAngle });
  }

  return { positions, totalArcLength: usableArcLength, rawArcLength: rawTotalArcLength };
}

/**
 * Physics-based positioning: places beads along the arc proportional to their
 * actual widthMm, so larger beads take more arc space.
 * Returns a position for each placed bead (sorted by slotIndex).
 */
function getPhysicsBasedBeadPositions(
  placedBeads: PlacedBead[],
  params: ArcContourParams = DEFAULT_STRAND_ARC,
  basePixelSize: number
) {
  if (placedBeads.length === 0) return [];

  const SAMPLES = 300;
  const angles: number[] = [];
  const lengths: number[] = [0];
  const { centerX, centerY, rx, ry, startAngle, endAngle } = params;

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const a = startAngle + t * (endAngle - startAngle);
    angles.push(a);
    if (i > 0) {
      const prevA = angles[i - 1];
      const x1 = centerX + rx * Math.cos(prevA);
      const y1 = centerY + ry * Math.sin(prevA);
      const x2 = centerX + rx * Math.cos(a);
      const y2 = centerY + ry * Math.sin(a);
      lengths.push(lengths[i - 1] + Math.hypot(x2 - x1, y2 - y1));
    }
  }

  const rawTotalArcLength = lengths[lengths.length - 1];
  const usableStart = MARGIN_BUFFER_PX;
  const usableEnd = Math.max(usableStart + 10, rawTotalArcLength - MARGIN_BUFFER_PX);
  const usableLength = usableEnd - usableStart;

  // Sort beads by slot index for sequential placement
  const sorted = [...placedBeads].sort((a, b) => a.slotIndex - b.slotIndex);

  // Calculate total physical width of all placed beads in arc-pixels
  // Convert mm to arc-pixels proportionally
  const totalBeadWidthMm = sorted.reduce((acc, b) => acc + (b.widthMm || b.sizeMm || 8), 0);
  // Scale factor: how many arc-pixels per mm
  const arcPixelsPerMm = usableLength / Math.max(totalBeadWidthMm, 1);
  // But cap it so beads don't stretch beyond reasonable spacing
  const effectiveScale = Math.min(arcPixelsPerMm, usableLength / (sorted.length * 6));

  // Calculate gap: distribute remaining space as gaps between beads
  const totalBeadArcWidth = sorted.reduce((acc, b) => {
    const w = (b.widthMm || b.sizeMm || 8) * effectiveScale;
    return acc + Math.max(w, basePixelSize * 0.5);
  }, 0);
  const totalGap = Math.max(0, usableLength - totalBeadArcWidth);
  const gapPerBead = sorted.length > 1 ? totalGap / (sorted.length - 1) : 0;

  // Position each bead sequentially along the arc
  const positions: { x: number; y: number; angle: number; beadSizePx: number; placedId: string }[] = [];
  let cursor = usableStart;

  for (const bead of sorted) {
    const beadWidthMm = bead.widthMm || bead.sizeMm || 8;
    const beadArcWidth = Math.max(beadWidthMm * effectiveScale, basePixelSize * 0.5);
    const beadCenter = cursor + beadArcWidth / 2;

    // Find the position on the arc at this distance
    let idx = 0;
    while (idx < lengths.length - 1 && lengths[idx + 1] < beadCenter) {
      idx++;
    }
    const len1 = lengths[idx];
    const len2 = lengths[idx + 1] || len1;
    const a1 = angles[idx];
    const a2 = angles[idx + 1] || a1;
    const frac = len2 > len1 ? (beadCenter - len1) / (len2 - len1) : 0;
    const angle = a1 + frac * (a2 - a1);

    const x = centerX + rx * Math.cos(angle);
    const y = centerY + ry * Math.sin(angle);
    const dx = -rx * Math.sin(angle);
    const dy = ry * Math.cos(angle);
    const tangentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Visual bead size proportional to its sizeMm
    const beadSizePx = basePixelSize * ((bead.sizeMm || 8) / REFERENCE_BEAD_SIZE_MM);

    positions.push({ x, y, angle: tangentAngle, beadSizePx, placedId: bead.placedId });

    cursor += beadArcWidth + gapPerBead;
  }

  return positions;
}

// Closed-loop product preview slot math (360-degree full wrap)
function getClosedLoopSlotPositions(totalSlots: number) {
  const SAMPLES = 360;
  const angles: number[] = [];
  const lengths: number[] = [0];

  const startAngle = -Math.PI / 2; // 12 o'clock top knot position
  const endAngle = (3 * Math.PI) / 2; // Full 360 wrap around back to top

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const a = startAngle + t * (endAngle - startAngle);
    angles.push(a);
    if (i > 0) {
      const prevA = angles[i - 1];
      const x1 = CLOSED_LOOP_CENTER_X + CLOSED_LOOP_RX * Math.cos(prevA);
      const y1 = CLOSED_LOOP_CENTER_Y + CLOSED_LOOP_RY * Math.sin(prevA);
      const x2 = CLOSED_LOOP_CENTER_X + CLOSED_LOOP_RX * Math.cos(a);
      const y2 = CLOSED_LOOP_CENTER_Y + CLOSED_LOOP_RY * Math.sin(a);
      lengths.push(lengths[i - 1] + Math.hypot(x2 - x1, y2 - y1));
    }
  }

  const totalArcLength = lengths[lengths.length - 1];
  const stepLength = totalSlots > 0 ? totalArcLength / totalSlots : 0;

  const positions: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i < totalSlots; i++) {
    const targetLen = i * stepLength;
    let idx = 0;
    while (idx < lengths.length - 1 && lengths[idx + 1] < targetLen) {
      idx++;
    }
    const len1 = lengths[idx];
    const len2 = lengths[idx + 1] || len1;
    const a1 = angles[idx];
    const a2 = angles[idx + 1] || a1;
    const frac = len2 > len1 ? (targetLen - len1) / (len2 - len1) : 0;
    const angle = a1 + frac * (a2 - a1);

    const x = CLOSED_LOOP_CENTER_X + CLOSED_LOOP_RX * Math.cos(angle);
    const y = CLOSED_LOOP_CENTER_Y + CLOSED_LOOP_RY * Math.sin(angle);
    const dx = -CLOSED_LOOP_RX * Math.sin(angle);
    const dy = CLOSED_LOOP_RY * Math.cos(angle);
    const tangentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    positions.push({ x, y, angle: tangentAngle });
  }

  return { positions, totalArcLength };
}

// Compute a base pixel size for beads that looks good at the given slot density
function computeBaseBeadSize(totalArcLength: number, beadCount: number) {
  if (beadCount <= 0) return 32;
  const stepDistance = totalArcLength / Math.max(1, beadCount);
  return Math.max(22, Math.min(44, stepDistance * 0.92));
}

function SlotItem({
  slotIndex,
  pos,
  baseBeadSize,
  onSelectSlot,
}: {
  slotIndex: number;
  pos: { x: number; y: number };
  isTaken?: boolean;
  baseBeadSize: number;
  compact?: boolean;
  viewMode?: "strand" | "preview";
  onSelectSlot: (slotIndex: number) => void;
}) {
  const hitRadius = Math.max(28, baseBeadSize / 2 + 12);

  return (
    <g
      onClick={() => onSelectSlot(slotIndex)}
      className="cursor-pointer group"
    >
      <circle cx={pos.x} cy={pos.y} r={hitRadius} fill="transparent" />
    </g>
  );
}

function PlacedBeadItem({
  placed,
  pos,
  baseBeadSize,
  isSelected,
  readOnly = false,
  onSelect,
}: {
  placed: PlacedBead;
  pos: { x: number; y: number; angle: number };
  baseBeadSize: number;
  isSelected: boolean;
  viewMode?: "strand" | "preview";
  readOnly?: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `placed-${placed.placedId}`,
    data: { type: "placed-bead", placed },
    disabled: readOnly,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `placed-${placed.placedId}`,
    data: { type: "placed-bead", placed },
    disabled: readOnly,
  });

  const dragEndedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!isDragging) {
      dragEndedAtRef.current = Date.now();
    }
  }, [isDragging]);

  const setCombinedRef = (node: SVGGElement | null) => {
    setDragRef(node as unknown as HTMLElement);
    setDropRef(node as unknown as HTMLElement);
  };

  const beadSize = baseBeadSize * (placed.size || 1);
  const rotationAngle = (pos.angle || 0) + (placed.rotation || 0);

  const clipId = `bead-clip-${placed.placedId.replace(/[^a-zA-Z0-9]/g, "-")}`;
  const isCustomBead = placed.category === "custom" || placed.id.startsWith("custom");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    if (Date.now() - dragEndedAtRef.current < 250) return;
    onSelect();
  };

  return (
    <g
      ref={setCombinedRef}
      {...(readOnly ? {} : listeners)}
      {...(readOnly ? {} : attributes)}
      transform={`translate(${pos.x}, ${pos.y}) rotate(${rotationAngle})`}
      onClick={handleClick}
      filter="url(#bead-shadow)"
      className={
        readOnly
          ? "cursor-default select-none pointer-events-none outline-none"
          : `cursor-pointer select-none outline-none focus:outline-none ${isDragging ? "opacity-30" : ""}`
      }
      style={{ outline: "none" }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="0" cy="0" r={beadSize / 2} />
        </clipPath>
      </defs>

      {!readOnly && (
        <circle cx="0" cy="0" r={Math.max(24, beadSize / 2 + 10)} fill="transparent" className="cursor-pointer" />
      )}

      {/* Selected Bead Ring - Clean Dotted Gold Circle Ring */}
      {isSelected && (
        <circle
          r={beadSize / 2 + 6}
          fill="none"
          stroke="#d4af37"
          strokeWidth="2.5"
          strokeDasharray="4 3"
        />
      )}

      {/* Drag Hover Target Ring */}
      {isOver && !isDragging && (
        <circle
          r={beadSize / 2 + 7}
          fill="rgba(212, 175, 55, 0.25)"
          stroke="#d4af37"
          strokeWidth="3"
        />
      )}

      <image
        href={placed.imageUrl}
        x={-beadSize / 2}
        y={-beadSize / 2}
        width={beadSize}
        height={beadSize}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#${clipId})`}
      />
    </g>
  );
}

function ClearStrandButton({ onClearStrand }: { onClearStrand: () => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "trash-zone",
    data: { type: "trash-zone" },
  });

  const handleClick = () => {
    if (window.confirm("Clear the entire strand? This will remove all placed beads from your design.")) {
      onClearStrand();
    }
  };

  return (
    <button
      ref={setNodeRef}
      onClick={handleClick}
      className={`w-8 h-8 rounded-full border transition-all shadow-xs flex items-center justify-center ml-2 ${
        isOver
          ? "bg-destructive text-white border-destructive scale-125 ring-4 ring-destructive/30"
          : "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20 hover:border-destructive/60"
      }`}
      title="Clear strand or drag bead here to delete"
    >
      <span className="material-symbols-outlined text-sm">delete_forever</span>
    </button>
  );
}

type Props = {
  allBeads?: Bead[];
  onSelectSlot?: (slotIndex: number) => void;
  onSelectPlacedBead?: (placedBead: PlacedBead) => void;
  selectedPlacedBeadId?: string | null;
  isSwapMode?: boolean;
  hasSelectedTrayBead?: boolean;
  compact?: boolean;
  readOnly?: boolean;
  defaultViewMode?: "strand" | "preview";
};

export function BraceletCanvas({
  onSelectSlot,
  onSelectPlacedBead,
  selectedPlacedBeadId,
  isSwapMode = false,
  hasSelectedTrayBead = false,
  compact = false,
  readOnly = false,
  defaultViewMode,
}: Props) {
  const { placedBeads, config, removeBead, setWristInches, reset, lastError, clearError } = useBraceletStore();
  const physCap = calculateStrandPhysicalCapacity(placedBeads, config);
  const [viewMode, setViewMode] = useState<"strand" | "preview">(defaultViewMode || (compact ? "preview" : "strand"));
  const [mounted, setMounted] = useState(false);
  const [wristInputVal, setWristInputVal] = useState(config.wristInches.toFixed(1));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setWristInputVal(config.wristInches.toFixed(1));
  }, [config.wristInches]);

  const previewSlotCount = Math.max(1, placedBeads.length);
  const { positions: slots, totalArcLength } = viewMode === "preview" 
    ? getClosedLoopSlotPositions(previewSlotCount)
    : getUniformSlotPositions(config.totalSlots, DEFAULT_STRAND_ARC);

  // In preview, sort beads by slotIndex so the circular order matches the strand layout
  const sortedBeadsForPreview = viewMode === "preview"
    ? [...placedBeads].sort((a, b) => a.slotIndex - b.slotIndex)
    : null;

  const stepDistance = viewMode === "preview"
    ? totalArcLength / Math.max(1, previewSlotCount)
    : totalArcLength / (config.totalSlots - 1 || 1);
  const baseBeadSize = Math.max(22, Math.min(44, stepDistance * 1.02));

  const { centerX, centerY, rx, ry, startAngle, endAngle } = DEFAULT_STRAND_ARC;

  // Generate exact SVG path data by sampling points along the identical arc function used for slot calculation
  const PATH_SAMPLES = 60;
  const pathPoints: string[] = [];
  for (let i = 0; i <= PATH_SAMPLES; i++) {
    const t = i / PATH_SAMPLES;
    const a = startAngle + t * (endAngle - startAngle);
    const px = centerX + rx * Math.cos(a);
    const py = centerY + ry * Math.sin(a);
    pathPoints.push(`${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`);
  }
  const strandPathData = pathPoints.join(" ");

  const handleWristInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setWristInputVal(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num >= 4.5 && num <= 10.0) {
      setWristInches(Math.round(num * 10) / 10);
    }
  };

  const handleWristInputBlur = () => {
    const num = parseFloat(wristInputVal);
    if (isNaN(num)) {
      setWristInputVal(config.wristInches.toFixed(1));
    } else {
      const clamped = Math.max(4.5, Math.min(10.0, Math.round(num * 10) / 10));
      setWristInches(clamped);
      setWristInputVal(clamped.toFixed(1));
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-card rounded-2xl border border-border">
        <span className="text-xs text-muted-foreground animate-pulse">Initializing Customizer Studio...</span>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "relative w-full h-full min-h-0 flex flex-col items-center justify-center select-none overflow-hidden p-1"
          : "relative w-full h-full min-h-[200px] sm:min-h-[260px] lg:min-h-[300px] flex flex-col items-center justify-between rounded-2xl border border-border/80 bg-gradient-to-b from-background via-muted/20 to-background p-2 sm:p-3 md:p-4 shadow-xs select-none overflow-hidden"
      }
    >
      {/* Canvas Top Bar Controls — Restructured into 3 Rows on Mobile (<640px) */}
      {!compact && (
        <div className="w-full flex flex-col sm:flex-row justify-between items-center z-20 gap-2 sm:gap-3">
          {/* Row 1 & 2 on Mobile: Wrist Stepper + Capacity Readout */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Row 1: Wrist Size Stepper (Full width on mobile, 44px touch targets) */}
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-card border border-border/80 px-2 py-1 sm:py-1 rounded-full text-xs font-semibold shadow-xs min-h-[44px]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">straighten</span>
                <span className="text-foreground font-medium text-[13px]">Wrist:</span>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setWristInches(Math.max(4.5, Math.round((config.wristInches - 0.1) * 10) / 10))}
                  className="w-9 h-9 sm:w-6 sm:h-6 rounded-full bg-muted border border-border/80 hover:bg-muted/80 text-foreground text-sm font-bold flex items-center justify-center transition-colors shadow-xs active:scale-95 cursor-pointer min-w-[36px] min-h-[36px]"
                  title="Decrease 0.1 in"
                  aria-label="Decrease wrist size"
                >
                  -
                </button>

                <div className="flex items-center justify-center gap-0.5 bg-muted/80 px-2 py-1 rounded-md border border-border/80 focus-within:ring-1 focus-within:ring-primary/60 shadow-inner min-h-[36px]">
                  <input
                    type="number"
                    step="0.1"
                    min="4.5"
                    max="10.0"
                    value={wristInputVal}
                    onChange={handleWristInputChange}
                    onBlur={handleWristInputBlur}
                    className="w-8 sm:w-7 text-[13px] font-medium text-primary text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 m-0"
                    aria-label="Wrist size in inches"
                    title="Type exact wrist size in inches"
                  />
                  <span className="text-[13px] font-medium text-primary select-none">&quot;</span>
                </div>

                <button
                  onClick={() => setWristInches(Math.min(10.0, Math.round((config.wristInches + 0.1) * 10) / 10))}
                  className="w-9 h-9 sm:w-6 sm:h-6 rounded-full bg-muted border border-border/80 hover:bg-muted/80 text-foreground text-sm font-bold flex items-center justify-center transition-colors shadow-xs active:scale-95 cursor-pointer min-w-[36px] min-h-[36px]"
                  title="Increase 0.1 in"
                  aria-label="Increase wrist size"
                >
                  +
                </button>

                <span className="text-[11px] font-medium text-muted-foreground ml-1">({Math.round(config.wristInches * 2.54)}cm)</span>
              </div>
            </div>

            {/* Row 2: Capacity Readout Bar (Full width on mobile) */}
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-card/60 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-xl sm:rounded-none border sm:border-none border-border/60 text-[12px] font-medium text-muted-foreground min-h-[36px]">
              <span>Usage:</span>
              <strong className={`font-medium text-[13px] ${physCap.isFull ? "text-destructive" : "text-primary"}`}>
                {physCap.usedMm}/{physCap.capacityMm}mm
              </strong>
              <div className="flex-1 sm:w-16 h-2 rounded-full bg-muted/90 overflow-hidden border border-border/70 max-w-[120px] sm:max-w-none">
                <div
                  className={`h-full transition-all duration-300 ${
                    physCap.percentUsed >= 100 || physCap.isFull
                      ? "bg-destructive"
                      : physCap.percentUsed >= 80
                      ? "bg-amber-600"
                      : "bg-primary"
                  }`}
                  style={{
                    width: physCap.usedMm > 0 ? `${Math.max(8, physCap.percentUsed)}%` : "0%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 3 on Mobile: Segmented View Toggle + Clear Button (Right aligned) */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-1.5 border-t sm:border-t-0 border-border/40 pt-1.5 sm:pt-0">
            <div className="flex bg-card p-0.5 rounded-full border border-border/80 shadow-xs min-h-[40px] items-center">
              <button
                onClick={() => setViewMode("strand")}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1 transition-all min-h-[36px] cursor-pointer ${
                  viewMode === "strand" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Strand View (Interactive Builder)"
              >
                <span className="material-symbols-outlined text-sm">polyline</span>
                <span>Strand</span>
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1 transition-all min-h-[36px] cursor-pointer ${
                  viewMode === "preview" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Preview Mode (Closed Loop Product Shot)"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>Preview</span>
              </button>
            </div>

            {/* Icon-Only Clear Strand Button - 40x40px touch zone */}
            <ClearStrandButton onClearStrand={reset} />
          </div>
        </div>
      )}

      {/* Capacity / Fit Error Alert Bar */}
      {lastError && !compact && (
        <div className="w-full bg-destructive/15 border border-destructive/40 text-destructive text-[12px] font-medium px-3 py-2 rounded-xl flex items-center justify-between z-20 animate-in fade-in my-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{lastError}</span>
          </div>
          <button onClick={clearError} className="hover:opacity-75 min-w-[36px] min-h-[36px] flex items-center justify-center">
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        </div>
      )}

      {/* Main Interactive Canvas Stage */}
      <div className={`relative w-full max-w-[750px] flex items-center justify-center my-auto ${
        viewMode === "preview" ? "h-[220px] sm:h-[280px]" : "h-[180px] sm:h-[200px]"
      }`}>

        <svg viewBox={`0 0 ${CANVAS_WIDTH} ${viewMode === "preview" ? CANVAS_HEIGHT_PREVIEW : CANVAS_HEIGHT}`} className="w-full h-full z-10 rounded-2xl">
          <defs>
            {/* 3D Glass Cabochon Dome Highlight */}
            <radialGradient id="cabochon-shine" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
            </radialGradient>

            {/* Soft Contact Drop Shadow for Bead Depth */}
            <filter id="bead-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.12" />
            </filter>

            {/* Pure Crystal Silicone Elastic Stretch Cord Gradient */}
            <linearGradient id="elastic-strand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d1d5db" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="70%" stopColor="#f3f4f6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Closed Loop Product Preview Presentation Layer */}
          {viewMode === "preview" ? (
            <g className="animate-in fade-in zoom-in-95 duration-400">
              {/* Soft Ambient Product Shadow Beneath Closed Loop */}
              <ellipse
                cx={CLOSED_LOOP_CENTER_X}
                cy={CLOSED_LOOP_CENTER_Y + 14}
                rx={CLOSED_LOOP_RX + 6}
                ry={CLOSED_LOOP_RY + 6}
                fill="none"
                stroke="rgba(0,0,0,0.14)"
                strokeWidth="16"
                filter="blur(8px)"
              />

              {/* Crystal Silicone Elastic Base Cord */}
              <ellipse
                cx={CLOSED_LOOP_CENTER_X}
                cy={CLOSED_LOOP_CENTER_Y}
                rx={CLOSED_LOOP_RX}
                ry={CLOSED_LOOP_RY}
                fill="none"
                stroke="url(#elastic-strand-grad)"
                strokeWidth="3.5"
              />

              {/* Crystal Core Gloss Highlight Ring */}
              <ellipse
                cx={CLOSED_LOOP_CENTER_X}
                cy={CLOSED_LOOP_CENTER_Y}
                rx={CLOSED_LOOP_RX}
                ry={CLOSED_LOOP_RY}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.9"
              />

              {/* Top Crystal Knot Join (12 o'clock Loop Join) */}
              <g transform={`translate(${CLOSED_LOOP_CENTER_X}, ${CLOSED_LOOP_CENTER_Y - CLOSED_LOOP_RY})`}>
                <circle r="5" fill="url(#elastic-strand-grad)" stroke="#9ca3af" strokeWidth="1" filter="url(#bead-shadow)" />
                <circle r="2" fill="#ffffff" opacity="0.95" />
              </g>
            </g>
          ) : (
            /* Strand View Open Arc Cord Cable */
            <g className="animate-in fade-in duration-300">
              {/* Underlying Soft Shadow */}
              <path
                d={strandPathData}
                fill="none"
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Primary Crystal Silicone Cord */}
              <path
                d={strandPathData}
                fill="none"
                stroke="url(#elastic-strand-grad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Crystal Specular Gloss Line */}
              <path
                d={strandPathData}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.9"
                strokeLinecap="round"
              />

              {/* Left Silicone Knot End Cap */}
              <g transform={`translate(${centerX + rx * Math.cos(startAngle)}, ${centerY + ry * Math.sin(startAngle)})`}>
                <circle r="5.5" fill="url(#elastic-strand-grad)" stroke="#9ca3af" strokeWidth="1" filter="url(#bead-shadow)" />
                <circle r="2.5" fill="#ffffff" opacity="0.95" />
              </g>

              {/* Right Silicone Knot End Cap */}
              <g transform={`translate(${centerX + rx * Math.cos(endAngle)}, ${centerY + ry * Math.sin(endAngle)})`}>
                <circle r="5.5" fill="url(#elastic-strand-grad)" stroke="#9ca3af" strokeWidth="1" filter="url(#bead-shadow)" />
                <circle r="2.5" fill="#ffffff" opacity="0.95" />
              </g>
            </g>
          )}

          {/* Slot Target Elements */}
          {slots.map((pos, index) => {
            const isTaken = placedBeads.some((b) => b.slotIndex === index);
            return (
              <SlotItem
                key={`slot-${index}`}
                slotIndex={index}
                pos={pos}
                isTaken={isTaken}
                baseBeadSize={baseBeadSize}
                compact={compact}
                viewMode={viewMode}
                onSelectSlot={(idx) => onSelectSlot && onSelectSlot(idx)}
              />
            );
          })}

          {/* Placed Bead Elements */}
          {(viewMode === "preview" ? sortedBeadsForPreview! : placedBeads).map((placed, idx) => {
            const pos = viewMode === "preview" ? slots[idx] : slots[placed.slotIndex];
            if (!pos) return null;
            const isSelected = selectedPlacedBeadId === placed.placedId;

            return (
              <PlacedBeadItem
                key={placed.placedId}
                placed={placed}
                pos={pos}
                baseBeadSize={baseBeadSize}
                isSelected={isSelected}
                viewMode={viewMode}
                readOnly={readOnly}
                onSelect={() => onSelectPlacedBead && onSelectPlacedBead(placed)}
              />
            );
          })}
        </svg>
      </div>

      {/* On-Canvas Hint Text Banner */}
      {!compact && (
        <div className="w-full text-center py-1.5 px-3 bg-muted/40 rounded-xl border border-border/50 text-[12px] font-medium text-muted-foreground flex items-center justify-center gap-1.5 z-10 my-1">
          <span className="material-symbols-outlined text-sm text-primary">touch_app</span>
          <span>
            {hasSelectedTrayBead
              ? "Tap an empty slot to place your bead, or tap an existing bead to swap them directly."
              : "Select a bead below to add or swap. On desktop/tablet, drag beads to swap positions or drag to trash."}
          </span>
        </div>
      )}
    </div>
  );
}
