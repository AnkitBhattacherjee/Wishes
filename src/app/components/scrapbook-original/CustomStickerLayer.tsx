import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Trash2, GripHorizontal } from 'lucide-react';
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
          onUpdatePos={(pos) => stickers.updateStickerPos(sticker.id, pos)}
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
  onUpdatePos,
}: {
  sticker: CustomStickerData;
  isViewerMode?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onReplace: () => void;
  onDelete: () => void;
  onUpdatePos: (pos: { x: number; y: number }) => void;
}) {
  const [pos, setPos] = useState({ x: sticker.x || 0, y: sticker.y || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    setPos({ x: sticker.x || 0, y: sticker.y || 0 });
  }, [sticker.x, sticker.y]);

  const width = sticker.width || 135;
  const height = sticker.height || 135;
  const rotation = sticker.rotation || 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isViewerMode) return;

    // If user clicked an action button, do not initiate drag
    if ((e.target as HTMLElement).closest('button, [data-action]')) {
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
        onUpdatePos(next);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const showToolbar = !isViewerMode && (isSelected || isHovered) && !isDragging;

  return (
    <div
      className="absolute top-1/2 left-1/2 pointer-events-auto select-none"
      style={{
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0px) rotate(${rotation}deg) scale(${isDragging ? 1.07 : 1})`,
        zIndex: isDragging ? 100 : isSelected ? 40 : 30,
        cursor: isViewerMode ? 'default' : isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'transform 0.12s ease-out',
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
            className={`absolute -inset-1.5 rounded-xl pointer-events-none transition-all duration-150 ${
              isSelected
                ? 'border-2 border-dashed border-pink-500 bg-pink-500/10 shadow-sm'
                : isHovered
                ? 'border-2 border-pink-400/70 bg-pink-50/20'
                : 'border-2 border-transparent'
            }`}
          />
        )}

        {/* Sticker image */}
        <img
          src={sticker.src}
          alt="Custom sticker"
          className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-md"
          draggable={false}
        />

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
                onClick={(e) => {
                  e.stopPropagation();
                  onReplace();
                }}
                className="p-1 hover:bg-pink-100 text-pink-600 rounded-full transition-colors cursor-pointer"
                title="Replace Sticker"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                data-action="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
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
