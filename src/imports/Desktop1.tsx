import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import svgPaths from "./svg-pjdx32d27k";

// Animation variants
const starStreakVariant = (delay = 0) => ({
  animate: {
    strokeDashoffset: [1100, 0],
    transition: {
      duration: 3.5,
      ease: "linear",
      repeat: Infinity,
      delay: delay,
    },
  },
});

const twinkleVariant = (duration = 2, delay = 0) => ({
  animate: {
    opacity: [0.3, 1, 0.3],
    scale: [0.9, 1.1, 0.9],
    transition: {
      duration: duration,
      ease: "easeInOut",
      repeat: Infinity,
      delay: delay,
    },
  },
});

function Group() {
  return (
    // Full viewport coverage - stars streak diagonally from top to bottom
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <svg
        className="block w-full h-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <g id="Group 2">
          {/* Each line starts from the TOP edge and travels diagonally to the BOTTOM edge */}
          {/* Spread across the full width, all originating from y~0 down to y~900+ */}
          <motion.line variants={starStreakVariant(0)} animate="animate" strokeDasharray="140 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.9" x1="1460" y1="-10" x2="1160" y2="910" />
          <motion.line variants={starStreakVariant(0.7)} animate="animate" strokeDasharray="100 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.5" x1="1350" y1="-10" x2="1050" y2="910" />
          <motion.line variants={starStreakVariant(0.3)} animate="animate" strokeDasharray="120 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.75" x1="1240" y1="-10" x2="940" y2="910" />
          <motion.line variants={starStreakVariant(1.1)} animate="animate" strokeDasharray="90 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.45" x1="1130" y1="-10" x2="830" y2="910" />
          <motion.line variants={starStreakVariant(0.5)} animate="animate" strokeDasharray="130 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.85" x1="1020" y1="-10" x2="720" y2="910" />
          <motion.line variants={starStreakVariant(1.5)} animate="animate" strokeDasharray="80 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.4" x1="910" y1="-10" x2="610" y2="910" />
          <motion.line variants={starStreakVariant(0.2)} animate="animate" strokeDasharray="110 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.7" x1="800" y1="-10" x2="500" y2="910" />
          <motion.line variants={starStreakVariant(1.3)} animate="animate" strokeDasharray="95 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.5" x1="690" y1="-10" x2="390" y2="910" />
          <motion.line variants={starStreakVariant(0.8)} animate="animate" strokeDasharray="115 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.65" x1="580" y1="-10" x2="280" y2="910" />
          <motion.line variants={starStreakVariant(1.7)} animate="animate" strokeDasharray="75 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.35" x1="470" y1="-10" x2="170" y2="910" />
          <motion.line variants={starStreakVariant(0.4)} animate="animate" strokeDasharray="105 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.6" x1="360" y1="-10" x2="60" y2="910" />
          <motion.line variants={starStreakVariant(1.0)} animate="animate" strokeDasharray="85 1000" stroke="var(--stroke-0, #37EBFF)" strokeOpacity="0.4" x1="250" y1="-10" x2="-50" y2="910" />
        </g>
      </svg>
    </div>
  );
}

