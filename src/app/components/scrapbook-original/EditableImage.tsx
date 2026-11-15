import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ImagePlus, Crop, X, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { uploadImageToCloud } from '../../utils/imageCloudUpload';
import { uploadGiftPhoto } from '../../giftStore';

export interface EditableImageProps {
  className?: string;
  defaultColor?: string;
  imageUrl?: string;
  onImageUpload?: (url: string) => void;
  isViewerMode?: boolean;
}

// Fast pre-downscaler to avoid decoding massive images on the main thread
async function prepareImageForCropper(file: File): Promise<string> {
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file);
      const MAX_DIM = 2048;
      if (bitmap.width > MAX_DIM || bitmap.height > MAX_DIM) {
        const scale = MAX_DIM / Math.max(bitmap.width, bitmap.height);
        const w = Math.round(bitmap.width * scale);
        const h = Math.round(bitmap.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0, w, h);
          bitmap.close();
          return canvas.toDataURL('image/jpeg', 0.92);
        }
      }
      bitmap.close();
    } catch (e) {
      console.warn('Fast downscale skipped:', e);
    }
  }
  return URL.createObjectURL(file);
}

// Robust image loader that avoids hanging if already cached/complete
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      resolve(img);
    }
  });
}

export function EditableImage({ className, defaultColor, imageUrl, onImageUpload, isViewerMode }: EditableImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cropping states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [aspect, setAspect] = useState(4 / 3);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSavingCrop, setIsSavingCrop] = useState(false);

  // Clean up object URLs on unmount or src change
  useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  // Measure the container to set the exact aspect ratio
  useEffect(() => {
    if (isCropping && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth && clientHeight) {
        setAspect(clientWidth / clientHeight);
      }
    }
  }, [isCropping]);

  const handleFile = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsLoadingFile(true);
      try {
        if (imageSrc && imageSrc.startsWith('blob:')) {
          URL.revokeObjectURL(imageSrc);
        }
        const preparedUrl = await prepareImageForCropper(file);
        setImageSrc(preparedUrl);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setIsCropping(true);
      } catch (err) {
        console.error('Failed to prepare image for cropper:', err);
      } finally {
        setIsLoadingFile(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Always clear so user can reselect the same file
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isViewerMode) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isViewerMode) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageSrc || !croppedAreaPixels || isSavingCrop) return;

    setIsSavingCrop(true);

    try {
      const image = await loadImage(imageSrc);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2d canvas context');

      const MAX_SIZE = 1600;
      let scale = 1;
      if (croppedAreaPixels.width > MAX_SIZE || croppedAreaPixels.height > MAX_SIZE) {
        scale = MAX_SIZE / Math.max(croppedAreaPixels.width, croppedAreaPixels.height);
      }

      const outWidth = Math.max(1, Math.round(croppedAreaPixels.width * scale));
      const outHeight = Math.max(1, Math.round(croppedAreaPixels.height * scale));

      canvas.width = outWidth;
      canvas.height = outHeight;

      // Background for unfilled areas stays the page color or white
      ctx.fillStyle = defaultColor || '#FFFFFF';
      ctx.fillRect(0, 0, outWidth, outHeight);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        Math.round(-croppedAreaPixels.x * scale),
        Math.round(-croppedAreaPixels.y * scale),
        Math.round(image.naturalWidth * scale),
        Math.round(image.naturalHeight * scale)
      );

      const croppedImageSrc = canvas.toDataURL('image/jpeg', 0.92);

      // 1. Immediately apply the cropped image to the scrapbook for instant UI feedback!
      if (onImageUpload) {
        onImageUpload(croppedImageSrc);
      }

      // 2. Close modal immediately and clean up
      if (imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
      setIsCropping(false);
      setImageSrc(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setIsSavingCrop(false);

      // 3. Upload resized image to Supabase in the background
      (async () => {
        try {
          const res = await fetch(croppedImageSrc);
          const blob = await res.blob();
          const uploadedUrl = await uploadImageToCloud(blob);
          if (uploadedUrl && onImageUpload) {
            onImageUpload(uploadedUrl);
          }
        } catch (uploadErr) {
          // If network / cloud is offline, croppedDataUrl is safely retained in state & localStorage
          console.warn('Background photo cloud upload deferred/failed:', uploadErr);
        }
      })();
    } catch (err) {
      console.error('Error cropping image:', err);
      setIsSavingCrop(false);
    }
  };

  const cancelCrop = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (imageSrc && imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(imageSrc);
    }
    setIsCropping(false);
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setIsSavingCrop(false);
  };

  return (
    <div className={`relative group inline-block ${className}`} style={{ backgroundColor: defaultColor }}>
      {/* Normal Image Viewer (Scrapbook Page) */}
      <div
        ref={containerRef}
        className={`w-full h-full relative cursor-pointer overflow-hidden rounded-inherit transition-all duration-200 ${isDragging ? 'ring-4 ring-[#FF0070] ring-inset opacity-80 bg-white/50' : ''}`}
        style={{ borderRadius: 'inherit' }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isViewerMode && !isLoadingFile) {
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="User upload" className="absolute inset-0 w-full h-full object-cover" style={{ borderRadius: 'inherit' }} />
        ) : null}

        {isLoadingFile ? (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10" style={{ borderRadius: 'inherit' }}>
            <Loader2 className="animate-spin text-white w-7 h-7" />
          </div>
        ) : !isViewerMode ? (
          <div className={`absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${!imageUrl ? 'opacity-50' : ''}`} style={{ borderRadius: 'inherit' }}>
            {imageUrl ? <Crop className="text-white w-8 h-8" /> : <ImagePlus className="text-white w-8 h-8" />}
          </div>
        ) : null}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {/* 0.7x Scaled Pop-Up Modal (682px x 535px) - using React Portal to escape CSS transforms */}
      {isCropping && imageSrc && createPortal(
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ zIndex: 999999 }}
          onClick={cancelCrop}
        >
          <style>{`
            .custom-react-easy-crop .reactEasyCrop_CropArea {
              border: 1.5px solid rgba(0, 0, 0, 0.75) !important;
              color: rgba(0, 0, 0, 0.4) !important;
            }
          `}</style>

          <div
            className="bg-white rounded-[22px] w-[682px] h-[535px] max-w-[95vw] max-h-[92vh] relative shadow-2xl overflow-hidden select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close / Cancel button */}
            <button
              onClick={cancelCrop}
              className="absolute top-3.5 right-3.5 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-50 cursor-pointer"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Frame 5 - Crop Canvas (0.7x: 581px x 371px at left 50px, top 61px) */}
            <div className="absolute left-[50px] top-[61px] w-[581px] h-[371px] border border-black bg-white shrink-0 custom-react-easy-crop">
              {/* Corner Dots (0.7x: 14px size, positioned at -7px offset) */}
              <div className="absolute -left-[7px] -top-[7px] w-[14px] h-[14px] rounded-full bg-[#4A4A4A] z-20 pointer-events-none" />
              <div className="absolute -right-[7px] -top-[7px] w-[14px] h-[14px] rounded-full bg-[#4A4A4A] z-20 pointer-events-none" />
              <div className="absolute -left-[7px] -bottom-[7px] w-[14px] h-[14px] rounded-full bg-[#4A4A4A] z-20 pointer-events-none" />
              <div className="absolute -right-[7px] -bottom-[7px] w-[14px] h-[14px] rounded-full bg-[#4A4A4A] z-20 pointer-events-none" />

              <div className="absolute inset-0 z-10 overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  restrictPosition={false}
                  minZoom={0.1}
                  maxZoom={5}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  objectFit="contain"
                  showGrid={true}
                  style={{
                    containerStyle: { background: defaultColor || '#FFFFFF' },
                    overlayStyle: { background: 'rgba(0, 0, 0, 0.35)' },
                  }}
                />
              </div>
            </div>

            {/* Frame 2 - Slider Container (0.7x: 384px x 42px at left 60px, top 469px) */}
            <div className="absolute left-[60px] top-[469px] bg-[#e2effb] h-[42px] w-[384px] rounded-[13px] flex items-center px-[8px] gap-2.5">
              <button
                onClick={() => setZoom(z => Math.max(0.1, Number((z - 0.1).toFixed(2))))}
                className="bg-[#d9d9d9] w-[28px] h-[28px] rounded-[14px] flex items-center justify-center text-black text-[18px] font-bold shrink-0 hover:bg-gray-300 transition-colors cursor-pointer select-none"
                title="Zoom out"
              >
                -
              </button>

              {/* Custom Styled Range Slider */}
              <div className="flex-1 relative flex items-center px-1">
                <input
                  type="range"
                  value={zoom}
                  min={0.1}
                  max={5}
                  step={0.05}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-[3px] bg-black appearance-none outline-none rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[17px] [&::-webkit-slider-thumb]:h-[17px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF0070] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-[17px] [&::-moz-range-thumb]:h-[17px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF0070] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
                />
              </div>

              <button
                onClick={() => setZoom(z => Math.min(5, Number((z + 0.1).toFixed(2))))}
                className="bg-[#d9d9d9] w-[28px] h-[28px] rounded-[14px] flex items-center justify-center text-black text-[18px] font-bold shrink-0 hover:bg-gray-300 transition-colors cursor-pointer select-none"
                title="Zoom in"
              >
                +
              </button>
            </div>

            {/* Frame 1 - Done Button (0.7x: at left 499px, top 469px, h 42px) */}
            <button
              onClick={createCroppedImage}
              disabled={isSavingCrop || !croppedAreaPixels}
              className="absolute left-[499px] top-[469px] bg-[#e25a7e] hover:bg-[#d4486d] active:scale-95 transition-all rounded-[12px] h-[42px] px-[32px] shrink-0 cursor-pointer shadow-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed select-none"
            >
              {isSavingCrop ? (
                <div className="flex items-center gap-1.5 text-white text-[17px] font-bold font-['Inter',sans-serif]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <span className="text-white text-[17px] font-bold font-['Inter',sans-serif] capitalize leading-none">Done</span>
              )}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
