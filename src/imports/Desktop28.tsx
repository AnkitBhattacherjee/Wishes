import imgFrame11 from "figma:asset/ece298d0ec2c16f10310d45724b276a6035cb503.png";
import imgChatGptImageMar22026055038Pm1 from "figma:asset/d7ec50930abbaa14ad6b8579dc708351382f32f7.png";

function Frame1() {
  return (
    <div className="absolute h-[337px] left-[70px] top-[8px] w-[347px]">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFrame11} />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute h-[345px] left-[847px] top-[69px] w-[276px]">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFrame11} />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute h-[296px] left-[641px] top-[59px] w-[206px]">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFrame11} />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute h-[348.276px] left-[5.62px] top-[395.63px] w-[293.754px]">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFrame11} />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute h-[324px] left-[853px] top-[466px] w-[291px]">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFrame11} />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute bg-[#e3e4e3] h-[797px] left-[155px] overflow-clip top-[122px] w-[1167px]">
      <Frame1 />
      <Frame2 />
      <Frame5 />
      <Frame3 />
      <Frame4 />
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="bg-[#fff4fe] relative size-full" data-name="Desktop - 28">
      <Frame />
      <div className="absolute flex h-[1122.952px] items-center justify-center left-[-80.06px] top-[-49.48px] w-[1600.115px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "22" } as React.CSSProperties}>
        <div className="flex-none rotate-[3.78deg]">
          <div className="h-[1024px] relative w-[1536px]" data-name="ChatGPT Image Mar 2, 2026, 05_50_38 PM 1">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgChatGptImageMar22026055038Pm1} />
          </div>
        </div>
      </div>
    </div>
  );
}