function Stars() {
  return (
    <motion.div variants={twinkleVariant(3, 0)} animate="animate" className="absolute h-[84.5px] left-[857px] top-[436px] w-[56.5px]" data-name="Stars">
      <div className="absolute inset-[-8.12%_-12.18%_-8.11%_-12.19%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70.2694 98.2115">
          <g id="Stars">
            <g filter="url(#filter0_f_3_117)" id="Vector 2">
              <path d={svgPaths.p12332600} fill="var(--fill-0, #37EBFF)" />
              <path d={svgPaths.p12332600} stroke="var(--stroke-0, #021135)" strokeWidth="0.2" />
            </g>
            <path d={svgPaths.p34ecc870} fill="var(--fill-0, #37EBFF)" id="Vector 1" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="98.2115" id="filter0_f_3_117" width="70.2694" x="2.98023e-08" y="-1.60187e-07">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_3_117" stdDeviation="3.4" />
            </filter>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function Stars1() {
  return (
    <motion.div variants={twinkleVariant(4, 1)} animate="animate" className="absolute h-[66.783px] left-[651px] top-[232px] w-[44.654px]" data-name="Stars">
      <div className="absolute inset-[-8.12%_-12.18%_-8.11%_-12.19%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 55.5362 77.6198">
          <g id="Stars">
            <g filter="url(#filter0_f_3_113)" id="Vector 2">
              <path d={svgPaths.p35402400} fill="var(--fill-0, #37EBFF)" />
              <path d={svgPaths.p35402400} stroke="var(--stroke-0, #021135)" strokeWidth="0.158067" />
            </g>
            <path d={svgPaths.pa225400} fill="var(--fill-0, #37EBFF)" id="Vector 1" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="77.6198" id="filter0_f_3_113" width="55.5362" x="0" y="-2.16067e-07">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_3_113" stdDeviation="2.68713" />
            </filter>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function Stars2() {
  return (
    <motion.div variants={twinkleVariant(2.5, 0.5)} animate="animate" className="absolute h-[31px] left-[328px] top-[481px] w-[20.728px]" data-name="Stars">
      <div className="absolute inset-[-8.12%_-12.18%_-8.11%_-12.19%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.7793 36.0302">
          <g id="Stars">
            <g filter="url(#filter0_f_3_109)" id="Vector 2">
              <path d={svgPaths.p1c3b1900} fill="var(--fill-0, #37EBFF)" />
              <path d={svgPaths.p1c3b1900} stroke="var(--stroke-0, #021135)" strokeWidth="0.0733728" />
            </g>
            <path d={svgPaths.p24fadc00} fill="var(--fill-0, #37EBFF)" id="Vector 1" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="36.0302" id="filter0_f_3_109" width="25.7793" x="-2.6077e-08" y="-5.02914e-08">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_3_109" stdDeviation="1.24734" />
            </filter>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function Stars3() {
  return (
    <motion.div variants={twinkleVariant(5, 2)} animate="animate" className="absolute h-[149.558px] left-[1160px] top-[159.94px] w-[100px]" data-name="Stars">
      <div className="absolute inset-[-8.12%_-12.18%_-8.11%_-12.19%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 124.371 173.826">
          <g id="Stars">
            <g filter="url(#filter0_f_3_105)" id="Vector 2">
              <path d={svgPaths.p2fd9ed00} fill="var(--fill-0, #37EBFF)" />
              <path d={svgPaths.p2fd9ed00} stroke="var(--stroke-0, #021135)" strokeWidth="0.353982" />
            </g>
            <path d={svgPaths.p58fd140} fill="var(--fill-0, #37EBFF)" id="Vector 1" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="173.826" id="filter0_f_3_105" width="124.371" x="1.93715e-07" y="-7.45058e-09">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_3_105" stdDeviation="6.0177" />
            </filter>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function Dots() {
  return (
    <motion.div variants={twinkleVariant(3.5, 1.2)} animate="animate" className="absolute left-[480px] size-[9px] top-[469px]" data-name="Dots">
      <div className="absolute inset-[-66.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 21">
          <g id="Dots">
            <g filter="url(#filter0_f_3_97)" id="Ellipse 2">
              <circle cx="10.5" cy="10.5" fill="var(--fill-0, #37EBFF)" r="4.5" />
            </g>
            <circle cx="10.5" cy="10.5" fill="var(--fill-0, #37EBFF)" id="Ellipse 1" r="2.5" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="21" id="filter0_f_3_97" width="21" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_3_97" stdDeviation="3" />
            </filter>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function Dots1() {
  return (
    <motion.div variants={twinkleVariant(2.8, 0.3)} animate="animate" className="absolute left-[298.13px] size-[6.75px] top-[341.13px]" data-name="Dots">
      <div className="absolute inset-[-66.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.75 15.75">
          <g id="Dots">
            <g filter="url(#filter0_f_3_121)" id="Ellipse 2">
              <circle cx="7.875" cy="7.875" fill="var(--fill-0, #37EBFF)" r="3.375" />
            </g>
            <circle cx="7.875" cy="7.875" fill="var(--fill-0, #37EBFF)" id="Ellipse 1" r="1.875" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="15.75" id="filter0_f_3_121" width="15.75" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_3_121" stdDeviation="2.25" />
            </filter>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function Dots2() {
  return (
    <motion.div variants={twinkleVariant(4.2, 2.5)} animate="animate" className="absolute left-[739px] size-[6.75px] top-[339px]" data-name="Dots">
      <div className="absolute inset-[-66.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.75 15.75">
          <g id="Dots">
            <g filter="url(#filter0_f_3_121)" id="Ellipse 2">
              <circle cx="7.875" cy="7.875" fill="var(--fill-0, #37EBFF)" r="3.375" />
            </g>
            <circle cx="7.875" cy="7.875" fill="var(--fill-0, #37EBFF)" id="Ellipse 1" r="1.875" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="15.75" id="filter0_f_3_121" width="15.75" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_3_121" stdDeviation="2.25" />
            </filter>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function Dots3() {
  return (
    <motion.div variants={twinkleVariant(3.1, 1.8)} animate="animate" className="absolute left-[1144px] size-[6.75px] top-[417px]" data-name="Dots">
      <div className="absolute inset-[-66.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.75 15.75">
          <g id="Dots">
            <g filter="url(#filter0_f_3_121)" id="Ellipse 2">
              <circle cx="7.875" cy="7.875" fill="var(--fill-0, #37EBFF)" r="3.375" />
            </g>
            <circle cx="7.875" cy="7.875" fill="var(--fill-0, #37EBFF)" id="Ellipse 1" r="1.875" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="15.75" id="filter0_f_3_121" width="15.75" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_3_121" stdDeviation="2.25" />
            </filter>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function Dots4() {
  return (
    <motion.div variants={twinkleVariant(2.2, 0.8)} animate="animate" className="absolute left-[997px] size-[6.75px] top-[264px]" data-name="Dots">
      <div className="absolute inset-[-66.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.75 15.75">
          <g id="Dots">
            <g filter="url(#filter0_f_3_121)" id="Ellipse 2">
              <circle cx="7.875" cy="7.875" fill="var(--fill-0, #37EBFF)" r="3.375" />
            </g>
            <circle cx="7.875" cy="7.875" fill="var(--fill-0, #37EBFF)" id="Ellipse 1" r="1.875" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="15.75" id="filter0_f_3_121" width="15.75" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_3_121" stdDeviation="2.25" />
            </filter>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function Subheading() {
  return (
    <div className="contents font-['Alkatra',sans-serif] font-light leading-[normal] text-[27px] tracking-[1.08px]" data-name="Subheading">
      <p className="blur-[1.013px] text-[#37ebff]">Create a beautiful greeting for someone special.</p>
      <p className="absolute inset-0 text-white">Create a beautiful greeting for someone special.</p>
    </div>
  );
}

/* ── Animated Glass Border Container ── */
function GlassShieldContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-[520px] mx-auto px-4">
      {/* Outer wrapper for the animated border */}
      <div className="relative rounded-[20px] p-[1px]">
        {/* Rotating conic gradient for traveling glow */}
        <div
          className="absolute inset-[-2px] rounded-[20px] overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <div
            className="absolute inset-[-50%] w-[200%] h-[200%]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(55, 235, 255, 0.6) 78%, rgba(55, 235, 255, 0.9) 82%, rgba(55, 235, 255, 0.6) 86%, transparent 94%, transparent 100%)",
              animation: "border-glow-rotate 6s linear infinite",
            }}
          />
        </div>

        {/* Static subtle border */}
        <div
          className="absolute inset-0 rounded-[20px] border border-[#37EBFF]/[0.08]"
          style={{
            boxShadow:
              "0 0 15px rgba(55, 235, 255, 0.04), inset 0 0 15px rgba(55, 235, 255, 0.02)",
          }}
        />

        {/* Inner glass panel - overflow visible so dropdowns can extend outside */}
        <div
          className="relative rounded-[19px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(2, 17, 53, 0.92) 0%, rgba(2, 17, 53, 0.96) 50%, rgba(2, 17, 53, 0.92) 100%)",
            backdropFilter: "blur(24px)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(55, 235, 255, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
            zIndex: 1,
          }}
        >
          {/* Subtle inner glow at top edge */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(55, 235, 255, 0.15), transparent)",
            }}
          />
          <div className="relative z-10 px-8 py-12">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Custom Dropdown ── */
function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-white/[0.04] backdrop-blur-sm border rounded-xl px-5 py-4 font-['Alkatra',sans-serif] text-[16px] tracking-wide outline-none cursor-pointer transition-all duration-300 ${
          isOpen
            ? "border-[#37EBFF]/40 shadow-[0_0_12px_rgba(55,235,255,0.1)]"
            : "border-white/[0.08] hover:border-white/[0.15]"
        } ${value ? "text-white" : "text-white/35"}`}
      >
        {value || placeholder}
        {/* Arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="white"
              strokeOpacity={isOpen ? "0.7" : "0.35"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>
      </button>

      {/* Options panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            background:
              "linear-gradient(135deg, rgba(2, 17, 53, 0.95) 0%, rgba(5, 22, 62, 0.97) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(55, 235, 255, 0.1)",
            boxShadow:
              "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(55, 235, 255, 0.05)",
          }}
        >
          <div className="py-2 max-h-[240px] overflow-y-auto scrollbar-thin">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3 font-['Alkatra',sans-serif] text-[15px] tracking-wide transition-all duration-200 cursor-pointer ${
                  value === option
                    ? "text-[#37EBFF] bg-[#37EBFF]/[0.08]"
                    : "text-white/70 hover:text-white hover:bg-[#37EBFF]/[0.06]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── Occasion-themed floating elements for button hover ── */
const loveFloaters = [
  { emoji: "❤️", size: 22, top: "8%", left: "6%", opacity: 0.9, delay: 0 },
  { emoji: "💕", size: 14, top: "60%", left: "12%", opacity: 0.6, delay: 0.08 },
  { emoji: "❤️", size: 10, top: "25%", left: "78%", opacity: 0.5, delay: 0.15 },
  { emoji: "💗", size: 18, top: "55%", left: "85%", opacity: 0.75, delay: 0.05 },
  { emoji: "❤️", size: 12, top: "15%", left: "42%", opacity: 0.4, delay: 0.12 },
  { emoji: "💕", size: 16, top: "70%", left: "55%", opacity: 0.65, delay: 0.1 },
  { emoji: "❤️", size: 8, top: "40%", left: "92%", opacity: 0.35, delay: 0.18 },
  { emoji: "💗", size: 20, top: "75%", left: "25%", opacity: 0.7, delay: 0.03 },
  { emoji: "❤️", size: 11, top: "10%", left: "65%", opacity: 0.45, delay: 0.14 },
];

const birthdayFloaters = [
  { emoji: "🎉", size: 20, top: "10%", left: "8%", opacity: 0.9, delay: 0 },
  { emoji: "🎊", size: 14, top: "65%", left: "15%", opacity: 0.6, delay: 0.08 },
  { emoji: "🎉", size: 10, top: "20%", left: "80%", opacity: 0.5, delay: 0.15 },
  { emoji: "🎊", size: 18, top: "50%", left: "88%", opacity: 0.75, delay: 0.05 },
  { emoji: "🎉", size: 12, top: "30%", left: "45%", opacity: 0.4, delay: 0.12 },
  { emoji: "🎊", size: 16, top: "72%", left: "58%", opacity: 0.65, delay: 0.1 },
  { emoji: "🎉", size: 8, top: "42%", left: "93%", opacity: 0.35, delay: 0.18 },
  { emoji: "🎊", size: 19, top: "78%", left: "28%", opacity: 0.7, delay: 0.03 },
  { emoji: "🎉", size: 11, top: "8%", left: "62%", opacity: 0.45, delay: 0.14 },
];

const fireworksFloaters = [
  { emoji: "🎆", size: 22, top: "5%", left: "7%", opacity: 0.9, delay: 0 },
  { emoji: "🎇", size: 14, top: "62%", left: "14%", opacity: 0.6, delay: 0.08 },
  { emoji: "🎆", size: 10, top: "22%", left: "82%", opacity: 0.5, delay: 0.15 },
  { emoji: "🎇", size: 18, top: "52%", left: "86%", opacity: 0.75, delay: 0.05 },
  { emoji: "🎆", size: 12, top: "18%", left: "48%", opacity: 0.4, delay: 0.12 },
  { emoji: "🎇", size: 16, top: "68%", left: "52%", opacity: 0.65, delay: 0.1 },
  { emoji: "🎆", size: 8, top: "38%", left: "94%", opacity: 0.35, delay: 0.18 },
  { emoji: "🎇", size: 20, top: "76%", left: "30%", opacity: 0.7, delay: 0.03 },
  { emoji: "🎆", size: 11, top: "12%", left: "68%", opacity: 0.45, delay: 0.14 },
];

function getOccasionEmoji(occasion: string): string {
  switch (occasion) {
    case "Birthday": return "🎂";
    case "Valentine's Day":
    case "Anniversary": return "❤️";
    case "New Year": return "🎆";
    default: return "✨";
  }
}

function getOccasionFloaters(occasion: string) {
  switch (occasion) {
    case "Valentine's Day":
    case "Anniversary": return loveFloaters;
    case "Birthday": return birthdayFloaters;
    case "New Year": return fireworksFloaters;
    default: return [];
  }
}

function getHoverBackground(occasion: string) {
  switch (occasion) {
    case "Valentine's Day":
    case "Anniversary":
      return "linear-gradient(135deg, rgba(60, 10, 20, 0.85) 0%, rgba(40, 5, 15, 0.92) 100%)";
    case "Birthday":
      return "linear-gradient(135deg, rgba(50, 20, 60, 0.85) 0%, rgba(30, 10, 45, 0.92) 100%)";
    case "New Year":
      return "linear-gradient(135deg, rgba(10, 20, 55, 0.85) 0%, rgba(5, 10, 40, 0.92) 100%)";
    default:
      return "linear-gradient(135deg, rgba(2, 17, 53, 0.85) 0%, rgba(2, 12, 40, 0.92) 100%)";
  }
}

function getHoverBorder(occasion: string) {
  switch (occasion) {
    case "Valentine's Day":
    case "Anniversary":
      return "1px solid rgba(255, 80, 120, 0.35)";
    case "Birthday":
      return "1px solid rgba(200, 100, 255, 0.35)";
    case "New Year":
      return "1px solid rgba(255, 200, 50, 0.35)";
    default:
      return "1px solid rgba(55, 235, 255, 0.35)";
  }
}

function getHoverGlow(occasion: string) {
  switch (occasion) {
    case "Valentine's Day":
    case "Anniversary":
      return "0 0 28px rgba(255, 80, 120, 0.12), inset 0 0 20px rgba(255, 80, 120, 0.04)";
    case "Birthday":
      return "0 0 28px rgba(200, 100, 255, 0.12), inset 0 0 20px rgba(200, 100, 255, 0.04)";
    case "New Year":
      return "0 0 28px rgba(255, 200, 50, 0.12), inset 0 0 20px rgba(255, 200, 50, 0.04)";
    default:
      return "0 0 28px rgba(55, 235, 255, 0.1), inset 0 0 20px rgba(55, 235, 255, 0.04)";
  }
}

/* ── Occasion Button ── */
function OccasionButton({ occasion, onClick }: { occasion: string; onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const emoji = getOccasionEmoji(occasion);
  const floaters = getOccasionFloaters(occasion);
  const hasTheme = floaters.length > 0;

  return (
    <button
      className="w-full relative overflow-hidden rounded-xl py-4 px-8 font-['Alkatra',sans-serif] text-[17px] tracking-wide text-white cursor-pointer active:scale-[0.98] mt-2 transition-all duration-300"
      style={{
        background: isHovered && hasTheme
          ? getHoverBackground(occasion)
          : "linear-gradient(135deg, rgba(55, 235, 255, 0.12) 0%, rgba(55, 235, 255, 0.06) 100%)",
        border: isHovered && hasTheme
          ? getHoverBorder(occasion)
          : "1px solid rgba(55, 235, 255, 0.2)",
        boxShadow: isHovered && hasTheme
          ? getHoverGlow(occasion)
          : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Themed floating emojis on hover */}
      {floaters.map((f, i) => (
        <motion.span
          key={`${occasion}-${i}`}
          className="absolute pointer-events-none select-none"
          style={{
            top: f.top,
            left: f.left,
            fontSize: `${f.size}px`,
            lineHeight: 1,
            zIndex: f.size > 15 ? 0 : 1,
            filter: f.size < 12 ? "blur(0.5px)" : "none",
          }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={
            isHovered
              ? { opacity: f.opacity, scale: 1, y: [0, -3, 0] }
              : { opacity: 0, scale: 0.3 }
          }
          transition={{
            opacity: { duration: 0.3, delay: f.delay },
            scale: { duration: 0.4, delay: f.delay, ease: "backOut" },
            y: { duration: 2.5, delay: f.delay + 0.3, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {f.emoji}
        </motion.span>
      ))}

      {/* Button text */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        <span>Create Your Wish</span>
        <motion.span
          key={emoji}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "backOut" }}
        >
          {emoji}
        </motion.span>
      </span>
    </button>
  );
}

/* ── Wish Form ── */
function WishForm() {
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [relationship, setRelationship] = useState("");
  const navigate = useNavigate();

  const occasions = [
    "Birthday",
    "Anniversary",
    "Valentine's Day",
    "New Year",
  ];

  const relationships = [
    "Special Person",
    "Friend",
    "Lover",
    "Family",
  ];

  return (
    <GlassShieldContainer>
      <div className="flex flex-col items-center gap-7 w-full">
        {/* Section label */}
        <p className="font-['Alkatra',sans-serif] font-light text-[14px] tracking-[2px] text-[#37EBFF]/50 uppercase">
          Create your greeting
        </p>

        {/* Name Input */}
        <div className="w-full">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter their name..."
            className="w-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl px-5 py-4 text-white placeholder-white/35 font-['Alkatra',sans-serif] text-[16px] tracking-wide outline-none transition-all duration-300 focus:border-[#37EBFF]/40 focus:shadow-[0_0_12px_rgba(55,235,255,0.1)] hover:border-white/[0.15] caret-[#37EBFF]"
          />
        </div>

        {/* Custom Occasion Dropdown */}
        <CustomDropdown
          value={occasion}
          onChange={setOccasion}
          options={occasions}
          placeholder="Choose an occasion..."
        />

        {/* Relationship Dropdown */}
        <CustomDropdown
          value={relationship}
          onChange={setRelationship}
          options={relationships}
          placeholder="Relationship with them..."
        />

        {/* Occasion-themed Create Wish Button */}
        <OccasionButton
          occasion={occasion}
          onClick={() => {
            if (name && occasion && relationship) {
              navigate("/wish", {
                state: { name, occasion, relationship },
              });
            }
          }}
        />
      </div>
    </GlassShieldContainer>
  );
}

export default function Desktop() {
  const navigate = useNavigate();

  // If a gift link is opened at root (e.g. ?gift=...), navigate directly to /wish
  useEffect(() => {
    let gift: string | null = null;
    if (typeof window !== "undefined") {
      gift = new URLSearchParams(window.location.search).get("gift");
      if (!gift && window.location.hash.includes("?")) {
        const hashQuery = window.location.hash.substring(window.location.hash.indexOf("?"));
        gift = new URLSearchParams(hashQuery).get("gift");
      }
    }
    if (gift) {
      navigate(`/wish?gift=${gift}`, { replace: true });
    }
  }, [navigate]);

  // Animation phases:
  // 0 = initial (everything hidden)
  // 1 = heading fades in centered
  // 2 = subtitle fades in
  // 3 = heading moves to top-center navbar, subtitle fades out
  // 4 = form fades in
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 1: Heading appears at 1.5s
    const t1 = setTimeout(() => setPhase(1), 1500);
    // Phase 2: Subtitle appears at 2.6s
    const t2 = setTimeout(() => setPhase(2), 2600);
    // Phase 3: Transition at 4.7s (1.5s after subtitle is fully visible at ~3.2s)
    const t3 = setTimeout(() => setPhase(3), 4700);
    // Phase 4: Form appears at 5.5s (after 800ms heading transition)
    const t4 = setTimeout(() => setPhase(4), 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="bg-[#021135] relative w-full h-screen overflow-hidden" data-name="Desktop - 1">
      <Group />
      <Stars />
      <Stars1 />
      <Stars2 />
      <Stars3 />
      <Dots />
      <Dots1 />
      <Dots2 />
      <Dots3 />
      <Dots4 />

      {/* Subtitle - fades in at phase 2, fades out at phase 3 */}
      <motion.div
        className="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={
          phase >= 3
            ? { opacity: 0, y: -10 }
            : phase >= 2
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 15 }
        }
        transition={{
          duration: phase >= 3 ? 0.6 : 0.6,
          ease: "easeInOut",
        }}
      >
        <div className="absolute top-[559.5px] left-[calc(50%-289.38px)] font-['Alkatra',sans-serif] font-light leading-[normal] text-[27px] tracking-[1.08px]">
          <p className="blur-[1.013px] text-[#37ebff]">Create a beautiful greeting for someone special.</p>
          <p className="absolute inset-0 text-white">Create a beautiful greeting for someone special.</p>
        </div>
      </motion.div>

      {/* Heading - fades in centered, then moves to top-center navbar at 48px */}
      <motion.div
        className="absolute z-20"
        style={{
          left: "50%",
          x: "-50%",
        }}
        initial={{ opacity: 0, y: 20, top: "calc(50% - 100px)", scale: 1 }}
        animate={
          phase >= 3
            ? {
                opacity: 1,
                y: 0,
                top: "20px",
                scale: 0.25,
              }
            : phase >= 1
            ? { opacity: 1, y: 0, top: "calc(50% - 100px)", scale: 1 }
            : { opacity: 0, y: 20, top: "calc(50% - 100px)", scale: 1 }
        }
        transition={{
          duration: phase >= 3 ? 0.8 : 0.8,
          ease: [0.42, 0, 0.58, 1],
        }}
      >
        <motion.div
          className="origin-center"
          animate={
            phase >= 3
              ? { rotate: 0 }
              : { rotate: -9.39 }
          }
          transition={{
            duration: 0.8,
            ease: [0.42, 0, 0.58, 1],
          }}
        >
          <p className="font-['Alex_Brush',cursive] leading-[normal] not-italic text-[192px] text-white whitespace-nowrap">
            Make a wish
          </p>
        </motion.div>
      </motion.div>

      {/* Thin decorative navbar line - appears with the heading at navbar */}
      <motion.div
        className="absolute top-[68px] left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={
          phase >= 3
            ? { opacity: 1, scaleX: 1 }
            : { opacity: 0, scaleX: 0 }
        }
        transition={{ duration: 0.8, delay: phase >= 3 ? 0.2 : 0, ease: "easeInOut" }}
      >
        <div className="w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[#37EBFF]/30 to-transparent" />
      </motion.div>

      {/* Form section - slides up and fades in at phase 4 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-30 pt-24"
        initial={{ opacity: 0, y: 40 }}
        animate={
          phase >= 4
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 40 }
        }
        transition={{
          duration: 0.8,
          ease: [0.42, 0, 0.58, 1],
        }}
      >
        <WishForm />
      </motion.div>
    </div>
  );
}