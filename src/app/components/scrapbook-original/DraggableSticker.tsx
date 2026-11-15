import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Trash2, RotateCcw, RotateCw, GripHorizontal, Minus, Plus } from 'lucide-react';
import { useStickers } from './StickerContext';
import { getScrapbookScale } from './scrapbookUtils';

interface DraggableStickerProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function stringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function DraggableSticker({ id, children, className, style }: DraggableStickerProps) {
  const stickers = useStickers();

  // Generate a stable unique ID based on the layout styling if not provided
  const stickerId = id || (className ? `stk_${stringHash(className)}` : 'stk_default');

  // Check if user chose to hide / delete this sticker
  const isHidden = stickers?.data?.[`sticker_hidden_${stickerId}`] === 'true';

  // Check if user replaced this sticker with another image
  const replacementSrc = stickers?.data?.[`sticker_src_${stickerId}`];

  // Read saved offset position, rotation, and scale from page data
  const savedPosRaw = stickers?.data?.[`sticker_pos_${stickerId}`];
  const savedRotRaw = stickers?.data?.[`sticker_rot_${stickerId}`];
  const savedScaleRaw = stickers?.data?.[`sticker_scale_${stickerId}`];

  let initialPos = { x: 0, y: 0 };
  if (savedPosRaw) {
    try {
      initialPos = JSON.parse(savedPosRaw);
    } catch {
      initialPos = { x: 0, y: 0 };
    }
  }

  const initialRot = savedRotRaw ? parseFloat(savedRotRaw) : 0;
  const initialScale = savedScaleRaw ? parseFloat(savedScaleRaw) : 1;

  const [pos, setPos] = useState(initialPos);
  const [rotation, setRotation] = useState(initialRot);
  const [scale, setScale] = useState(initialScale);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const itemRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(pos);
  posRef.current = pos;
  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  useEffect(() => {
    if (savedPosRaw) {
      try {
        setPos(JSON.parse(savedPosRaw));
      } catch {
        setPos({ x: 0, y: 0 });
      }
    } else {
      setPos({ x: 0, y: 0 });
    }
  }, [savedPosRaw]);

  useEffect(() => {
    setRotation(savedRotRaw ? parseFloat(savedRotRaw) : 0);
  }, [savedRotRaw]);

  useEffect(() => {
    setScale(savedScaleRaw ? parseFloat(savedScaleRaw) : 1);
  }, [savedScaleRaw]);

  if (isHidden) return null;

  const isViewerMode = stickers?.isViewerMode ?? false;
  const isSelected = stickers?.selectedStickerId === stickerId;

