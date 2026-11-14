function Frame1() {
  return (
    <div className="absolute bg-[#e25a7e] content-stretch flex items-center justify-center left-[713px] overflow-clip px-[48px] py-[16px] rounded-[16px] top-[669px]">
      <p className="capitalize font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[24px] text-white whitespace-nowrap">Done</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#d9d9d9] content-stretch flex flex-col items-center justify-center left-[calc(50%-194.5px)] p-[10px] rounded-[24px] size-[40px] top-1/2">
      <p className="capitalize font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[24px] text-black whitespace-nowrap">+</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#d9d9d9] content-stretch flex flex-col items-center justify-center left-[calc(50%+203.5px)] p-[10px] rounded-[24px] size-[40px] top-1/2">
      <p className="capitalize font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[24px] text-black whitespace-nowrap">-</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-[#e2effb] h-[60px] left-[86px] overflow-clip rounded-[18px] top-[670px] w-[549px]">
      <div className="-translate-x-1/2 absolute h-0 left-[calc(50%-0.5px)] top-[30px] w-[320px]">
        <div className="absolute inset-[-2px_-0.63%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 324 4">
            <path d="M2 2H322" id="Line 9" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="4" />
          </svg>
        </div>
      </div>
      <div className="absolute left-[125px] size-[24px] top-[18px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" fill="var(--fill-0, #FF0070)" id="Ellipse 10" r="12" />
        </svg>
      </div>
      <Frame3 />
      <Frame4 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="-translate-x-1/2 absolute h-[530px] left-1/2 top-[87px] w-[830px]">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 830 530">
        <g id="Frame 108">
          <g id="Frame 107">
            <g clipPath="url(#clip0_23_346)">
              <line id="Line 10" stroke="var(--stroke-0, black)" x1="12.9844" x2="820.015" y1="181.098" y2="181.098" />
              <line id="Line 11" stroke="var(--stroke-0, black)" x1="12.9844" x2="820.015" y1="361.098" y2="361.098" />
            </g>
            <rect height="509" stroke="var(--stroke-0, black)" width="809" x="10.5" y="10.5" />
          </g>
          <line id="Line 12" stroke="var(--stroke-0, black)" x1="271.5" x2="271.5" y1="520.07" y2="9.92917" />
          <line id="Line 13" stroke="var(--stroke-0, black)" x1="557.5" x2="557.5" y1="520.07" y2="9.92917" />
          <circle cx="820" cy="10" fill="var(--fill-0, #4A4A4A)" id="Ellipse 11" r="10" />
          <circle cx="10" cy="10" fill="var(--fill-0, #4A4A4A)" id="Ellipse 13" r="10" />
          <circle cx="820" cy="520" fill="var(--fill-0, #4A4A4A)" id="Ellipse 12" r="10" />
          <circle cx="10" cy="520" fill="var(--fill-0, #4A4A4A)" id="Ellipse 14" r="10" />
        </g>
        <defs>
          <clipPath id="clip0_23_346">
            <rect fill="white" height="510" width="810" x="10" y="10" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white h-[764px] left-1/2 overflow-clip rounded-[32px] top-1/2 w-[974px]">
      <Frame1 />
      <Frame2 />
      <Frame5 />
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="relative size-full" data-name="Desktop - 4">
      <Frame />
    </div>
  );
}