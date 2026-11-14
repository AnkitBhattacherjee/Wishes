// Sticker Library with curated sticker assets from imports and drive assets
import imgScrap1 from '../../../imports/image.png';
import imgScrap2 from '../../../imports/image-1.png';
import imgScrap3 from '../../../imports/image-2.png';
import imgScrap4 from '../../../imports/image-3.png';
import imgScrap5 from '../../../imports/image-4.png';

import imgPhotoClip from '../../../imports/Frame90/a77e47a4cb4004ac4569d05f7b0a9719c2c2c07f.png';
import imgHeartStamp from '../../../imports/Frame90/3be82de1a851dda81c947828c8cb692ca878210b.png';
import imgRomanticTag from '../../../imports/Frame90/f3a9c48db0ca3cd676badc3dc36ecf9c4efe4788.png';
import imgBookmarkTab from '../../../imports/Frame90/ddb83e26ed11db396dde558aa4b1aaed2e97ad79.png';

import imgFlowerBadge from '../../../imports/Desktop1/96e0121d6f67722e27074a45cb356a53908b5e96.png';
import imgVintageStamp from '../../../imports/Desktop1/6b32c493cebc0f086e0a5454f3ecef5816f3fc78.png';
import imgPinkWashi from '../../../imports/Desktop1/b996df98d62ded9811bf44adaa48c0ecec2e0b17.png';
import imgBowRibbon from '../../../imports/Desktop1/b6be25e4156c55d80f15742e24537bc295cb2060.png';
import imgBotanical from '../../../imports/Desktop1/cf52bcb79eeddb7b365dffea293f3ae60516c210.png';

import imgHeartNote from '../../../imports/Desktop2-1-1/74053b7a43b2ac5bc016ea11a98d4718ed6e8bfb.png';
import imgRibbonAccent from '../../../imports/Desktop2-1-1/20518c2adb30c50e39319fa1b0028541ab692bcf.png';
import imgLoveCard from '../../../imports/Desktop5/0bd4e23f24a646a01f3e77b7524de44c008be2ab.png';
import imgBirthdayCake from '../../../imports/birthday_cake.png';
import imgLoveMailbox from '../../../imports/love_mailbox.png';
import imgLoveEnvelope from '../../../imports/love_envelope.png';

// Floral Bouquet Stickers
import imgBouquetFloral1 from '../../../imports/bouquet_floral_1.png';
import imgBouquetFloral2 from '../../../imports/bouquet_floral_2.png';
import imgBouquetFloral3 from '../../../imports/bouquet_floral_3.png';
import imgBouquetWater1 from '../../../imports/bouquet_watercolor_1.png';
import imgBouquetWater2 from '../../../imports/bouquet_watercolor_2.png';
import imgBouquetWater3 from '../../../imports/bouquet_watercolor_3.png';
import imgBouquetWater4 from '../../../imports/bouquet_watercolor_4.png';
import imgBouquetWater5 from '../../../imports/bouquet_watercolor_5.png';
import imgBouquetWater6 from '../../../imports/bouquet_watercolor_6.png';
import imgBouquetWater7 from '../../../imports/bouquet_watercolor_7.png';

// Hand-Lettered Encouragement & Quote Stickers
import imgQuote1 from '../../../imports/sticker_quote_1.png';
import imgQuote2 from '../../../imports/sticker_quote_2.png';
import imgQuote3 from '../../../imports/sticker_quote_3.png';
import imgQuote4 from '../../../imports/sticker_quote_4.png';
import imgQuote5 from '../../../imports/sticker_quote_5.png';
import imgQuote6 from '../../../imports/sticker_quote_6.png';

// Pastel Love & Self-Care Stickers
import imgLove1 from '../../../imports/sticker_love_1.png';
import imgLove2 from '../../../imports/sticker_love_2.png';
import imgLove3 from '../../../imports/sticker_love_3.png';
import imgLove4 from '../../../imports/sticker_love_4.png';
import imgLove5 from '../../../imports/sticker_love_5.png';
import imgLove6 from '../../../imports/sticker_love_6.png';
import imgLove7 from '../../../imports/sticker_love_7.png';

// Warm Watercolour Celebration Stickers
import imgParty1 from '../../../imports/sticker_party_1.png';
import imgParty2 from '../../../imports/sticker_party_2.png';
import imgParty3 from '../../../imports/sticker_party_3.png';
import imgParty4 from '../../../imports/sticker_party_4.png';

