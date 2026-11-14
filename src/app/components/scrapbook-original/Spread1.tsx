import React from 'react';
import imgImage107 from "../../../imports/Frame90/905920a2a421690fe92706dac39d1fb1159215fc.png";
import imgImage62 from "../../../imports/Frame90/a77e47a4cb4004ac4569d05f7b0a9719c2c2c07f.png";
import imgImage66 from "../../../imports/Frame90/f3a9c48db0ca3cd676badc3dc36ecf9c4efe4788.png";
import imgImage65 from "../../../imports/Frame90/3be82de1a851dda81c947828c8cb692ca878210b.png";
import { EditableImage } from './EditableImage';
import { EditableText } from './EditableText';
import { DraggableSticker } from './DraggableSticker';

export interface SpreadData {
  [key: string]: string;
}

interface SpreadProps {
  data: SpreadData;
  onUpdate: (key: string, val: string) => void;
  isViewerMode?: boolean;
}

export function Spread1({ data = {}, onUpdate, isViewerMode }: SpreadProps) {
  return (
    <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
      <div className="absolute h-[871.516px] left-0 overflow-visible top-[0.96px] w-[615.132px] bg-white rounded-l-[3.827px]" data-name="frontpage of page1">
        <div className="absolute flex h-[283.789px] items-center justify-center left-[274.3px] top-[523.29px] w-[260.834px]">
          <div className="flex-none rotate-[11.82deg]">
            <EditableImage className="bg-[#ffe9f6] h-[244.905px] rounded-[7.653px] w-[215.248px]" defaultColor="#ffe9f6" imageUrl={data.left_pink} onImageUpload={(url) => onUpdate('left_pink', url)} isViewerMode={isViewerMode} />
          </div>
        </div>
        <div className="absolute left-[64.09px] top-[618.96px]">
          <EditableImage className="bg-[#fff3e2] h-[186.549px] rounded-[7.653px] w-[247.775px]" defaultColor="#fff3e2" imageUrl={data.left_orange} onImageUpload={(url) => onUpdate('left_orange', url)} isViewerMode={isViewerMode} />
        </div>
        <div className="absolute left-[99.49px] top-[74.62px]">
          <EditableImage className="bg-[#ffeaa5] h-[255.428px] rounded-[11.48px] w-[358.747px]" defaultColor="#ffeaa5" imageUrl={data.left_yellow} onImageUpload={(url) => onUpdate('left_yellow', url)} isViewerMode={isViewerMode} />
        </div>

        {/* Decorative elements wrapped in DraggableSticker */}
        <DraggableSticker className="flex h-[93.321px] items-center justify-center left-[160.09px] top-[764.26px] w-[136.096px]"><div className="flex-none rotate-[-3.49deg]"><div className="h-[85.498px] relative w-[131.136px]" data-name="image 107"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[691.89%] left-[-51.98%] max-w-none top-[-244.59%] w-[676.65%]" src={imgImage107} /></div></div></div></DraggableSticker>
        <DraggableSticker className="flex h-[213.352px] items-center justify-center left-[254.13px] top-[664.88px] w-[178.38px]"><div className="flex-none rotate-[20.94deg]"><div className="h-[182.004px] relative w-[121.336px]" data-name="image 62"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage62} /></div></div></DraggableSticker>
        <DraggableSticker className="h-[28.675px] left-[62.88px] top-[45.92px] w-[109.152px]" data-name="image 89"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[825.81%] left-[-120.9%] max-w-none top-[-72.24%] w-[325.42%]" src={imgImage107} /></div></DraggableSticker>
        <DraggableSticker className="h-[28.675px] left-[62.88px] top-[332.92px] w-[109.152px]" data-name="image 97"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[825.81%] left-[-120.9%] max-w-none top-[-72.24%] w-[325.42%]" src={imgImage107} /></div></DraggableSticker>
        <DraggableSticker className="h-[28.675px] left-[171.94px] top-[45.92px] w-[109.152px]" data-name="image 90"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[825.81%] left-[-120.9%] max-w-none top-[-72.24%] w-[325.42%]" src={imgImage107} /></div></DraggableSticker>
        <DraggableSticker className="h-[28.675px] left-[171.94px] top-[332.92px] w-[109.152px]" data-name="image 98"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[825.81%] left-[-120.9%] max-w-none top-[-72.24%] w-[325.42%]" src={imgImage107} /></div></DraggableSticker>
        <DraggableSticker className="h-[28.675px] left-[281px] top-[45.92px] w-[109.152px]" data-name="image 91"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[825.81%] left-[-120.9%] max-w-none top-[-72.24%] w-[325.42%]" src={imgImage107} /></div></DraggableSticker>
        <DraggableSticker className="h-[28.675px] left-[281px] top-[332.92px] w-[109.152px]" data-name="image 99"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[825.81%] left-[-120.9%] max-w-none top-[-72.24%] w-[325.42%]" src={imgImage107} /></div></DraggableSticker>
        <DraggableSticker className="h-[28.675px] left-[390.06px] top-[45.92px] w-[109.152px]" data-name="image 92"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[825.81%] left-[-120.9%] max-w-none top-[-72.24%] w-[325.42%]" src={imgImage107} /></div></DraggableSticker>
        <DraggableSticker className="h-[28.675px] left-[390.06px] top-[332.92px] w-[109.152px]" data-name="image 100"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[825.81%] left-[-120.9%] max-w-none top-[-72.24%] w-[325.42%]" src={imgImage107} /></div></DraggableSticker>
        <DraggableSticker className="flex h-[51.632px] items-center justify-center left-[22.38px] top-[384.18px] w-[54.947px]"><div className="flex-none rotate-[-7.51deg]"><div className="h-[45.563px] relative w-[49.416px]" data-name="image 107"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[1084.06%] left-[-459.32%] max-w-none top-[-95.56%] w-[1499.32%]" src={imgImage107} /></div></div></div></DraggableSticker>
        <DraggableSticker className="h-[63.032px] left-[513.47px] top-[74.62px] w-[64.206px]" data-name="image 107"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[636.02%] left-[-727.44%] max-w-none top-[-239.75%] w-[936.59%]" src={imgImage107} /></div></DraggableSticker>
        <DraggableSticker className="flex h-[117.814px] items-center justify-center left-[464.06px] top-[74.8px] w-[29.298px]"><div className="flex-none rotate-[-90.77deg]"><div className="h-[27.726px] relative w-[117.453px]" data-name="image 81"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[806.3%] left-[-121.76%] max-w-none top-[-348.51%] w-[285.5%]" src={imgImage107} /></div></div></div></DraggableSticker>
        <DraggableSticker className="flex h-[117.814px] items-center justify-center left-[62.88px] top-[71.75px] w-[29.298px]"><div className="flex-none rotate-[-90.77deg]"><div className="h-[27.726px] relative w-[117.453px]" data-name="image 109"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[806.3%] left-[-121.76%] max-w-none top-[-348.51%] w-[285.5%]" src={imgImage107} /></div></div></div></DraggableSticker>
        <DraggableSticker className="flex h-[117.814px] items-center justify-center left-[464.06px] top-[199.16px] w-[29.298px]"><div className="flex-none rotate-[-90.77deg]"><div className="h-[27.726px] relative w-[117.453px]" data-name="image 108"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[806.3%] left-[-121.76%] max-w-none top-[-348.51%] w-[285.5%]" src={imgImage107} /></div></div></div></DraggableSticker>
        <DraggableSticker className="flex h-[117.814px] items-center justify-center left-[62.88px] top-[196.12px] w-[29.298px]"><div className="flex-none rotate-[-90.77deg]"><div className="h-[27.726px] relative w-[117.453px]" data-name="image 110"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[806.3%] left-[-121.76%] max-w-none top-[-348.51%] w-[285.5%]" src={imgImage107} /></div></div></div></DraggableSticker>
      </div>
      <div className="absolute h-[872.473px] right-0 top-0 w-[615.39px]" data-name="page2">
        <div className="absolute h-[872.473px] left-[0px] overflow-visible top-0 w-[615.132px] bg-white rounded-r-[3.827px]" data-name="frontpage of page2">
          <div className="absolute flex h-[278.63px] items-center justify-center left-[145.96px] top-[519.79px] w-[374.879px]">
            <div className="flex-none rotate-[3.8deg]">
              <EditableImage className="bg-[#ffeaa5] h-[255.428px] rounded-[11.48px] w-[358.747px]" defaultColor="#ffeaa5" imageUrl={data.right_bottom_yellow} onImageUpload={(url) => onUpdate('right_bottom_yellow', url)} isViewerMode={isViewerMode} />
            </div>
          </div>
          <div className="absolute flex h-[243.543px] items-center justify-center left-[19.13px] top-[56.44px] w-[327.019px]">
            <div className="flex-none rotate-[-5.26deg]">
              <EditableImage className="bg-[#ffccd2] h-[216.159px] rounded-[11.48px] w-[308.493px]" defaultColor="#ffccd2" imageUrl={data.right_top_pink} onImageUpload={(url) => onUpdate('right_top_pink', url)} isViewerMode={isViewerMode} />
            </div>
          </div>
          <div className="absolute flex h-[316.229px] items-center justify-center left-[302.88px] top-[56.46px] w-[280.234px]">
            <div className="flex-none rotate-[11.97deg]">
              <EditableImage className="bg-[#f1ffcc] h-[274.885px] rounded-[11.48px] w-[228.192px]" defaultColor="#f1ffcc" imageUrl={data.right_top_green} onImageUpload={(url) => onUpdate('right_top_green', url)} isViewerMode={isViewerMode} />
            </div>
          </div>
          
          {/* Stickers */}
          <DraggableSticker className="h-[63.032px] left-[485.72px] top-[514.68px] w-[64.206px]" data-name="image 107"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[636.02%] left-[-727.44%] max-w-none top-[-239.75%] w-[936.59%]" src={imgImage107} /></div></DraggableSticker>
          <DraggableSticker className="flex h-[157.954px] items-center justify-center left-[433.11px] top-[719.41px] w-[164.908px]"><div className="flex-none rotate-[26.26deg]"><div className="h-[112.886px] relative w-[128.192px]" data-name="image 66"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[170.34%] left-0 max-w-none top-[-37.29%] w-full" src={imgImage66} /></div></div></div></DraggableSticker>
          <DraggableSticker className="flex h-[236.402px] items-center justify-center left-[192.85px] top-[149.64px] w-[226.202px]"><div className="flex-none rotate-[31.28deg]"><div className="h-[183.562px] relative w-[153.163px]" data-name="image 65"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[125.48%] left-[-0.13%] max-w-none top-[-8.92%] w-[100.25%]" src={imgImage65} /></div></div></div></DraggableSticker>
          <DraggableSticker className="h-[70.873px] left-[532.6px] top-[67.92px] w-[67.846px]" data-name="image 109"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute h-[364.41%] left-[-342.38%] max-w-none top-[-240.57%] w-[571%]" src={imgImage107} /></div></DraggableSticker>
        </div>
        <DraggableSticker className="h-[55.673px] left-[102.36px] top-[317.61px] w-[182.109px]" data-name="image 78">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[826.88%] left-[-127.01%] max-w-none top-[-168.5%] w-[380.72%]" src={imgImage107} />
          </div>
        </DraggableSticker>
        <DraggableSticker className="flex h-[111.604px] items-center justify-center left-[27.85px] top-[388.57px] w-[91.627px]">
          <div className="-scale-y-100 flex-none rotate-[156.09deg]">
            <div className="h-[96.638px] relative w-[57.39px]" data-name="image 83">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute h-[392.34%] left-[-291.61%] max-w-none top-[-268.97%] w-[990.97%]" src={imgImage107} />
              </div>
            </div>
          </div>
        </DraggableSticker>
      </div>
    </div>
  );
}