import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import type { MailboxBubbleItem } from "../giftStore";

/* ── High-Res Puppet & Stage Assets (8 Canonical Reference Characters) ── */
import imgPutulStage from "../../imports/putulkhela/Ornate Wishes Puppet Theatre Stage.png";
import imgPuppetBride from "../../imports/putulkhela/Dancing Indian Bridal Puppet.png";
import imgPuppetMoonBoy from "../../imports/putulkhela/Golden Moon Puppet Boy.png";
import imgPuppetLantern from "../../imports/putulkhela/Indian Folk Puppet with Golden Lantern.png";
import imgPuppetBooks from "../../imports/putulkhela/Indian Marionette with Stacked Books.png";
import imgPuppetArtist from "../../imports/putulkhela/Indian Puppet Artist Painting a Landscape.png";
import imgPuppetArchitect from "../../imports/putulkhela/Traditional Indian Puppet Holding Architectural Sketch.png";
import imgPuppetMusician from "../../imports/putulkhela/Traditional Indian Puppet Musician.png";
import imgPuppetTelescope from "../../imports/putulkhela/Wooden Puppet Boy with Brass Telescope.png";

/* ── Puppet Catalog Item Interface ── */
export interface PuppetCatalogItem {
  id: string;
  key: string;
  nameBn: string;
  nameEn: string;
  role: string;
  src: string;
  leftPercent: number; // Exact X center % on the stage
  bottomPercent: number; // Exact Y floor %
  heightPercent: number; // Height % relative to stage
  zIndex: number;
  defaultType: "song" | "voice" | "photo" | "note" | "dream" | "surprise";
  defaultTitle: string;
  defaultMessage: string;
  defaultSender?: string;
  stampEmoji: string;
}

/* ── The 8 Canonical Puppets (Exact Match to Reference Image without Doctor) ── */
export const PUPPET_CATALOG: Record<string, PuppetCatalogItem> = {
  lantern: {
    id: "lantern",
    key: "lantern",
    nameBn: "আলোর পুতুল",
    nameEn: "Lantern Bearer",
    role: "Golden Light & Warmth",
    src: imgPuppetLantern,
    leftPercent: 12.4,
    bottomPercent: 19.44,
    heightPercent: 42.36,
    zIndex: 21,
    defaultType: "surprise",
    defaultTitle: "A Beacon of Warmth 🏮",
    defaultMessage: "May the golden lantern always guide your journey with hope, gentle laughter, and boundless warmth!",
    stampEmoji: "🏮",
  },
  books: {
    id: "books",
    key: "books",
    nameBn: "গল্পের পুতুল",
    nameEn: "Story Maiden",
    role: "Chapters of Memories",
    src: imgPuppetBooks,
    leftPercent: 20.7,
    bottomPercent: 19.44,
    heightPercent: 35.42,
    zIndex: 22,
    defaultType: "note",
    defaultTitle: "Pages of Our Story 📖",
    defaultMessage: "Every chapter written with you is treasured in gold. Here's to all the countless magical stories still waiting for us!",
    stampEmoji: "📖",
  },
  telescope: {
    id: "telescope",
    key: "telescope",
    nameBn: "তারাখোজা পুতুল",
    nameEn: "Dream Stargazer",
    role: "Secret Dream & Wish",
    src: imgPuppetTelescope,
    leftPercent: 29.49,
    bottomPercent: 17.71,
    heightPercent: 28.47,
    zIndex: 26,
    defaultType: "dream",
    defaultTitle: "My Secret Dream For Us 💫",
    defaultMessage: "My dream is that no matter how many years pass, we continue exploring new horizons, laughing under the starlit sky, and celebrating every single joy together.",
    stampEmoji: "🌟",
  },
  bride: {
    id: "bride",
    key: "bride",
    nameBn: "নৃত্যরত পুতুল",
    nameEn: "Star Dancer",
    role: "Heartfelt Love Letter",
    src: imgPuppetBride,
    leftPercent: 41.46,
    bottomPercent: 19.44,
    heightPercent: 38.89,
    zIndex: 24, // Reaching up touching the center glowing star
    defaultType: "note",
    defaultTitle: "A Secret Love Note 💌",
    defaultMessage: "Every single day with you feels like a quiet blessing. Thank you for bringing so much gentle light, warmth, and laughter into my life.",
    stampEmoji: "💌",
  },
  architect: {
    id: "architect",
    key: "architect",
    nameBn: "সপ্নগড়া পুতুল",
    nameEn: "Dream Builder",
    role: "Future Promises & Plans",
    src: imgPuppetArchitect,
    leftPercent: 56.59,
    bottomPercent: 19.44,
    heightPercent: 36.28,
    zIndex: 22,
    defaultType: "dream",
    defaultTitle: "Building Our Dreams 🏛️",
    defaultMessage: "Here is to crafting a life full of cozy homes, wonderful journeys, and dreams turned into reality side by side.",
    stampEmoji: "🏛️",
  },
  musician: {
    id: "musician",
    key: "musician",
    nameBn: "সুরের পুতুল",
    nameEn: "Melody Maker",
    role: "Dedicated Song",
    src: imgPuppetMusician,
    leftPercent: 64.89,
    bottomPercent: 19.44,
    heightPercent: 31.94,
    zIndex: 23,
    defaultType: "song",
    defaultTitle: "Our Dedicated Song 🎵",
    defaultMessage: "I picked this melody especially for you. Whenever this plays, remember how much you mean to me.",
    stampEmoji: "🎵",
  },
  moonboy: {
    id: "moonboy",
    key: "moonboy",
    nameBn: "চাঁদের পুতুল",
    nameEn: "Moonbeam Boy",
    role: "Personal Voice Whisper",
    src: imgPuppetMoonBoy,
    leftPercent: 71.0,
    bottomPercent: 17.71,
    heightPercent: 24.13,
    zIndex: 27, // Sits crosslegged on wooden floor in foreground
    defaultType: "voice",
    defaultTitle: "A Voice Whispered For You 🎙️",
    defaultMessage: "A little personal voice note recorded just for you. Listen with headphones for all the warmth!",
    stampEmoji: "🎙️",
  },
  painter: {
    id: "painter",
    key: "painter",
    nameBn: "চিত্রশিল্পী পুতুল",
    nameEn: "Memory Painter",
    role: "Cherished Photo Moment",
    src: imgPuppetArtist,
    leftPercent: 88.0,
    bottomPercent: 17.71,
    heightPercent: 37.15,
    zIndex: 25, // Standing at easel painting landscape
    defaultType: "photo",
    defaultTitle: "A Starlit Memory 📸",
    defaultMessage: "Every starry night reminds me of the magic, comfort, and laughter we share together.",
    stampEmoji: "📸",
  },
};