  // ── Drag position of sticker ──
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isViewerMode) return;

    // Don't drag if user clicked an action button or handle
    if ((e.target as HTMLElement).closest('button, [data-action], [data-handle]')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    stickers?.setSelectedStickerId(stickerId);

    const sScale = getScrapbookScale();
    const startPointer = { x: e.clientX, y: e.clientY };
    const startPos = { ...posRef.current };
    let hasMoved = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startPointer.x) / sScale;
      const dy = (moveEvent.clientY - startPointer.y) / sScale;

      if (!hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        hasMoved = true;
        setIsDragging(true);
      }

      if (hasMoved) {
        setPos({
          x: Math.round(startPos.x + dx),
          y: Math.round(startPos.y + dy),
        });
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsDragging(false);

      if (hasMoved) {
        const finalX = Math.round(startPos.x + (upEvent.clientX - startPointer.x) / sScale);
        const finalY = Math.round(startPos.y + (upEvent.clientY - startPointer.y) / sScale);
        const next = { x: finalX, y: finalY };
        setPos(next);
        stickers?.updateStickerTransform(stickerId, next);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // ── Corner Rotation Gesture ──
  const handleRotatePointerDown = (e: React.PointerEvent) => {
    if (isViewerMode) return;
    e.preventDefault();
    e.stopPropagation();
    stickers?.setSelectedStickerId(stickerId);
    setIsRotating(true);

    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startPointerAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const startRotation = rotationRef.current;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentPointerAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
      let deltaAngle = currentPointerAngle - startPointerAngle;
      let newRot = Math.round(startRotation + deltaAngle);

      // Snap to 0°, 90°, 180°, 270° when close
      const normalized = ((newRot % 360) + 360) % 360;
      if (Math.abs(normalized) < 4 || Math.abs(normalized - 360) < 4) newRot = 0;
      else if (Math.abs(normalized - 90) < 4) newRot = 90;
      else if (Math.abs(normalized - 180) < 4) newRot = 180;
      else if (Math.abs(normalized - 270) < 4) newRot = 270;

      setRotation(newRot);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsRotating(false);

      const currentPointerAngle = Math.atan2(upEvent.clientY - centerY, upEvent.clientX - centerX) * (180 / Math.PI);
      let deltaAngle = currentPointerAngle - startPointerAngle;
      let finalRot = Math.round(startRotation + deltaAngle);
      const normalized = ((finalRot % 360) + 360) % 360;
      if (Math.abs(normalized) < 4 || Math.abs(normalized - 360) < 4) finalRot = 0;
      else if (Math.abs(normalized - 90) < 4) finalRot = 90;
      else if (Math.abs(normalized - 180) < 4) finalRot = 180;
      else if (Math.abs(normalized - 270) < 4) finalRot = 270;

      setRotation(finalRot);
      stickers?.updateStickerTransform(stickerId, { rotation: finalRot });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // ── Corner Resize Gesture ──
  const handleResizePointerDown = (e: React.PointerEvent) => {
    if (isViewerMode) return;
    e.preventDefault();
    e.stopPropagation();
    stickers?.setSelectedStickerId(stickerId);
    setIsResizing(true);

    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startDist = Math.max(15, Math.hypot(e.clientX - centerX, e.clientY - centerY));
    const startScale = scaleRef.current;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentDist = Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY);
      const scaleRatio = currentDist / startDist;
      let newScale = Math.round(startScale * scaleRatio * 100) / 100;

      // Clamp scale between 0.35 and 3.5
      newScale = Math.max(0.35, Math.min(3.5, newScale));
      setScale(newScale);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsResizing(false);

      const currentDist = Math.hypot(upEvent.clientX - centerX, upEvent.clientY - centerY);
      const scaleRatio = currentDist / startDist;
      let finalScale = Math.round(startScale * scaleRatio * 100) / 100;
      finalScale = Math.max(0.35, Math.min(3.5, finalScale));

      setScale(finalScale);
      stickers?.updateStickerTransform(stickerId, { scale: finalScale });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // ── Quick Toolbar Actions ──
  const handleStepRotate = (delta: number) => {
    const nextRot = (rotation + delta) % 360;
    setRotation(nextRot);
    stickers?.updateStickerTransform(stickerId, { rotation: nextRot });
  };

  const handleStepResize = (multiplier: number) => {
    let nextScale = Math.round(scale * multiplier * 100) / 100;
    nextScale = Math.max(0.35, Math.min(3.5, nextScale));
    setScale(nextScale);
    stickers?.updateStickerTransform(stickerId, { scale: nextScale });
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = { x: 0, y: 0, rotation: 0, scale: 1 };
    setPos({ x: 0, y: 0 });
    setRotation(0);
    setScale(1);
    stickers?.updateStickerTransform(stickerId, next);
  };

  const handleReplace = (e: React.MouseEvent) => {
    e.stopPropagation();
    stickers?.openPickerForSticker(stickerId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    stickers?.removeSticker(stickerId);
  };

  const showToolbar = !isViewerMode && (isSelected || isHovered) && !isDragging && !isResizing && !isRotating;
  const hasTransformed = pos.x !== 0 || pos.y !== 0 || rotation !== 0 || scale !== 1;

  return (
    <div
      ref={itemRef}
      className={`select-none ${className || ''} ${
        !isViewerMode ? 'pointer-events-auto' : ''
      }`}
      style={{
        ...style,
        position: 'absolute',
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0px) rotate(${rotation}deg) scale(${scale * (isDragging ? 1.05 : 1)})`,
        transformOrigin: 'center center',
        zIndex: isDragging || isRotating || isResizing ? 100 : isSelected ? 40 : (style?.zIndex as number) || 20,
        cursor: isViewerMode ? 'default' : isDragging ? 'grabbing' : 'grab',
        transition: isDragging || isRotating || isResizing ? 'none' : 'transform 0.12s ease-out',
      }}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (!isViewerMode) stickers?.setSelectedStickerId(stickerId);
      }}
    >
      <div className="relative size-full flex items-center justify-center">
        {/* Selection / Hover ring */}
        {!isViewerMode && (
          <div
            className={`absolute -inset-2 rounded-xl pointer-events-none transition-all duration-150 z-20 ${
              isSelected
                ? 'border-2 border-dashed border-pink-500 bg-pink-500/5 shadow-sm'
                : isHovered
                ? 'border-2 border-pink-400/60 bg-pink-50/15'
                : 'border-2 border-transparent'
            }`}
          />
        )}

        {/* ── Interactive Corner Handles (When Selected) ── */}
        {!isViewerMode && isSelected && (
          <>
            {/* Top-Right Corner: ROTATE HANDLE */}
            <div
              data-handle="rotate"
              onPointerDown={handleRotatePointerDown}
              className="absolute -top-4 -right-4 size-7 rounded-full bg-white border-2 border-pink-500 shadow-md flex items-center justify-center text-pink-600 hover:bg-pink-50 active:scale-95 transition-transform z-40 cursor-grab active:cursor-grabbing pointer-events-auto"
              title="Drag this corner to rotate sticker 🔄"
            >
              <RotateCw className="size-3.5" />
            </div>

            {/* Bottom-Right Corner: RESIZE HANDLE */}
            <div
              data-handle="resize"
              onPointerDown={handleResizePointerDown}
              className="absolute -bottom-3 -right-3 size-6 rounded-full bg-white border-2 border-pink-500 shadow-md hover:scale-125 transition-transform z-40 cursor-nwse-resize pointer-events-auto flex items-center justify-center"
              title="Drag corner to resize sticker"
            >
              <span className="size-1.5 rounded-full bg-pink-500" />
            </div>

            {/* Bottom-Left Corner: RESIZE HANDLE */}
            <div
              data-handle="resize"
              onPointerDown={handleResizePointerDown}
              className="absolute -bottom-3 -left-3 size-6 rounded-full bg-white border-2 border-pink-500 shadow-md hover:scale-125 transition-transform z-40 cursor-nesw-resize pointer-events-auto flex items-center justify-center"
              title="Drag corner to resize sticker"
            >
              <span className="size-1.5 rounded-full bg-pink-500" />
            </div>

            {/* Top-Left Corner: RESIZE HANDLE */}
            <div
              data-handle="resize"
              onPointerDown={handleResizePointerDown}
              className="absolute -top-3 -left-3 size-6 rounded-full bg-white border-2 border-pink-500 shadow-md hover:scale-125 transition-transform z-40 cursor-nwse-resize pointer-events-auto flex items-center justify-center"
              title="Drag corner to resize sticker"
            >
              <span className="size-1.5 rounded-full bg-pink-500" />
            </div>
          </>
        )}

        {/* Live Rotation Angle Badge during rotate */}
        {isRotating && (
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-black/85 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full pointer-events-none whitespace-nowrap shadow-lg border border-white/20 z-50">
            {rotation}°
          </div>
        )}

        {/* Live Scale Badge during resize */}
        {isResizing && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/85 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full pointer-events-none whitespace-nowrap shadow-lg border border-white/20 z-50">
            {Math.round(scale * 100)}%
          </div>
        )}

        {/* If replaced, show the replacement image; otherwise show original children */}
        {replacementSrc ? (
          <div className="size-full flex items-center justify-center overflow-hidden">
            <img
              src={replacementSrc}
              alt="Replacement sticker"
              className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-md select-none"
              draggable={false}
            />
          </div>
        ) : (
          children
        )}

        {/* Floating action toolbar with seamless hover bridge */}
        {showToolbar && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2.5 z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-100"
            style={{ minWidth: 160 }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-2xl border border-pink-200">
              {/* Rotate quick buttons */}
              <button
                type="button"
                data-action="rotate-left"
                onClick={() => handleStepRotate(-15)}
                className="p-1 hover:bg-pink-100 text-pink-600 rounded-full transition-colors cursor-pointer"
                title="Rotate -15°"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                data-action="rotate-right"
                onClick={() => handleStepRotate(15)}
                className="p-1 hover:bg-pink-100 text-pink-600 rounded-full transition-colors cursor-pointer"
                title="Rotate +15°"
              >
                <RotateCw className="size-3.5" />
              </button>

              <div className="w-px h-3.5 bg-gray-200 mx-0.5" />

              {/* Resize quick buttons */}
              <button
                type="button"
                data-action="scale-down"
                onClick={() => handleStepResize(0.85)}
                className="p-1 hover:bg-pink-100 text-pink-600 rounded-full transition-colors cursor-pointer"
                title="Make Smaller (-15%)"
              >
                <Minus className="size-3.5" />
              </button>
              <button
                type="button"
                data-action="scale-up"
                onClick={() => handleStepResize(1.15)}
                className="p-1 hover:bg-pink-100 text-pink-600 rounded-full transition-colors cursor-pointer"
                title="Make Larger (+15%)"
              >
                <Plus className="size-3.5" />
              </button>

              <div className="w-px h-3.5 bg-gray-200 mx-0.5" />

              {/* Replace */}
              <button
                type="button"
                data-action="replace"
                onClick={handleReplace}
                className="p-1 hover:bg-pink-100 text-pink-600 rounded-full transition-colors cursor-pointer"
                title="Replace Sticker"
              >
                <RefreshCw className="size-3.5" />
              </button>

              {/* Reset transform (if transformed) */}
              {hasTransformed && (
                <button
                  type="button"
                  data-action="reset"
                  onClick={handleReset}
                  className="p-1 hover:bg-gray-100 text-gray-500 rounded-full transition-colors cursor-pointer"
                  title="Reset Position, Size & Rotation"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              )}

              {/* Delete */}
              <button
                type="button"
                data-action="delete"
                onClick={handleDelete}
                className="p-1 hover:bg-red-100 text-red-500 rounded-full transition-colors cursor-pointer active:scale-90"
                title="Delete Sticker"
              >
                <Trash2 className="size-3.5" />
              </button>

              <div className="text-gray-300 pl-0.5 pointer-events-none">
                <GripHorizontal className="size-3.5" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
