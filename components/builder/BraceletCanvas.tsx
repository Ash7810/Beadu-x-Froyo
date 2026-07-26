import { useState, useEffect, useRef } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useBraceletStore } from "@/store/braceletStore";
import { Bead, PlacedBead } from "@/lib/types";
import { calculateStrandPhysicalCapacity } from "@/lib/pricing";

export type ArcContourParams = {
  centerX: number;
  centerY: number;
  rx: number;
  ry: number;
  startAngle: number;
  endAngle: number;
};

// Comfortably proportioned Strand arc geometry positioned directly near top bar with balanced padding
const DEFAULT_STRAND_ARC: ArcContourParams = {
  centerX: 375,
  centerY: 75,
  rx: 310,
  ry: 105,
  startAngle: Math.PI * 0.86,
  endAngle: Math.PI * 0.14,
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

  return { positions, totalArcLength: usableArcLength };
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

function DroppableSlotItem({
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
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slotIndex}`,
    data: { slotIndex },
  });

  const hitRadius = Math.max(26, baseBeadSize / 2 + 10);

  return (
    <g
      ref={(node: SVGGElement | null) => setNodeRef(node as unknown as HTMLElement)}
      onClick={() => onSelectSlot(slotIndex)}
      className="cursor-pointer group"
    >
      {/* Large invisible hit box for effortless drag & touch drop */}
      <circle cx={pos.x} cy={pos.y} r={hitRadius} fill="transparent" />

      {/* Active Drag-Hover Drop Target Indicator Halo */}
      {isOver && (
        <circle
          cx={pos.x}
          cy={pos.y}
          r={baseBeadSize / 2 + 7}
          fill="rgba(212, 175, 55, 0.2)"
          stroke="#d4af37"
          strokeWidth="2.5"
          strokeDasharray="4 2"
          className="animate-spin-slow"
        />
      )}
    </g>
  );
}

function DraggablePlacedBeadItem({
  placed,
  pos,
  baseBeadSize,
  isSelected,
  viewMode = "strand",
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
    // Ignore residual click events fired immediately after a drag-and-drop placement operation (< 250ms)
    if (Date.now() - dragEndedAtRef.current < 250) {
      return;
    }
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
          ? "cursor-default select-none pointer-events-none"
          : `cursor-grab active:cursor-grabbing touch-none select-none transition-transform duration-200 ${
              isDragging ? "opacity-40 scale-125 font-bold" : "hover:scale-115"
            }`
      }
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="0" cy="0" r={beadSize / 2} />
        </clipPath>
      </defs>

      {/* Invisible hit circle to guarantee mouse drag and click capture */}
      {!readOnly && (
        <circle cx="0" cy="0" r={Math.max(20, beadSize / 2 + 4)} fill="transparent" className="cursor-grab active:cursor-grabbing" />
      )}

      {/* Selected Bead Indicator Halo */}
      {isSelected && (
        <circle
          r={beadSize / 2 + 6}
          fill="none"
          stroke="#d4af37"
          strokeWidth="2.5"
          strokeDasharray="4 2"
          className="animate-spin-slow"
        />
      )}

      {/* Swap Target Indicator Halo (when hovering another bead over this placed bead) */}
      {isOver && !isDragging && (
        <circle
          r={beadSize / 2 + 7}
          fill="rgba(212, 175, 55, 0.25)"
          stroke="#d4af37"
          strokeWidth="3"
          strokeDasharray="4 2"
          className="animate-pulse"
        />
      )}

      {isCustomBead ? (
        <g>
          {/* Custom Photo Bead Glass Cabochon Medallion */}
          <image
            href={placed.imageUrl}
            x={-beadSize / 2}
            y={-beadSize / 2}
            width={beadSize}
            height={beadSize}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
          {/* Glass Dome Highlight Shine Overlay */}
          <circle cx="0" cy="0" r={beadSize / 2} fill="url(#cabochon-shine)" pointerEvents="none" />
        </g>
      ) : (
        <image
          href={placed.imageUrl}
          x={-beadSize / 2}
          y={-beadSize / 2}
          width={beadSize}
          height={beadSize}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
    </g>
  );
}

function TrashZoneDropTarget({ onClearStrand }: { onClearStrand: () => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "trash-zone",
    data: { type: "trash" },
  });

  const handleClick = () => {
    if (window.confirm("Clear the entire strand? This will remove all placed beads from your design.")) {
      onClearStrand();
    }
  };

  return (
    <button
      ref={(node: HTMLButtonElement | null) => setNodeRef(node as unknown as HTMLElement)}
      onClick={handleClick}
      className={`w-8 h-8 rounded-full border transition-all shadow-xs flex items-center justify-center ml-2 ${
        isOver
          ? "bg-destructive text-white border-destructive scale-110 shadow-md ring-2 ring-destructive/40 animate-pulse"
          : "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20 hover:border-destructive/60"
      }`}
      title="Clear entire strand design"
    >
      <span className="material-symbols-outlined text-sm">delete_forever</span>
    </button>
  );
}

type Props = {
  allBeads?: Bead[];
  onSelectSlot?: (slotIndex: number) => void;
  compact?: boolean;
  readOnly?: boolean;
  defaultViewMode?: "strand" | "preview";
};

export function BraceletCanvas({
  onSelectSlot,
  compact = false,
  readOnly = false,
  defaultViewMode,
}: Props) {
  const { placedBeads, config, removeBead, rotateBead, duplicateBead, setWristInches, reset } = useBraceletStore();
  const physCap = calculateStrandPhysicalCapacity(placedBeads, config);
  const [selectedPlacedBead, setSelectedPlacedBead] = useState<PlacedBead | null>(null);
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
  const strandPathData = `M ${centerX + rx * Math.cos(startAngle)} ${centerY + ry * Math.sin(startAngle)} A ${rx} ${ry} 0 0 0 ${centerX + rx * Math.cos(endAngle)} ${centerY + ry * Math.sin(endAngle)}`;

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
      {/* Canvas Top Bar Controls */}
      {!compact && (
        <div className="w-full flex flex-row justify-between items-center z-20 gap-1 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* LEFT: Wrist Size Stepper & Capacity Readout */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Wrist Size Stepper */}
            <div className="flex items-center gap-1 bg-card border border-border/80 px-1.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold shadow-xs">
              <span className="material-symbols-outlined text-primary text-xs sm:text-sm pl-0.5">straighten</span>
              <span className="text-foreground font-bold text-[10px] sm:text-[11px] hidden xs:inline">Wrist:</span>
              
              <button
                onClick={() => setWristInches(Math.max(4.5, Math.round((config.wristInches - 0.1) * 10) / 10))}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-muted/80 border border-border/80 hover:bg-muted text-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
                title="Decrease 0.1 in"
              >
                -
              </button>

              <div className="flex items-center gap-0.5 bg-muted/80 px-1 py-0.5 rounded-md border border-border/80 focus-within:ring-1 focus-within:ring-primary/60 shadow-inner">
                <input
                  type="number"
                  step="0.1"
                  min="4.5"
                  max="10.0"
                  value={wristInputVal}
                  onChange={handleWristInputChange}
                  onBlur={handleWristInputBlur}
                  className="w-6 sm:w-7 text-[10px] sm:text-[11px] font-bold text-primary text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 m-0"
                  aria-label="Wrist size in inches"
                  title="Type exact wrist size in inches"
                />
                <span className="text-[10px] sm:text-[11px] font-bold text-primary select-none">&quot;</span>
              </div>

              <button
                onClick={() => setWristInches(Math.min(10.0, Math.round((config.wristInches + 0.1) * 10) / 10))}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-muted/80 border border-border/80 hover:bg-muted text-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
                title="Increase 0.1 in"
              >
                +
              </button>

              <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground pr-0.5">({Math.round(config.wristInches * 2.54)}cm)</span>
            </div>

            {/* Read-Only Capacity Readout */}
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
              <span className="hidden sm:inline">Usage:</span>
              <strong className={`font-bold ${physCap.isFull ? "text-destructive" : "text-primary"}`}>
                {physCap.usedMm}/{physCap.capacityMm}mm
              </strong>
              <div className="w-8 sm:w-16 h-1.5 sm:h-2 rounded-full bg-muted/90 overflow-hidden border border-border/70">
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

          {/* RIGHT: Segmented View Toggle + Clear Button */}
          <div className="flex items-center gap-1">
            <div className="flex bg-card p-0.5 rounded-full border border-border/80 shadow-xs">
              <button
                onClick={() => setViewMode("strand")}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === "strand" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Strand View (Interactive Builder)"
              >
                <span className="material-symbols-outlined text-xs sm:text-sm">polyline</span>
                <span>Strand</span>
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === "preview" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Preview Mode (Closed Loop Product Shot)"
              >
                <span className="material-symbols-outlined text-xs sm:text-sm">visibility</span>
                <span>Preview</span>
              </button>
            </div>

            {/* Icon-Only Clear Strand Button */}
            <TrashZoneDropTarget onClearStrand={reset} />
          </div>
        </div>
      )}

      {/* Main Interactive Canvas Stage */}
      <div className={`relative w-full max-w-[750px] flex items-center justify-center my-auto ${
        viewMode === "preview" ? "h-[240px] sm:h-[280px]" : "h-[180px] sm:h-[200px]"
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

            {/* Gold Metallic Cord Gradient */}
            <linearGradient id="gold-strand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b8860b" />
              <stop offset="35%" stopColor="#fff8dc" />
              <stop offset="70%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#8b6508" />
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
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="20"
                filter="blur(10px)"
              />

              {/* Closed Loop Base Cord Cable */}
              <ellipse
                cx={CLOSED_LOOP_CENTER_X}
                cy={CLOSED_LOOP_CENTER_Y}
                rx={CLOSED_LOOP_RX}
                ry={CLOSED_LOOP_RY}
                fill="none"
                stroke="url(#gold-strand-grad)"
                strokeWidth="5"
              />

              {/* Specular Highlight Cord Ring */}
              <ellipse
                cx={CLOSED_LOOP_CENTER_X}
                cy={CLOSED_LOOP_CENTER_Y}
                rx={CLOSED_LOOP_RX}
                ry={CLOSED_LOOP_RY}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.6"
              />

              {/* Top Jewelry Knot Clasp Terminal (12 o'clock Loop Join) */}
              <g transform={`translate(${CLOSED_LOOP_CENTER_X}, ${CLOSED_LOOP_CENTER_Y - CLOSED_LOOP_RY})`}>
                <circle r="9" fill="url(#gold-strand-grad)" stroke="#735c00" strokeWidth="1.5" filter="url(#bead-shadow)" />
                <circle r="4" fill="#ffffff" opacity="0.7" />
              </g>
            </g>
          ) : (
            /* Strand View Open Arc Cord Cable */
            <g className="animate-in fade-in duration-300">
              {/* Underlying Cable Shadow */}
              <path
                d={strandPathData}
                fill="none"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="9"
                strokeLinecap="round"
              />

              {/* Primary Cord Body */}
              <path
                d={strandPathData}
                fill="none"
                stroke="url(#gold-strand-grad)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Core Metallic Specular Shine */}
              <path
                d={strandPathData}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.6"
                strokeLinecap="round"
              />

              {/* Left Clasp Terminal */}
              <g transform={`translate(${centerX + rx * Math.cos(startAngle)}, ${centerY + ry * Math.sin(startAngle)})`}>
                <circle r="10" fill="url(#gold-strand-grad)" stroke="#735c00" strokeWidth="1.5" filter="url(#bead-shadow)" />
                <circle r="5" fill="#ffffff" opacity="0.7" />
                <rect x="-14" y="-3" width="7" height="6" rx="2" fill="#d4af37" stroke="#735c00" strokeWidth="1" />
              </g>

              {/* Right Clasp Terminal */}
              <g transform={`translate(${centerX + rx * Math.cos(endAngle)}, ${centerY + ry * Math.sin(endAngle)})`}>
                <circle r="10" fill="url(#gold-strand-grad)" stroke="#735c00" strokeWidth="1.5" filter="url(#bead-shadow)" />
                <circle r="5" fill="#ffffff" opacity="0.7" />
                <rect x="7" y="-3" width="7" height="6" rx="2" fill="#d4af37" stroke="#735c00" strokeWidth="1" />
              </g>
            </g>
          )}

          {/* Droppable Slot Target Elements */}
          {slots.map((pos, index) => {
            const isTaken = placedBeads.some((b) => b.slotIndex === index);
            return (
              <DroppableSlotItem
                key={`droppable-slot-${index}`}
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
            const isSelected = selectedPlacedBead?.placedId === placed.placedId;

            return (
              <DraggablePlacedBeadItem
                key={placed.placedId}
                placed={placed}
                pos={pos}
                baseBeadSize={baseBeadSize}
                isSelected={isSelected}
                viewMode={viewMode}
                readOnly={readOnly}
                onSelect={() => setSelectedPlacedBead(placed)}
              />
            );
          })}
        </svg>
      </div>

      {/* Selected Bead Actions Control Drawer with Isolated Top-Right Close Button & Light Red Remove Button */}
      {!compact && (
        selectedPlacedBead ? (
          <div className="relative w-full bg-card border border-border/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 z-20">
            {/* Isolated Top-Right Close Affordance */}
            <button
              onClick={() => setSelectedPlacedBead(null)}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center shadow-xs"
              title="Close details"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>

            <div className="flex items-center gap-3 pr-8 sm:pr-0">
              <img
                src={selectedPlacedBead.imageUrl}
                alt={selectedPlacedBead.name}
                className="w-10 h-10 object-contain p-1 bg-muted/60 rounded-xl border border-border/80 shadow-xs"
              />
              <div>
                <h4 className="text-xs font-bold text-foreground">{selectedPlacedBead.name}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Bead {placedBeads.findIndex((b) => b.placedId === selectedPlacedBead.placedId) + 1} of {placedBeads.length} • {selectedPlacedBead.material} •{" "}
                  <span className="text-primary font-bold">
                    {selectedPlacedBead.isPremium ? `₹${selectedPlacedBead.price}` : "Free"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pr-2 sm:pr-6">
              <button
                onClick={() => duplicateBead(selectedPlacedBead.placedId)}
                className="px-3 py-1.5 bg-muted/80 text-foreground text-xs font-bold rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                <span>Duplicate</span>
              </button>

              {selectedPlacedBead.rotationAllowed && (
                <button
                  onClick={() => rotateBead(selectedPlacedBead.placedId, (selectedPlacedBead.rotation + 45) % 360)}
                  className="px-3 py-1.5 bg-muted/80 text-foreground text-xs font-bold rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">rotate_right</span>
                  <span>Rotate</span>
                </button>
              )}

              {/* Visually Lighter Red Outline/Fill Remove Button */}
              <button
                onClick={() => {
                  removeBead(selectedPlacedBead.placedId);
                  setSelectedPlacedBead(null);
                }}
                className="px-3 py-1.5 border border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/15 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
