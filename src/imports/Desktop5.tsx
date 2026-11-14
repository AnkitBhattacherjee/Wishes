import imgImage12 from "figma:asset/00a3ce5135a67af3d3175b98b5b841d2758a002f.png";
import imgFrame7 from "figma:asset/496ee3aecb1283c70c429b3c6e4e53ac5331d1d3.png";
import imgImage11 from "figma:asset/22b16361891ad69efbdf183da5ef0b60d80e5441.png";
import imgImage13 from "figma:asset/cf4647d889a50c00cb73fe5b89dfc4cc77e8edf0.png";
import imgImage14 from "figma:asset/552b261f426c4f8c5e7b982a302bcb624226c573.png";

function Frame() {
  return <div className="absolute bg-white h-[184px] left-[64px] rounded-[16px] top-[98px] w-[258px]" />;
}

function Frame2() {
  return (
    <div className="absolute h-[184px] left-[64px] rounded-[16px] top-[98px] w-[258px]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[16px]">
        <img alt="" className="absolute h-[117.39%] left-[-12.87%] max-w-none top-[-4.97%] w-[125.58%]" src={imgFrame7} />
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[64px] top-[98px]">
      <Frame />
      <Frame2 />
    </div>
  );
}

function Frame1() {
  return <div className="absolute bg-white h-[184px] left-[346px] rounded-[16px] top-[98px] w-[258px]" />;
}

function Frame3() {
  return (
    <div className="absolute h-[184px] left-[346px] overflow-clip rounded-[16px] top-[98px] w-[258px]">
      <div className="absolute left-0 size-[258px] top-[-34px]" data-name="image 11">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[16.67%] max-w-none top-[8.77%] w-[66.67%]" src={imgImage11} />
        </div>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[346px] top-[98px]">
      <Frame1 />
      <Frame3 />
    </div>
  );
}

function Frame5() {
  return <div className="absolute bg-white h-[184px] left-[628px] rounded-[16px] top-[98px] w-[258px]" />;
}

function Frame6() {
  return (
    <div className="absolute h-[184px] left-[628px] overflow-clip rounded-[16px] top-[98px] w-[258px]">
      <div className="absolute left-0 size-[258px] top-[-34px]" data-name="image 11">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[86.05%] left-[-14.37%] max-w-none top-[7.07%] w-[129.07%]" src={imgImage13} />
        </div>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[628px] top-[98px]">
      <Frame5 />
      <Frame6 />
    </div>
  );
}

function Frame7() {
  return <div className="absolute bg-white h-[184px] left-[910px] rounded-[16px] top-[98px] w-[258px]" />;
}

function Frame8() {
  return (
    <div className="absolute h-[184px] left-[910px] overflow-clip rounded-[16px] top-[98px] w-[258px]">
      <div className="absolute h-[263px] left-0 top-[-34px] w-[258px]" data-name="image 11">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[76.36%] left-[-10.62%] max-w-none top-[12.09%] w-[116.76%]" src={imgImage14} />
        </div>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[910px] top-[98px]">
      <Frame7 />
      <Frame8 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute bg-[rgba(2,17,53,0.5)] h-[328px] left-0 overflow-clip rounded-tl-[16px] rounded-tr-[16px] top-[696px] w-[1440px]">
      <Group />
      <Group1 />
      <Group2 />
      <Group3 />
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[normal] left-[63px] not-italic text-[24px] text-white top-[30px]">Choose Cake</p>
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="bg-black relative size-full" data-name="Desktop - 5">
      <div className="-translate-x-1/2 absolute h-[1165px] left-[calc(50%+63.5px)] top-0 w-[1747px]" data-name="image 12">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage12} />
      </div>
      <Frame4 />
    </div>
  );
}