import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Sparkles, Check } from 'lucide-react';
import { STICKER_LIBRARY, STICKER_CATEGORIES, StickerItem } from './stickerLibrary';
import { useStickers } from './StickerContext';

export function StickerModal() {
  const stickers = useStickers();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!stickers || !stickers.isPickerOpen) return null;

  const filteredStickers = selectedCategory === 'all'
    ? STICKER_LIBRARY
    : STICKER_LIBRARY.filter((s) => s.category === selectedCategory);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          stickers.applySticker(result, {
            id: 'custom_upload_' + Date.now(),
            name: file.name.replace(/\.[^/.]+$/, ''),
            category: 'decorative',
            src: result,
            defaultWidth: 140,
            defaultHeight: 140,
          });
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ zIndex: 999999 }}
      onClick={stickers.closePicker}
    >
      <div
        className="bg-white rounded-[24px] w-[640px] max-w-[95vw] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden select-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 bg-[#fff5f8]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-full">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 font-['Inter',sans-serif]">
                {stickers.targetStickerId ? 'Replace Sticker' : 'Add a Sticker'}
              </h2>
              <p className="text-xs text-gray-500">
                {stickers.targetStickerId
                  ? 'Pick a new sticker or upload your own to swap'
                  : 'Choose a sticker to place on your scrapbook page'}
              </p>
            </div>
          </div>
          <button
            onClick={stickers.closePicker}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar & Upload Button */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {STICKER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full text-xs font-bold border border-pink-200 transition-colors cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Sticker</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCustomUpload}
          />
        </div>

        {/* Stickers Grid */}
        <div className="p-6 overflow-y-auto max-h-[50vh] grid grid-cols-3 sm:grid-cols-4 gap-4 bg-[#fdfcfa]">
          {filteredStickers.map((item) => (
            <div
              key={item.id}
              onClick={() => stickers.applySticker(item.src, item)}
              className="group relative bg-white border border-gray-200 hover:border-pink-400 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-150 hover:shadow-lg hover:-translate-y-1 select-none"
            >
              <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                <img
                  src={item.src}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain pointer-events-none group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              <span className="text-[11px] font-medium text-gray-600 text-center truncate w-full group-hover:text-pink-600">
                {item.name}
              </span>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-pink-500 text-white p-1 rounded-full shadow">
                <Check className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Click any sticker to apply. You can drag it anywhere on the page!</span>
          <button
            onClick={stickers.closePicker}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