export interface StickerItem {
  id: string;
  name: string;
  category: 'memories' | 'decorative' | 'washi' | 'stamps' | 'celebration' | 'bouquets' | 'quotes' | 'love';
  src: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const STICKER_LIBRARY: StickerItem[] = [
  // Floral Bouquets
  { id: 'bouquet_floral_1', name: 'Peony & Rose Bouquet', category: 'bouquets', src: imgBouquetFloral1, defaultWidth: 140, defaultHeight: 180 },
  { id: 'bouquet_floral_2', name: 'Spring Blossom Bouquet', category: 'bouquets', src: imgBouquetFloral2, defaultWidth: 140, defaultHeight: 180 },
  { id: 'bouquet_floral_3', name: 'Romantic Rose Bundle', category: 'bouquets', src: imgBouquetFloral3, defaultWidth: 140, defaultHeight: 180 },
  { id: 'bouquet_water_1', name: 'Watercolor Bouquet 1', category: 'bouquets', src: imgBouquetWater1, defaultWidth: 135, defaultHeight: 175 },
  { id: 'bouquet_water_2', name: 'Watercolor Bouquet 2', category: 'bouquets', src: imgBouquetWater2, defaultWidth: 140, defaultHeight: 160 },
  { id: 'bouquet_water_3', name: 'Pastel Botanical Bunch', category: 'bouquets', src: imgBouquetWater3, defaultWidth: 135, defaultHeight: 165 },
  { id: 'bouquet_water_4', name: 'Garden Floral Spray', category: 'bouquets', src: imgBouquetWater4, defaultWidth: 135, defaultHeight: 165 },
  { id: 'bouquet_water_5', name: 'Wildflower Cluster', category: 'bouquets', src: imgBouquetWater5, defaultWidth: 140, defaultHeight: 165 },
  { id: 'bouquet_water_6', name: 'Sweet Daisy Bouquet', category: 'bouquets', src: imgBouquetWater6, defaultWidth: 135, defaultHeight: 165 },
  { id: 'bouquet_water_7', name: 'Vintage Rose Bunch', category: 'bouquets', src: imgBouquetWater7, defaultWidth: 135, defaultHeight: 175 },

  // Inspiring Quotes & Hand Lettering
  { id: 'quote_1', name: 'Hand-Lettered Quote 1', category: 'quotes', src: imgQuote1, defaultWidth: 155, defaultHeight: 110 },
  { id: 'quote_2', name: 'Hand-Lettered Quote 2', category: 'quotes', src: imgQuote2, defaultWidth: 155, defaultHeight: 110 },
  { id: 'quote_3', name: 'Hand-Lettered Quote 3', category: 'quotes', src: imgQuote3, defaultWidth: 155, defaultHeight: 110 },
  { id: 'quote_4', name: 'Hand-Lettered Quote 4', category: 'quotes', src: imgQuote4, defaultWidth: 155, defaultHeight: 100 },
  { id: 'quote_5', name: 'Hand-Lettered Quote 5', category: 'quotes', src: imgQuote5, defaultWidth: 165, defaultHeight: 100 },
  { id: 'quote_6', name: 'Hand-Lettered Quote 6', category: 'quotes', src: imgQuote6, defaultWidth: 145, defaultHeight: 110 },

  // Pastel Love & Self-Care
  { id: 'love_care_1', name: 'Sweet Note 1', category: 'love', src: imgLove1, defaultWidth: 150, defaultHeight: 95 },
  { id: 'love_care_2', name: 'Heart Accent 2', category: 'love', src: imgLove2, defaultWidth: 110, defaultHeight: 130 },
  { id: 'love_care_3', name: 'Floral Charm 3', category: 'love', src: imgLove3, defaultWidth: 105, defaultHeight: 135 },
  { id: 'love_care_4', name: 'Love Badge 4', category: 'love', src: imgLove4, defaultWidth: 135, defaultHeight: 135 },
  { id: 'love_care_5', name: 'Pastel Icon 5', category: 'love', src: imgLove5, defaultWidth: 145, defaultHeight: 130 },
  { id: 'love_care_6', name: 'Cute Note 6', category: 'love', src: imgLove6, defaultWidth: 125, defaultHeight: 130 },
  { id: 'love_care_7', name: 'Heart Banner 7', category: 'love', src: imgLove7, defaultWidth: 140, defaultHeight: 100 },

  // Warm Celebration & Party
  { id: 'party_warm_1', name: 'Celebration Cupcake & Treats', category: 'celebration', src: imgParty1, defaultWidth: 140, defaultHeight: 135 },
  { id: 'party_warm_2', name: 'Party Banner & Garland', category: 'celebration', src: imgParty2, defaultWidth: 175, defaultHeight: 125 },
  { id: 'party_warm_3', name: 'Party Flags & Confetti', category: 'celebration', src: imgParty3, defaultWidth: 165, defaultHeight: 95 },
  { id: 'party_warm_4', name: 'Festive Balloon & Cake', category: 'celebration', src: imgParty4, defaultWidth: 155, defaultHeight: 120 },
  { id: 'celeb_cake', name: 'Birthday Cake 3D', category: 'celebration', src: imgBirthdayCake, defaultWidth: 140, defaultHeight: 140 },
  { id: 'celeb_mailbox', name: 'Love Mailbox 3D', category: 'celebration', src: imgLoveMailbox, defaultWidth: 140, defaultHeight: 140 },
  { id: 'celeb_envelope', name: 'Love Letter 3D', category: 'celebration', src: imgLoveEnvelope, defaultWidth: 140, defaultHeight: 140 },

  // Memories & Drive Scraps
  { id: 'scrap_drive_1', name: 'Vintage Scrap', category: 'memories', src: imgScrap1, defaultWidth: 150, defaultHeight: 150 },
  { id: 'scrap_drive_2', name: 'Memory Tag 1', category: 'memories', src: imgScrap2, defaultWidth: 140, defaultHeight: 140 },
  { id: 'scrap_drive_3', name: 'Memory Tag 2', category: 'memories', src: imgScrap3, defaultWidth: 140, defaultHeight: 140 },
  { id: 'scrap_drive_4', name: 'Memory Tag 3', category: 'memories', src: imgScrap4, defaultWidth: 140, defaultHeight: 140 },
  { id: 'scrap_drive_5', name: 'Memory Tag 4', category: 'memories', src: imgScrap5, defaultWidth: 140, defaultHeight: 140 },

  // Cute & Decorative
  { id: 'deco_heart_stamp', name: 'Heart Stamp', category: 'decorative', src: imgHeartStamp, defaultWidth: 130, defaultHeight: 130 },
  { id: 'deco_romantic_tag', name: 'Romantic Tag', category: 'decorative', src: imgRomanticTag, defaultWidth: 140, defaultHeight: 120 },
  { id: 'deco_flower_badge', name: 'Flower Badge', category: 'decorative', src: imgFlowerBadge, defaultWidth: 120, defaultHeight: 120 },
  { id: 'deco_bow_ribbon', name: 'Bow Ribbon', category: 'decorative', src: imgBowRibbon, defaultWidth: 110, defaultHeight: 130 },
  { id: 'deco_botanical', name: 'Botanical Leaf', category: 'decorative', src: imgBotanical, defaultWidth: 120, defaultHeight: 120 },
  { id: 'deco_heart_note', name: 'Sweet Note', category: 'decorative', src: imgHeartNote, defaultWidth: 140, defaultHeight: 130 },
  { id: 'deco_love_card', name: 'Love Card', category: 'decorative', src: imgLoveCard, defaultWidth: 150, defaultHeight: 130 },

  // Washi Tapes & Clips
  { id: 'tape_pink_washi', name: 'Pink Washi Tape', category: 'washi', src: imgPinkWashi, defaultWidth: 150, defaultHeight: 90 },
  { id: 'tape_photo_clip', name: 'Photo Clip', category: 'washi', src: imgPhotoClip, defaultWidth: 130, defaultHeight: 140 },
  { id: 'tape_ribbon_accent', name: 'Ribbon Clip', category: 'washi', src: imgRibbonAccent, defaultWidth: 130, defaultHeight: 120 },
  { id: 'tape_bookmark_tab', name: 'Bookmark Tab', category: 'washi', src: imgBookmarkTab, defaultWidth: 100, defaultHeight: 140 },

  // Stamps & Badges
  { id: 'stamp_vintage', name: 'Vintage Postal Stamp', category: 'stamps', src: imgVintageStamp, defaultWidth: 130, defaultHeight: 130 },
];

export const STICKER_CATEGORIES = [
  { id: 'all', label: 'All Stickers' },
  { id: 'bouquets', label: 'Floral Bouquets 💐' },
  { id: 'quotes', label: 'Quotes 💬' },
  { id: 'love', label: 'Pastel Love 💕' },
  { id: 'celebration', label: 'Party & Celebration 🎉' },
  { id: 'memories', label: 'Memories & Tags 🏷️' },
  { id: 'decorative', label: 'Cute & Floral 🌸' },
  { id: 'washi', label: 'Tapes & Clips 📎' },
  { id: 'stamps', label: 'Stamps 💌' },
] as const;
