import imgFrame7 from "figma:asset/7641e547478b00feb05d8d8fd68c9dbd92ef0ef4.png";
import imgImage11 from "figma:asset/0656e39fe206b830e6fe641e05e8bdd2685e287b.png";
import imgImage12 from "figma:asset/59c91e01e7892ce1c865aa061b9eb3f9c28544eb.png";
import imgImage13 from "figma:asset/588be5ca97cfd2bb153f4c00c24c3acce5c0418f.png";

function Frame() {
  return <div className="absolute bg-[#313642] h-[184px] left-[64px] rounded-[16px] top-[294px] w-[258px]" />;
}

function Frame2() {
  return (
    <div className="absolute h-[184px] left-[64px] rounded-[16px] top-[294px] w-[258px]">
      <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[16px] size-full" src={imgFrame7} />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[64px] top-[294px]">
      <Frame />
      <Frame2 />
    </div>
  );
}

function Frame1() {
  return <div className="absolute bg-[#313642] h-[184px] left-[346px] rounded-[16px] top-[294px] w-[258px]" />;
}

function Frame3() {
  return (
    <div className="absolute h-[184px] left-[346px] overflow-clip rounded-[16px] top-[294px] w-[258px]">
      <div className="absolute left-0 size-[258px] top-[-34px]" data-name="image 11">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage11} />
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[346px] top-[294px]">
      <Frame1 />
      <Frame3 />
    </div>
  );
}

function Frame4() {
  return <div className="absolute bg-[#313642] h-[184px] left-[628px] rounded-[16px] top-[294px] w-[258px]" />;
}

function Frame5() {
  return (
    <div className="absolute h-[184px] left-[628px] overflow-clip rounded-[16px] top-[294px] w-[258px]">
      <div className="absolute left-0 size-[258px] top-[-34px]" data-name="image 11">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgImage12} />
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[628px] top-[294px]">
      <Frame4 />
      <Frame5 />
    </div>
  );
}

function Frame6() {
  return <div className="absolute bg-[#313642] h-[184px] left-[910px] rounded-[16px] top-[294px] w-[258px]" />;
}

function Frame7() {
  return (
    <div className="absolute h-[184px] left-[910px] overflow-clip rounded-[16px] top-[294px] w-[258px]">
      <div className="absolute left-0 size-[258px] top-[-34px]" data-name="image 11">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage13} />
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[910px] top-[294px]">
      <Frame6 />
      <Frame7 />
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="bg-black relative size-full" data-name="Desktop - 4">
      <Group />
      <Group1 />
      <Group2 />
      <Group3 />
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[normal] left-[63px] not-italic text-[24px] text-white top-[226px]">Choose Happy Birthday Style</p>
    </div>
  );
}