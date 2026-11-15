import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Trash2, GripHorizontal, RotateCw, RotateCcw, Minus, Plus } from 'lucide-react';
import { useStickers, CustomStickerData } from './StickerContext';
import { getScrapbookScale } from './scrapbookUtils';

export function CustomStickerLayer() {
  const stickers = useStickers();
  if (!stickers) return null;

  let customList: CustomStickerData[] = [];
  try {
    if (stickers.data.custom_stickers) {
      customList = JSON.parse(stickers.data.custom_stickers);
    }
  } catch {
    customList = [];
  }

  if (!customList.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      {customList.map((sticker) => (
        <CustomStickerItem
          key={sticker.id}
          sticker={sticker}
          isViewerMode={stickers.isViewerMode}
          isSelected={stickers.selectedStickerId === sticker.id}
          onSelect={() => stickers.setSelectedStickerId(sticker.id)}
          onReplace={() => stickers.openPickerForSticker(sticker.id)}
          onDelete={() => stickers.removeSticker(sticker.id)}
          onUpdateTransform={(transform) => stickers.updateStickerTransform(sticker.id, transform)}
        />
      ))}
    </div>
  );
}

function CustomStickerItem({
  sticker,
  isViewerMode,
  isSelected,
  onSelect,
  onReplace,
  onDelete,
  onUpdateTransform,
}: {
  sticker: CustomStickerData;
  isViewerMode?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onReplace: () => void;
  onDelete: () => void;
  onUpdateTransform: (transform: {
    x?: number;
    y?: number;
    rotation?: number;
    width?: number;
    height?: number;
  }) => void;
}) {
  const [pos, setPos] = useState({ x: sticker.x || 0, y: sticker.y || 0 });
  const [size, setSize] = useState({
    width: sticker.width || 135,
    height: sticker.height || 135,
  });
  const [rotation, setRotation] = useState(sticker.rotation || 0);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const itemRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(pos);
  posRef.current = pos;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;

  useEffect(() => {
    setPos({ x: sticker.x || 0, y: sticker.y || 0 });
  }, [sticker.x, sticker.y]);

  useEffect(() => {
    setSize({
      width: sticker.width || 135,
      height: sticker.height || 135,
    });
  }, [sticker.width, sticker.height]);

  useEffect(() => {
    setRotation(sticker.rotation || 0);
  }, [sticker.rotation]);

  // ── Drag position of sticker ──
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isViewerMode) return;

    // If user clicked an action button or corner handle, do not drag
    if ((e.target as HTMLElement).closest('button, [data-action], [data-handle]')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    onSelect();

    const scale = getScrapbookScale();
    const startPointer = { x: e.clientX, y: e.clientY };
    const startPos = { ...posRef.current };
    let hasMoved = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startPointer.x) / scale;
      const dy = (moveEvent.clientY - startPointer.y) / scale;

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
        const finalX = Math.round(startPos.x + (upEvent.clientX - startPointer.x) / scale);
        const finalY = Math.round(startPos.y + (upEvent.clientY - startPointer.y) / scale);
        const next = { x: finalX, y: finalY };
        setPos(next);
        onUpdateTransform(next);
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
    onSelect();
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

      // Snap to 0°, 90°, 180°, 270° when close (within 4°)
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
      onUpdateTransform({ rotation: finalRot });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // ── Corner Resize Gesture (Preserves Aspect Ratio) ──
  const handleResizePointerDown = (e: React.PointerEvent) => {
    if (isViewerMode) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsResizing(true);

    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startDist = Math.max(15, Math.hypot(e.clientX - centerX, e.clientY - centerY));
    const startWidth = sizeRef.current.width;
    const startHeight = sizeRef.current.height;
    const aspectRatio = startWidth / Math.max(1, startHeight);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentDist = Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY);
      const scaleRatio = currentDist / startDist;

      let newWidth = Math.round(startWidth * scaleRatio);
      let newHeight = Math.round(startHeight * scaleRatio);

      // Clamp between 40px and 600px
      if (newWidth < 40) {
        newWidth = 40;
        newHeight = Math.round(40 / aspectRatio);
      } else if (newWidth > 600) {
        newWidth = 600;
        newHeight = Math.round(600 / aspectRatio);
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsResizing(false);

      const currentDist = Math.hypot(upEvent.clientX - centerX, upEvent.clientY - centerY);
      const scaleRatio = currentDist / startDist;

      let finalWidth = Math.round(startWidth * scaleRatio);
      let finalHeight = Math.round(startHeight * scaleRatio);

      if (finalWidth < 40) {
        finalWidth = 40;
        finalHeight = Math.round(40 / aspectRatio);
      } else if (finalWidth > 600) {
        finalWidth = 600;
        finalHeight = Math.round(600 / aspectRatio);
      }

      setSize({ width: finalWidth, height: finalHeight });
      onUpdateTransform({ width: finalWidth, height: finalHeight });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // ── Quick Toolbar Actions ──
  const handleStepRotate = (delta: number) => {
    const nextRot = (rotation + delta) % 360;
    setRotation(nextRot);
    onUpdateTransform({ rotation: nextRot });
  };

  const handleStepResize = (multiplier: number) => {
    const aspectRatio = size.width / Math.max(1, size.height);
    let nextWidth = Math.round(size.width * multiplier);
    let nextHeight = Math.round(size.height * multiplier);
    if (nextWidth < 40) {
      nextWidth = 40;
      nextHeight = Math.round(40 / aspectRatio);
    } else if (nextWidth > 600) {
      nextWidth = 600;
      nextHeight = Math.round(600 / aspectRatio);
    }
    setSize({ width: nextWidth, height: nextHeight });
    onUpdateTransform({ width: nextWidth, height: nextHeight });
  };

  const handleResetTransform = () => {
    setRotation(0);
    setSize({ width: 135, height: 135 });
    onUpdateTransform({ rotation: 0, width: 135, height: 135 });
  };

  const showToolbar = !isViewerMode && (isSelected || isHovered) && !isDragging && !isResizing && !isRotating;
  const isTransformed = rotation !== 0 || size.width !== 135 || size.height !== 135;

  return (
    <div
      ref={itemRef}
      className="absolute top-1/2 left-1/2 pointer-events-auto select-none"
      style={{
        width: size.width,
        height: size.height,
        marginLeft: -size.width / 2,
        marginTop: -size.height / 2,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0px) rotate(${rotation}deg) scale(${isDragging ? 1.05 : 1})`,
        transformOrigin: 'center center',
        zIndex: isDragging || isRotating || isResizing ? 100 : isSelected ? 40 : 30,
        cursor: isViewerMode ? 'default' : isDragging ? 'grabbing' : 'grab',
        transition: isDragging || isRotating || isResizing ? 'none' : 'transform 0.12s ease-out',
      }}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (!isViewerMode) onSelect();
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
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

        {/* Live Size Badge during resize */}
        {isResizing && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/85 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full pointer-events-none whitespace-nowrap shadow-lg border border-white/20 z-50">
            {size.width} × {size.height} px
          </div>
        )}

        {/* Sticker image */}
        <img
          src={sticker.src}
          alt="Custom sticker"
          className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-md select-none"
          draggable={false}
        />

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
                onClick={(e) => {
                  e.stopPropagation();
                  onReplace();
                }}
                className="p-1 hover:bg-pink-100 text-pink-600 rounded-full transition-colors cursor-pointer"
                title="Replace Sticker"
              >
                <RefreshCw className="size-3.5" />
              </button>

              {/* Reset transform (if rotated or resized) */}
              {isTransformed && (
                <button
                  type="button"
                  data-action="reset-transform"
                  onClick={handleResetTransform}
                  className="px-1.5 py-0.5 hover:bg-gray-100 text-gray-500 rounded-full text-[10px] font-mono font-bold transition-colors cursor-pointer"
                  title="Reset rotation and size"
                >
                  0°
                </button>
              )}

              {/* Delete */}
              <button
                type="button"
                data-action="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
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
