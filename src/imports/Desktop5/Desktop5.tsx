import svgPaths from "./svg-f291molzrm";
import imgImage122 from "./0bd4e23f24a646a01f3e77b7524de44c008be2ab.png";

function Frame2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#e2effb] left-1/2 overflow-clip rounded-[82px] size-[148px] top-1/2">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[135px] left-[calc(50%-0.5px)] top-[calc(50%+0.5px)] w-[203px]" data-name="image 122">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage122} />
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="-translate-x-1/2 absolute bg-white left-[calc(50%+0.5px)] overflow-clip rounded-[82px] size-[164px] top-[-82px]">
      <Frame2 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[34.38%_3.82%_34.38%_92.75%]" data-name="Group">
      <div className="absolute inset-[-3.75%_-4.17%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.5 21.5">
          <g id="Group">
            <path d={svgPaths.p197ce900} id="Vector" stroke="var(--stroke-0, black)" strokeWidth="1.5" />
            <path d={svgPaths.p2b5baa80} id="Vector_2" opacity="0.5" stroke="var(--stroke-0, black)" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[#e2effb] h-[64px] left-[87px] overflow-clip rounded-[12px] top-[286px] w-[524px]">
      <Group />
    </div>
  );
}

function Frame() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white h-[442px] left-[calc(50%-0.5px)] rounded-[32px] top-1/2 w-[699px]">
      <Frame1 />
      <p className="absolute font-['Instrument_Serif:Regular',sans-serif] leading-[normal] left-[calc(50%-262.5px)] not-italic text-[48px] text-black top-[103px] tracking-[0.96px] whitespace-nowrap">Share with your special person</p>
      <p className="absolute font-['Instrument_Serif:Regular',sans-serif] leading-[normal] left-[calc(50%-262.5px)] not-italic text-[24px] text-black top-[239px] whitespace-nowrap">Share your link:</p>
      <p className="absolute font-['Instrument_Sans:Regular',sans-serif] font-normal leading-[normal] left-[calc(50%-193.5px)] text-[24px] text-black top-[177px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Share what words alone can’t say ✨
      </p>
      <Frame3 />
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="relative size-full" data-name="Desktop - 5">
      <Frame />
    </div>
  );
}