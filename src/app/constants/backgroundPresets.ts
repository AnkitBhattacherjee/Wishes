import imgImage10 from "figma:asset/22caa5ad402836f5fe397bca16006c6983d5252d.png";

export interface BackgroundPreset {
  id: string;
  name: string;
  subtitle: string;
  src: string;
  thumbnail: string;
}

export const PRESET_BACKGROUNDS: BackgroundPreset[] = [
  {
    id: "default-stationery",
    name: "Vintage Letter Parchment",
    subtitle: "Original hand-painted aesthetic",
    src: imgImage10,
    thumbnail: imgImage10,
  },
  {
    id: "rose-petals",
    name: "Soft Rose Petals",
    subtitle: "Romantic pastel blooms",
    src: "https://images.unsplash.com/photo-1578972497170-bfc780c65f65?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1578972497170-bfc780c65f65?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "warm-bokeh",
    name: "Golden Fairy Bokeh",
    subtitle: "Warm magical twilight glow",
    src: "https://images.unsplash.com/photo-1770740830168-eedfa0126ad8?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1770740830168-eedfa0126ad8?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "dreamy-clouds",
    name: "Cotton Candy Sunset",
    subtitle: "Dreamy pastel sky & clouds",
    src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "pastel-celebration",
    name: "Festive Confetti",
    subtitle: "Joyful celebration confetti",
    src: "https://images.unsplash.com/photo-1769443398678-411926888200?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1769443398678-411926888200?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "floral-watercolor",
    name: "Blossom Watercolor",
    subtitle: "Botanical painterly canvas",
    src: "https://images.unsplash.com/photo-1770977883066-4dbee15c84d2?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1770977883066-4dbee15c84d2?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "vintage-rose",
    name: "Vintage Garden Roses",
    subtitle: "Nostalgic antique pink florals",
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "starry-night",
    name: "Starlit Midnight",
    subtitle: "Deep celestial stars & wonder",
    src: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=260&q=70",
  },
];

export function formatUnsplashUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  const photoPageMatch = trimmed.match(/unsplash\.com\/photos\/(?:[\w-]+-)?([a-zA-Z0-9_-]{5,})/);
  if (photoPageMatch && photoPageMatch[1]) {
    const photoId = photoPageMatch[1];
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1920&q=80`;
  }

  if (trimmed.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(trimmed);
      urlObj.searchParams.set("auto", "format");
      urlObj.searchParams.set("fit", "crop");
      if (!urlObj.searchParams.has("w") || Number(urlObj.searchParams.get("w")) < 1200) {
        urlObj.searchParams.set("w", "1920");
      }
      if (!urlObj.searchParams.has("q")) {
        urlObj.searchParams.set("q", "80");
      }
      return urlObj.toString();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}
