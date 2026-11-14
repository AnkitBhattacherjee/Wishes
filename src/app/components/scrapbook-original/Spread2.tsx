import React from 'react';
import imgImage68 from "../../../imports/Desktop1/96e0121d6f67722e27074a45cb356a53908b5e96.png";
import imgImage86 from "../../../imports/Desktop1/6b32c493cebc0f086e0a5454f3ecef5816f3fc78.png";
import imgImage81 from "../../../imports/Desktop1/905920a2a421690fe92706dac39d1fb1159215fc.png";
import imgImage113 from "../../../imports/Desktop1/b996df98d62ded9811bf44adaa48c0ecec2e0b17.png";
import imgImage70 from "../../../imports/Desktop1/b6be25e4156c55d80f15742e24537bc295cb2060.png";
import imgImage72 from "../../../imports/Desktop1/cf52bcb79eeddb7b365dffea293f3ae60516c210.png";
import { EditableImage } from './EditableImage';
import { EditableText } from './EditableText';
import { DraggableSticker } from './DraggableSticker';
import { SpreadData } from './Spread1';

interface SpreadProps {
  data: SpreadData;
  onUpdate: (key: string, val: string) => void;
  isViewerMode?: boolean;
}

export function Spread2({ data = {}, onUpdate, isViewerMode }: SpreadProps) {
  return (
    <div className="w-full h-full relative flex" style={{ transformStyle: 'preserve-3d' }}>
      <div className="absolute h-[872.477px] left-0 top-0 w-[615.134px]">
        <div className="bg-white h-[872.477px] overflow-visible relative w-[615.134px] rounded-l-[3.827px]" data-name="Bakpage">
          <div className="absolute flex h-[316.184px] items-center justify-center left-[165.09px] top-[453.53px] w-[377.373px]">
            <div className="flex-none rotate-[3.8deg]">
              <EditableImage className="bg-[#ffeaa5] h-[293.064px] rounded-[11.48px] w-[358.749px]" defaultColor="#ffeaa5" imageUrl={data.left_yellow} onImageUpload={(url) => onUpdate('left_yellow', url)} isViewerMode={isViewerMode} />
            </div>
          </div>
          <div className="absolute flex h-[330.281px] items-center justify-center left-[41.66px] top-[46.92px] w-[387.383px]">
            <div className="flex-none rotate-[-5.89deg]">
              <EditableImage className="bg-[#ffccd2] h-[295.012px] rounded-[11.48px] w-[359.017px]" defaultColor="#ffccd2" imageUrl={data.left_pink} onImageUpload={(url) => onUpdate('left_pink', url)} isViewerMode={isViewerMode} />
            </div>
          </div>
          
          <div className="absolute left-[247.78px] top-[740.46px]">
            <EditableText className="min-h-[60px] w-[200px]" defaultBgColor="#feffeb" textColor="#007ac5" text={data.left_text_blue} onChange={(val) => onUpdate('left_text_blue', val)} isViewerMode={isViewerMode} />
          </div>
          <div className="absolute left-[152.11px] top-[348.23px]">
            <EditableText className="min-h-[60px] w-[200px]" defaultBgColor="#e8ffff" textColor="#be2e2e" text={data.left_text_red} onChange={(val) => onUpdate('left_text_red', val)} isViewerMode={isViewerMode} />
          </div>
          
          <DraggableSticker className="flex h-[195.183px] items-center justify-center left-[6.77px] top-[212.85px] w-[113.71px]">
            <div className="flex-none rotate-[4.11deg]"><div className="h-[188.463px] relative w-[100.45px]" data-name="image 68"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[114.54%] left-[-27.03%] max-w-none top-[-4.85%] w-[143.42%]" src={imgImage68} /></div></div></div>
          </DraggableSticker>
          <DraggableSticker className="flex h-[164.048px] items-center justify-center left-[462.87px] top-[687.84px] w-[158.965px]">
            <div className="flex-none rotate-[17.38deg]"><div className="h-[132.768px] relative w-[125.015px]" data-name="image 86"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[106.78%] left-[-36.54%] max-w-none top-0 w-[170.1%]" src={imgImage86} /></div></div></div>
          </DraggableSticker>
          <DraggableSticker className="flex h-[273.627px] items-center justify-center left-[508.47px] top-0 w-[68.395px]">
            <div className="flex-none rotate-[89.09deg]"><div className="h-[64.096px] relative w-[272.649px]" data-name="image 81"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[806.3%] left-[-121.76%] max-w-none top-[-348.51%] w-[285.5%]" src={imgImage81} /></div></div></div>
          </DraggableSticker>
        </div>
      </div>
      <div className="absolute flex h-[872.477px] items-center justify-center right-0 top-0 w-[615.392px]">
        <div className="absolute flex h-[872.477px] items-center justify-center right-[0.26px] top-0 w-[615.134px]">
          <div className="bg-white h-[872.477px] overflow-visible relative w-[615.134px] rounded-r-[3.827px]" data-name="Bakpage">
            <div className="absolute flex h-[318.719px] items-center justify-center left-[165.09px] top-[453.53px] w-[415.564px]">
              <div className="flex-none rotate-[3.8deg]">
                <EditableImage className="bg-[#ffeaa5] h-[293.064px] rounded-[11.48px] w-[397.024px]" defaultColor="#ffeaa5" imageUrl={data.right_bottom_yellow} onImageUpload={(url) => onUpdate('right_bottom_yellow', url)} isViewerMode={isViewerMode} />
              </div>
            </div>
            <div className="absolute flex h-[318.532px] items-center justify-center left-[46.31px] top-[52.8px] w-[378.079px]">
              <div className="flex-none rotate-[-3.86deg]">
                <EditableImage className="bg-[#ffccd2] h-[295.012px] rounded-[11.48px] w-[359.017px]" defaultColor="#ffccd2" imageUrl={data.right_top_pink} onImageUpload={(url) => onUpdate('right_top_pink', url)} isViewerMode={isViewerMode} />
              </div>
            </div>
            <DraggableSticker className="flex h-[103.418px] items-center justify-center left-[17.67px] top-[23.94px] w-[157.998px]">
              <div className="flex-none rotate-[-4.53deg]">
                <div className="h-[91.771px] relative w-[151.229px]" data-name="image 113">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[185.92%] left-[-36.75%] max-w-none top-[-26.76%] w-[169.23%]" src={imgImage113} />
                  </div>
                </div>
              </div>
            </DraggableSticker>
            <div className="absolute flex h-[286.547px] items-center justify-center left-[347.78px] top-[95.51px] w-[242.076px]">
              <div className="flex-none rotate-7">
                <EditableImage className="bg-[#ffeaa5] h-[262.713px] rounded-[7.653px] w-[211.637px]" defaultColor="#ffeaa5" imageUrl={data.right_top_yellow} onImageUpload={(url) => onUpdate('right_top_yellow', url)} isViewerMode={isViewerMode} />
              </div>
            </div>
            
            <div className="absolute left-[144.2px] top-[354.92px]">
              <EditableText className="min-h-[60px] w-[200px]" defaultBgColor="#fff9e7" textColor="#7ac500" text={data.right_text_green} onChange={(val) => onUpdate('right_text_green', val)} isViewerMode={isViewerMode} />
            </div>
            <div className="absolute left-[268.57px] top-[747.15px]">
              <EditableText className="min-h-[60px] w-[200px]" defaultBgColor="#fff3f4" textColor="#0080c5" text={data.right_text_blue} onChange={(val) => onUpdate('right_text_blue', val)} isViewerMode={isViewerMode} />
            </div>
            
            <DraggableSticker className="flex h-[159.444px] items-center justify-center left-[323.28px] top-[36.99px] w-[126.857px]">
              <div className="flex-none rotate-[15.56deg]">
                <div className="h-[139.673px] relative w-[92.796px]" data-name="image 70">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage70} />
                </div>
              </div>
            </DraggableSticker>
            <DraggableSticker className="h-[119.583px] left-[111.67px] top-[685.93px] w-[107.146px]" data-name="image 72">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute h-[134.48%] left-0 max-w-none top-[-15.52%] w-full" src={imgImage72} />
              </div>
            </DraggableSticker>
          </div>
        </div>
      </div>
    </div>
  );
}