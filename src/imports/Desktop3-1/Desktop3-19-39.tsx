import imgWoodenTable from "./a8965c19509cbe3d414f37b2897af043cac1a180.png";
import imgChatGptImageMar22026014233Pm1 from "./53d3640202fee41fc49435adadaf40ec5c1b091b.png";

export default function Desktop() {
  return (
    <div className="relative size-full" data-name="Desktop - 3">
      <div className="-translate-x-1/2 absolute h-[1024px] left-[calc(50%-0.5px)] top-0 w-[1793px]" data-name="Wooden Table">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgWoodenTable} />
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[818px] left-[calc(50%-0.5px)] top-[calc(50%+78px)] w-[747px]" data-name="ChatGPT Image Mar 2, 2026, 01_42_33 PM 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[136.9%] left-0 max-w-none top-[-19.25%] w-full" src={imgChatGptImageMar22026014233Pm1} />
        </div>
      </div>
      <p className="absolute font-['Instrument_Serif:Regular',sans-serif] leading-[normal] left-[calc(50%-517px)] not-italic text-[64px] text-white top-[91px] tracking-[2.56px] whitespace-nowrap">Share your memories with someone special</p>
    </div>
  );
}