export const STAGE_PUPPETS = Object.values(PUPPET_CATALOG);

/* ── Helper to resolve puppet for a mailbox item ── */
export function getPuppetForItem(
  item: MailboxBubbleItem,
  index = 0
): PuppetCatalogItem {
  if (item.puppetId && PUPPET_CATALOG[item.puppetId]) {
    return PUPPET_CATALOG[item.puppetId];
  }
  const matchByType = STAGE_PUPPETS.find((p) => p.defaultType === item.type);
  if (matchByType) return matchByType;
  return STAGE_PUPPETS[index % STAGE_PUPPETS.length];
}

/* ── Warm Wooden Chime Audio (Spring marionette pull sound) ── */
function playWoodenChimeSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(293.66, now + 0.35);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.045, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0003, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880, now + 0.025); // A5
    gain2.gain.setValueAtTime(0.001, now + 0.025);
    gain2.gain.linearRampToValueAtTime(0.03, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.0002, now + 0.32);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.025);
    osc2.stop(now + 0.33);
  } catch {}
}

export function PutulKhelaStage({
  name,
  items,
  poppedIds,
  onPopItem,
  onResetItems,
}: {
  name: string;
  items: MailboxBubbleItem[];
  poppedIds: Set<string>;
  onPopItem: (item: MailboxBubbleItem, clientX: number, clientY: number) => void;
  onResetItems: () => void;
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [pulledKey, setPulledKey] = useState<string | null>(null);

  // Map each of the 8 canonical puppets to its corresponding memory item
  const slotMappings = useMemo(() => {
    return STAGE_PUPPETS.map((slot) => {
      // 1. Try explicit puppetId match (prioritize items with photos/audio or the latest one)
      const puppetMatches = items.filter(
        (i) => i.puppetId === slot.key || (slot.key === "painter" && i.puppetId === "artist")
      );
      if (puppetMatches.length > 0) {
        const customContentMatch = puppetMatches.find(
          (i) => i.photoUrl || i.audioUrl || i.youtubeId || i.voiceUrl
        );
        const bestMatch = customContentMatch || puppetMatches[puppetMatches.length - 1];
        return { slot, item: bestMatch, isCustom: true };
      }

      // 2. Try type match
      const typeMatches = items.filter(
        (i) => i.type === slot.defaultType && !STAGE_PUPPETS.some((s) => s.key === i.puppetId && s.key !== slot.key)
      );
      if (typeMatches.length > 0) {
        const customContentMatch = typeMatches.find(
          (i) => i.photoUrl || i.audioUrl || i.youtubeId || i.voiceUrl
        );
        const bestMatch = customContentMatch || typeMatches[typeMatches.length - 1];
        return { slot, item: bestMatch, isCustom: true };
      }

      // 3. Fallback default item
      const defaultItem: MailboxBubbleItem = {
        id: `putul-default-${slot.key}`,
        type: slot.defaultType,
        title: slot.defaultTitle,
        sender: "Your Special Person",
        date: "Putul Khela Stage",
        message: slot.defaultMessage,
        puppetId: slot.key,
        stampEmoji: slot.stampEmoji,
        color: "#fcf6e9",
      };
      return { slot, item: defaultItem, isCustom: false };
    });
  }, [items]);

  const unlockedCount = slotMappings.filter(({ item }) => poppedIds.has(item.id)).length;

  const handlePuppetClick = (
    item: MailboxBubbleItem,
    slotKey: string,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    playWoodenChimeSound();
    setPulledKey(slotKey);
    setTimeout(() => setPulledKey(null), 480);
    onPopItem(item, e.clientX, e.clientY);
  };

  return (
    /* ── Full Width Edge-to-Edge Stage Container (Laptop & Desktop) ── */
    <div className="relative w-full h-full overflow-hidden select-none bg-[#07010b]">
      <div className="relative w-full h-full overflow-hidden select-none">
        {/* Stage Background Image: Spans edge-to-edge */}
        <img
          src={imgPutulStage}
          alt="Bengali Putul Khela Stage"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
          draggable={false}
        />

        {/* Ambient warm theatre spotlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 65%, rgba(251, 191, 36, 0.08) 0%, transparent 65%)",
          }}
        />

        {/* ── The 8 Canonical Puppets (Exact match to reference image without doctor) ── */}
        {slotMappings.map(({ slot, item }) => {
          const isPopped = poppedIds.has(item.id);
          const isHovered = hoveredKey === slot.key;
          const isPulled = pulledKey === slot.key;

          return (
            <div
              key={slot.key}
              style={{
                position: "absolute",
                left: `${slot.leftPercent}%`,
                bottom: `${slot.bottomPercent}%`,
                transform: "translateX(-50%)",
                height: `${slot.heightPercent}%`,
                zIndex: isHovered ? 45 : slot.zIndex,
              }}
              className="flex flex-col items-center pointer-events-auto"
            >
              {/* ── Interactive Puppet Body (Minimalist: No text pills, no clutter) ── */}
              <motion.div
                onMouseEnter={() => setHoveredKey(slot.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={(e) => handlePuppetClick(item, slot.key, e)}
                animate={
                  isPulled
                    ? {
                        y: [-22, -4, -14, 0],
                        rotate: [-4, 3, -1, 0],
                        scale: [1.02, 1.05, 1.02, 1],
                      }
                    : isHovered
                    ? {
                        y: [-10, -3, -8],
                        rotate: [-1.5, 1.5, -1.5],
                      }
                    : {
                        y: [0, -2.5, 0],
                        rotate: [0, 0.4, 0],
                      }
                }
                transition={
                  isPulled
                    ? { duration: 0.46, ease: "easeOut" }
                    : isHovered
                    ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: (STAGE_PUPPETS.indexOf(slot) % 3) * 0.4 }
                }
                whileTap={{ scale: 0.96 }}
                className="relative cursor-pointer group h-full flex flex-col items-center justify-end"
                title={`${slot.nameBn} (${slot.nameEn})`}
              >
                {/* Subtle soft golden floor glow on hover / unlocked */}
                {(isHovered || isPopped) && (
                  <div
                    className="absolute -bottom-1 w-24 h-4 rounded-full blur-xs pointer-events-none transition-opacity duration-300"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, rgba(251, 191, 36, 0.6) 0%, transparent 70%)",
                      opacity: isHovered ? 0.9 : 0.5,
                    }}
                  />
                )}

                {/* Puppet PNG Image */}
                <img
                  src={slot.src}
                  alt={slot.nameEn}
                  className="h-full w-auto object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_16px_36px_rgba(251,191,36,0.65)] transition-all select-none"
                  draggable={false}
                />
              </motion.div>
            </div>
          );
        })}

        {/* ── Minimalist Corner Reset Button (Only appears after strings are pulled) ── */}
        {unlockedCount > 0 && (
          <div className="absolute bottom-4 right-5 z-40">
            <button
              onClick={onResetItems}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/65 border border-white/20 text-amber-200/90 hover:text-amber-100 text-xs font-medium backdrop-blur-xl shadow-lg transition-all cursor-pointer"
              title="Reset all puppets to pull strings again"
            >
              <RotateCcw size={12} />
              <span>Reset Stage</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
