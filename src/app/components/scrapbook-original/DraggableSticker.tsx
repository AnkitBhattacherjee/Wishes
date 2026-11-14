import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Trash2, RotateCcw, GripHorizontal } from 'lucide-react';
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

  // Read saved offset position from page data
  const savedPosRaw = stickers?.data?.[`sticker_pos_${stickerId}`];
  let initialPos = { x: 0, y: 0 };
  if (savedPosRaw) {
    try {
      initialPos = JSON.parse(savedPosRaw);
    } catch {
      initialPos = { x: 0, y: 0 };
    }
  }

  const [pos, setPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const posRef = useRef(pos);
  posRef.current = pos;

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

  if (isHidden) return null;

  const isViewerMode = stickers?.isViewerMode ?? false;
  const isSelected = stickers?.selectedStickerId === stickerId;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isViewerMode) return;

    // Don't drag if user clicked an action button
    if ((e.target as HTMLElement).closest('button, [data-action]')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    stickers?.setSelectedStickerId(stickerId);

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
        stickers?.updateStickerPos(stickerId, next);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = { x: 0, y: 0 };
    setPos(next);
    stickers?.updateStickerPos(stickerId, next);
  };

  const handleReplace = (e: React.MouseEvent) => {
    e.stopPropagation();
    stickers?.openPickerForSticker(stickerId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    stickers?.removeSticker(stickerId);
  };

  const showToolbar = !isViewerMode && (isSelected || isHovered) && !isDragging;
  const hasMoved = pos.x !== 0 || pos.y !== 0;

  return (
    <div
      className={`select-none ${className || ''} ${
        !isViewerMode ? 'pointer-events-auto' : ''
      }`}
      style={{
        ...style,
        position: 'absolute',
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0px) scale(${isDragging ? 1.05 : 1})`,
        zIndex: isDragging ? 100 : isSelected ? 40 : (style?.zIndex as number) || 20,
        cursor: isViewerMode ? 'default' : isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'transform 0.12s ease-out',
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
            className={`absolute -inset-1.5 rounded-xl pointer-events-none transition-all duration-150 z-10 ${
              isSelected
                ? 'border-2 border-dashed border-pink-500 bg-pink-500/10 shadow-sm'
                : isHovered
                ? 'border-2 border-pink-400/70 bg-pink-50/20'
                : 'border-2 border-transparent'
            }`}
          />
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
            className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-100"
            style={{ minWidth: 90 }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full shadow-xl border border-pink-200">
              <button
                type="button"
                data-action="replace"
                onClick={handleReplace}
                className="p-1 hover:bg-pink-100 text-pink-600 rounded-full transition-colors cursor-pointer"
                title="Replace Sticker"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              {hasMoved && (
                <button
                  type="button"
                  data-action="reset"
                  onClick={handleReset}
                  className="p-1 hover:bg-gray-100 text-gray-500 rounded-full transition-colors cursor-pointer"
                  title="Reset Position"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                data-action="delete"
                onClick={handleDelete}
                className="p-1.5 hover:bg-red-100 text-red-500 rounded-full transition-colors cursor-pointer active:scale-90"
                title="Delete Sticker"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="text-gray-300 px-0.5 pointer-events-none">
                <GripHorizontal className="w-3 h-3" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
