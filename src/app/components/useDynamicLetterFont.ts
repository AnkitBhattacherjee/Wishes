import { useState, useEffect, useCallback } from "react";

export type LetterFontStyle = "caveat" | "dancing" | "playfair";

export interface DynamicLetterFont {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  isItalic: boolean;
  isScaledDown: boolean;
  isMinLimit: boolean;
  scalePercent: number;
  scaleLevel: number;
}

interface FontConfig {
  fontFamily: string;
  isItalic?: boolean;
  lineHeight: number;
  // Sizes from comfortable & natural (Level 0) down to one-page limit
  sizes: number[];
}

export const LETTER_FONT_CONFIGS: Record<LetterFontStyle, FontConfig> = {
  caveat: {
    fontFamily: "'Caveat', cursive",
    lineHeight: 1.55,
    sizes: [18, 17, 16, 15, 14, 13, 12, 11],
  },
  dancing: {
    fontFamily: "'Dancing Script', cursive",
    lineHeight: 1.6,
    sizes: [17, 16, 15, 14, 13, 12, 11],
  },
  playfair: {
    fontFamily: "'Playfair Display', serif",
    isItalic: true,
    lineHeight: 1.65,
    sizes: [15, 14, 13.5, 13, 12, 11],
  },
};

/**
 * Measures the rendered height of text using a dedicated hidden DOM mirror.
 */
function measureTextHeight(
  text: string,
  width: number,
  fontFamily: string,
  fontSize: number,
  lineHeight: number,
  isItalic = false
): number {
  if (typeof document === "undefined") return 0;

  let mirror = document.getElementById("__letter_text_mirror__") as HTMLDivElement | null;
  if (!mirror) {
    mirror = document.createElement("div");
    mirror.id = "__letter_text_mirror__";
    mirror.style.position = "fixed";
    mirror.style.top = "-99999px";
    mirror.style.left = "-99999px";
    mirror.style.visibility = "hidden";
    mirror.style.pointerEvents = "none";
    mirror.style.zIndex = "-99999";
    mirror.style.overflow = "hidden";
    mirror.style.padding = "0";
    mirror.style.margin = "0";
    mirror.style.border = "none";
    mirror.style.boxSizing = "border-box";
    document.body.appendChild(mirror);
  }

  // Account for internal padding (4px each side) and scrollbar clearance
  const usableWidth = Math.max(20, width - 10);
  mirror.style.width = `${usableWidth}px`;
  mirror.style.fontFamily = fontFamily;
  mirror.style.fontSize = `${fontSize}px`;
  mirror.style.lineHeight = `${lineHeight}`;
  mirror.style.fontStyle = isItalic ? "italic" : "normal";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordBreak = "break-word";
  mirror.style.overflowWrap = "break-word";

  // Account for trailing newlines so blank lines are accurately sized
  const content = text.endsWith("\n") ? text + "\u200B" : text || "\u200B";
  mirror.textContent = content;

  return mirror.scrollHeight;
}

/**
 * Automatically adjusts font size so that:
 * 1. Short or normal messages stay at a balanced, comfortable handwriting font size.
 * 2. If the text begins to exceed the frame, font size progressively steps down to fit up to a full one-page letter without scrolling.
 * 3. Once it hits the lower readability limit, it stops decreasing and standard scrolling handles any excess.
 * 4. Listens to `isOpen` transitions to guarantee recalculation and observation when conditionally mounted.
 */
export function useDynamicLetterFont(
  text: string,
  fontStyle: LetterFontStyle = "caveat",
  containerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean = true
): DynamicLetterFont {
  const config = LETTER_FONT_CONFIGS[fontStyle] || LETTER_FONT_CONFIGS.caveat;
  const defaultSize = config.sizes[0];

  const [state, setState] = useState<DynamicLetterFont>({
    fontSize: defaultSize,
    lineHeight: config.lineHeight,
    fontFamily: config.fontFamily,
    isItalic: !!config.isItalic,
    isScaledDown: false,
    isMinLimit: false,
    scalePercent: 100,
    scaleLevel: 0,
  });

  const calculateFit = useCallback(() => {
    const container = containerRef.current;
    const currentConfig = LETTER_FONT_CONFIGS[fontStyle] || LETTER_FONT_CONFIGS.caveat;
    const sizes = currentConfig.sizes;

    // If container not ready yet or text is empty, return default size
    if (!container) {
      setState({
        fontSize: sizes[0],
        lineHeight: currentConfig.lineHeight,
        fontFamily: currentConfig.fontFamily,
        isItalic: !!currentConfig.isItalic,
        isScaledDown: false,
        isMinLimit: false,
        scalePercent: 100,
        scaleLevel: 0,
      });
      return;
    }

    const availableHeight = container.clientHeight;
    const availableWidth = container.clientWidth;

    if (availableHeight <= 0 || availableWidth <= 0) return;

    if (!text || !text.trim()) {
      setState({
        fontSize: sizes[0],
        lineHeight: currentConfig.lineHeight,
        fontFamily: currentConfig.fontFamily,
        isItalic: !!currentConfig.isItalic,
        isScaledDown: false,
        isMinLimit: false,
        scalePercent: 100,
        scaleLevel: 0,
      });
      return;
    }

    // Safety margin to prevent scrollbars from jittering near exact pixel bounds
    const targetHeight = Math.max(40, availableHeight - 6);

    let chosenLevel = 0;
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const renderedHeight = measureTextHeight(
        text,
        availableWidth,
        currentConfig.fontFamily,
        size,
        currentConfig.lineHeight,
        currentConfig.isItalic
      );

      if (renderedHeight <= targetHeight) {
        chosenLevel = i;
        break;
      }
      chosenLevel = i;
    }

    const chosenSize = sizes[chosenLevel];
    const isScaledDown = chosenLevel > 0;
    const isMinLimit = chosenLevel === sizes.length - 1;
    const scalePercent = Math.round((chosenSize / sizes[0]) * 100);

    setState({
      fontSize: chosenSize,
      lineHeight: currentConfig.lineHeight,
      fontFamily: currentConfig.fontFamily,
      isItalic: !!currentConfig.isItalic,
      isScaledDown,
      isMinLimit,
      scalePercent,
      scaleLevel: chosenLevel,
    });
  }, [text, fontStyle, containerRef]);

  // Recalculate on text, fontStyle, or layout change
  useEffect(() => {
    calculateFit();
  }, [calculateFit]);

  // Observe container mounting, visibility, and resizing
  useEffect(() => {
    if (!isOpen) return;

    let observer: ResizeObserver | null = null;
    let animId: number | null = null;
    let cancelled = false;
    let attempts = 0;

    const attach = () => {
      if (cancelled) return;
      const el = containerRef.current;
      if (el && el.clientWidth > 0 && el.clientHeight > 0) {
        calculateFit();
        observer = new ResizeObserver(() => {
          calculateFit();
        });
        observer.observe(el);
      } else if (attempts < 25) {
        attempts++;
        animId = requestAnimationFrame(attach);
      }
    };

    attach();

    // Re-check as Framer Motion spring transition settles
    const t1 = setTimeout(calculateFit, 100);
    const t2 = setTimeout(calculateFit, 350);

    return () => {
      cancelled = true;
      if (animId) cancelAnimationFrame(animId);
      if (observer) observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, containerRef, calculateFit]);

  // Ensure recalculation after custom web fonts finish loading
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        calculateFit();
      });
    }
  }, [fontStyle, calculateFit, isOpen]);

  return state;
}
