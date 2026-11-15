import React, { ReactNode } from 'react';
import imgVector34 from "../../../imports/Frame90/ddb83e26ed11db396dde558aa4b1aaed2e97ad79.png";
import imgImage61 from "../../../imports/Frame90/00fbc8a37aa498843ddd68b8b6ef6e07e2509ada.png";
import { imgImage60 } from "../../../imports/Frame90/svg-hrm0v";

interface DiaryContainerProps {
  children: ReactNode;
}

export function DiaryContainer({ children }: DiaryContainerProps) {
  return (
    <div className="relative w-[1243px] h-[872px] scale-[0.3] origin-center sm:scale-[0.425] md:scale-[0.51] lg:scale-[0.66] xl:scale-[0.82] transition-transform">
      <div className="absolute h-[226.302px] left-[-150px] top-[350.11px] w-[156.201px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="226.302" src={imgVector34} width="156.201" />
      </div>
      <div className="absolute left-[-150px] top-[-17px]">
        <div className="absolute contents left-[137.06px] top-0" data-name="Mask group">
          <div 
            className="absolute left-[39.48px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[84.16px_303.097px] mask-size-[1299.195px_932.243px] pointer-events-none size-[1427.335px] top-[-316.65px]" 
            style={{ maskImage: `url('${imgImage60}')` }} 
            data-name="image 60"
          >
            <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgImage61} />
            <div aria-hidden="true" className="absolute inset-[-4.305px] rounded-[12px] border-[8.61px] border-solid border-[#f3d5df]/80 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.7),0_8px_24px_rgba(102,54,70,0.16)]" />
          </div>
        </div>
      </div>
      <div className="absolute bg-white h-[872.473px] left-[0px] rounded-[3.827px] top-[0px] w-[1243.657px]">
        <div className="absolute bg-black h-[871.516px] left-[519.46px] top-[0.96px] w-[217.162px] z-0 pointer-events-none" />
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
