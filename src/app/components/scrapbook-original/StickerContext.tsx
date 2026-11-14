import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StickerItem } from './stickerLibrary';

export interface CustomStickerData {
  id: string;
  src: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
}

interface StickerContextType {
  data: Record<string, string>;
  onUpdate: (key: string, val: string) => void;
  isViewerMode?: boolean;
  isPickerOpen: boolean;
  targetStickerId: string | null;
  selectedStickerId: string | null;
  setSelectedStickerId: (id: string | null) => void;
  openPickerForSticker: (id: string) => void;
  openPickerForNewSticker: () => void;
  closePicker: () => void;
  applySticker: (src: string, item?: StickerItem) => void;
  removeSticker: (id: string) => void;
  updateStickerPos: (id: string, pos: { x: number; y: number }) => void;
}

const StickerContext = createContext<StickerContextType | null>(null);

export function useStickers() {
  const context = useContext(StickerContext);
  return context;
}

interface StickerProviderProps {
  children: ReactNode;
  data: Record<string, string>;
  onUpdate: (key: string, val: string) => void;
  isViewerMode?: boolean;
}

export function StickerProvider({ children, data, onUpdate, isViewerMode }: StickerProviderProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [targetStickerId, setTargetStickerId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const openPickerForSticker = (id: string) => {
    if (isViewerMode) return;
    setTargetStickerId(id);
    setSelectedStickerId(id);
    setIsPickerOpen(true);
  };

  const openPickerForNewSticker = () => {
    if (isViewerMode) return;
    setTargetStickerId(null);
    setIsPickerOpen(true);
  };

  const closePicker = () => {
    setIsPickerOpen(false);
    setTargetStickerId(null);
  };

  const applySticker = (src: string, item?: StickerItem) => {
    if (targetStickerId) {
      if (targetStickerId.startsWith('custom_')) {
        // Replacing an existing custom sticker
        try {
          let existingCustom: CustomStickerData[] = data.custom_stickers
            ? JSON.parse(data.custom_stickers)
            : [];
          existingCustom = existingCustom.map((s) =>
            s.id === targetStickerId ? { ...s, src } : s
          );
          onUpdate('custom_stickers', JSON.stringify(existingCustom));
        } catch (e) {
          console.error('Failed to replace custom sticker', e);
        }
      } else {
        // Replacing a layout sticker
        onUpdate(`sticker_src_${targetStickerId}`, src);
        onUpdate(`sticker_hidden_${targetStickerId}`, 'false');
      }
      setSelectedStickerId(targetStickerId);
    } else {
      // Adding a new custom sticker onto the active spread
      let existingCustom: CustomStickerData[] = [];
      try {
        if (data.custom_stickers) {
          existingCustom = JSON.parse(data.custom_stickers);
        }
      } catch {
        existingCustom = [];
      }

      // Compute a clean non-overlapping spawn location on left or right page
      const count = existingCustom.length;
      const isRight = count % 2 === 0;
      const baseX = isRight ? 240 : -240;
      const slot = Math.floor(count / 2) % 4;
      const baseY = -120 + slot * 85;
      const jitterX = Math.round((Math.random() - 0.5) * 30);
      const jitterY = Math.round((Math.random() - 0.5) * 30);

      const newId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newSticker: CustomStickerData = {
        id: newId,
        src,
        x: baseX + jitterX,
        y: baseY + jitterY,
        width: item?.defaultWidth || 135,
        height: item?.defaultHeight || 135,
        rotation: Math.round((Math.random() - 0.5) * 14),
      };

      const updated = [...existingCustom, newSticker];
      onUpdate('custom_stickers', JSON.stringify(updated));
      setSelectedStickerId(newId);
    }
    closePicker();
  };

  const removeSticker = (id: string) => {
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
    if (id.startsWith('custom_')) {
      try {
        let existing: CustomStickerData[] = data.custom_stickers
          ? JSON.parse(data.custom_stickers)
          : [];
        existing = existing.filter((s) => s.id !== id);
        onUpdate('custom_stickers', JSON.stringify(existing));
      } catch (e) {
        console.error('Failed to remove custom sticker', e);
      }
    } else {
      // Hide predefined layout sticker
      onUpdate(`sticker_hidden_${id}`, 'true');
    }
  };

  const updateStickerPos = (id: string, pos: { x: number; y: number }) => {
    if (id.startsWith('custom_')) {
      try {
        let existing: CustomStickerData[] = data.custom_stickers
          ? JSON.parse(data.custom_stickers)
          : [];
        existing = existing.map((s) => (s.id === id ? { ...s, x: pos.x, y: pos.y } : s));
        onUpdate('custom_stickers', JSON.stringify(existing));
      } catch (e) {
        console.error('Failed to update custom sticker pos', e);
      }
    } else {
      onUpdate(`sticker_pos_${id}`, JSON.stringify(pos));
    }
  };

  // Keyboard shortcut: Delete or Backspace removes currently selected sticker
  useEffect(() => {
    if (isViewerMode || !selectedStickerId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeSticker(selectedStickerId);
      } else if (e.key === 'Escape') {
        setSelectedStickerId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStickerId, isViewerMode, data]);

  return (
    <StickerContext.Provider
      value={{
        data,
        onUpdate,
        isViewerMode,
        isPickerOpen,
        targetStickerId,
        selectedStickerId,
        setSelectedStickerId,
        openPickerForSticker,
        openPickerForNewSticker,
        closePicker,
        applySticker,
        removeSticker,
        updateStickerPos,
      }}
    >
      {children}
    </StickerContext.Provider>
  );
}
