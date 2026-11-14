import React from 'react';
import imgImage109 from "../../../imports/Desktop2-1-1/905920a2a421690fe92706dac39d1fb1159215fc.png";
import imgImage87 from "../../../imports/Desktop2-1-1/74053b7a43b2ac5bc016ea11a98d4718ed6e8bfb.png";
import imgImage108 from "../../../imports/Desktop2-1-1/20518c2adb30c50e39319fa1b0028541ab692bcf.png";
import { EditableImage } from './EditableImage';
import { EditableText } from './EditableText';
import { DraggableSticker } from './DraggableSticker';
import { SpreadData } from './Spread1';

interface SpreadProps {
  data: SpreadData;
  onUpdate: (key: string, val: string) => void;
  isViewerMode?: boolean;
}

export function Spread3({ data = {}, onUpdate, isViewerMode }: SpreadProps) {
  return (
    <div className="w-full h-full relative flex" style={{ transformStyle: 'preserve-3d' }}>
      
      {/* Left Page (Bakpage) */}
      <div className="absolute h-[872.477px] left-0 top-0 w-[615.134px]">
        <div className="bg-white h-[872.477px] overflow-visible relative w-[615.134px] rounded-l-[3.827px]" data-name="Bakpage">
          
          <div className="absolute flex h-[373.669px] items-center justify-center left-[22.74px] top-[130.98px] w-[578.12px]">
            <div className="flex-none rotate-[3.8deg]">
              <EditableImage className="bg-[#ffeaa5] h-[337.516px] rounded-[3.827px] w-[556.987px]" defaultColor="#ffeaa5" imageUrl={data.left_yellow} onImageUpload={(url) => onUpdate('left_yellow', url)} isViewerMode={isViewerMode} />
            </div>
          </div>

          <DraggableSticker className="absolute flex h-[59.795px] items-center justify-center left-[212.55px] top-[87.14px] w-[184.844px]">
            <div className="-scale-y-100 flex-none rotate-[3.8deg]">
              <div className="h-[47.833px] relative w-[182.075px]" data-name="image 109">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[825.81%] left-[-120.9%] max-w-none top-[-72.24%] w-[325.42%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>

          <DraggableSticker className="absolute flex h-[59.795px] items-center justify-center left-[203.94px] top-[545.38px] w-[184.844px]">
            <div className="-scale-y-100 flex-none rotate-[3.8deg]">
              <div className="h-[47.833px] relative w-[182.075px]" data-name="image 112">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[825.81%] left-[-120.9%] max-w-none top-[-72.24%] w-[325.42%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>

          <DraggableSticker className="absolute flex h-[61.157px] items-center justify-center left-[21.82px] top-[74.86px] w-[205.356px]">
            <div className="-scale-y-100 flex-none rotate-[3.8deg]">
              <div className="h-[47.833px] relative w-[202.632px]" data-name="image 109">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[806.3%] left-[-121.76%] max-w-none top-[-348.51%] w-[285.5%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>

          <DraggableSticker className="absolute flex h-[61.157px] items-center justify-center left-[392.56px] top-[563.47px] w-[205.356px]">
            <div className="flex-none rotate-[3.8deg]">
              <div className="h-[47.833px] relative w-[202.632px]" data-name="image 110">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[806.3%] left-[-121.76%] max-w-none top-[-348.51%] w-[285.5%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>

          <DraggableSticker className="absolute flex h-[61.157px] items-center justify-center left-[14.68px] top-[530.95px] w-[205.356px]">
            <div className="-scale-y-100 flex-none rotate-[3.8deg]">
              <div className="h-[47.833px] relative w-[202.632px]" data-name="image 111">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[806.3%] left-[-121.76%] max-w-none top-[-348.51%] w-[285.5%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>

          <div className="absolute flex h-[75.937px] items-center justify-center left-[289.7px] top-[487.01px] w-[276.419px]">
            <div className="flex-none rotate-[3.8deg]">
              <EditableText className="min-h-[60px] w-[273.178px] px-[30px] py-[11px]" defaultBgColor="#d9d9d9" textColor="#007ac5" text={data.left_text_blue} onChange={(val) => onUpdate('left_text_blue', val)} isViewerMode={isViewerMode} />
            </div>
          </div>

          <DraggableSticker className="absolute flex h-[118.586px] items-center justify-center left-[100.85px] top-[413.28px] w-[125.885px]">
            <div className="-rotate-[164deg] -scale-y-100 flex-none">
              <div className="h-[93.501px] relative w-[104.147px]" data-name="image 87">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[109.99%] left-[-22.47%] max-w-none top-[-5.69%] w-[148.12%]" src={imgImage87} />
                </div>
              </div>
            </div>
          </DraggableSticker>

          <div className="absolute flex h-[166.459px] items-center justify-center left-[66.97px] top-[634.27px] w-[313.786px]">
            <div className="flex-none">
              <EditableText className="min-h-[166px] w-[313.786px] px-[24px] py-[35px]" defaultBgColor="#d9d9d9" textColor="#000" text={data.left_text_black} onChange={(val) => onUpdate('left_text_black', val)} isViewerMode={isViewerMode} />
            </div>
          </div>

          <DraggableSticker className="absolute flex h-[99.493px] items-center justify-center left-[393.19px] top-[710.8px] w-[105.233px]">
            <div className="-scale-y-100 flex-none rotate-180">
              <div className="h-[99.493px] relative w-[105.233px]" data-name="image 80">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[467.58%] left-[-166.81%] max-w-none top-[-152.97%] w-[662.07%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>

          <DraggableSticker className="absolute flex h-[34.194px] items-center justify-center left-[399.52px] top-[112.83px] w-[34.354px]">
            <div className="-scale-y-100 flex-none rotate-[-160.79deg]">
              <div className="h-[26.787px] relative w-[27.047px]" data-name="image 109">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[1047.33%] left-[-480.42%] max-w-none top-[-89.23%] w-[1555.88%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>
          
          <DraggableSticker className="absolute flex h-[34.506px] items-center justify-center left-[431.6px] top-[117.67px] w-[35.251px]">
            <div className="-scale-y-100 flex-none rotate-[-160.79deg]">
              <div className="h-[26.787px] relative w-[27.997px]" data-name="image 113">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[1087.02%] left-[-481.97%] max-w-none top-[-94.99%] w-[1560.05%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>
          
          <DraggableSticker className="absolute flex h-[29.5px] items-center justify-center left-[466.51px] top-[122.45px] w-[29.996px]">
            <div className="-scale-y-100 flex-none rotate-[-160.79deg]">
              <div className="h-[22.96px] relative w-[23.765px]" data-name="image 114">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[1067.75%] left-[-477.24%] max-w-none top-[-92.67%] w-[1547.38%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>
          
          <DraggableSticker className="absolute flex h-[29.707px] items-center justify-center left-[496.53px] top-[125.32px] w-[30.589px]">
            <div className="-scale-y-100 flex-none rotate-[-160.79deg]">
              <div className="h-[22.96px] relative w-[24.393px]" data-name="image 115">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[1089.01%] left-[-473.58%] max-w-none top-[-95.53%] w-[1537.57%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>
          
          <DraggableSticker className="absolute flex h-[19.805px] items-center justify-center left-[526.82px] top-[132.98px] w-[20.392px]">
            <div className="-scale-y-100 flex-none rotate-[-160.79deg]">
              <div className="h-[15.307px] relative w-[16.262px]" data-name="image 116">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[1089.01%] left-[-473.58%] max-w-none top-[-95.53%] w-[1537.57%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>
          
          <DraggableSticker className="absolute flex h-[19.805px] items-center justify-center left-[548.82px] top-[133.93px] w-[20.392px]">
            <div className="-scale-y-100 flex-none rotate-[-160.79deg]">
              <div className="h-[15.307px] relative w-[16.262px]" data-name="image 117">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[1089.01%] left-[-473.58%] max-w-none top-[-95.53%] w-[1537.57%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>
          
          <DraggableSticker className="absolute flex h-[14.854px] items-center justify-center left-[570.19px] top-[139.1px] w-[15.294px]">
            <div className="-scale-y-100 flex-none rotate-[-160.79deg]">
              <div className="h-[11.48px] relative w-[12.196px]" data-name="image 118">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[1089.01%] left-[-473.58%] max-w-none top-[-95.53%] w-[1537.57%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>
          
          <DraggableSticker className="absolute flex h-[14.854px] items-center justify-center left-[586.45px] top-[141.97px] w-[15.294px]">
            <div className="-scale-y-100 flex-none rotate-[-160.79deg]">
              <div className="h-[11.48px] relative w-[12.196px]" data-name="image 119">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[1089.01%] left-[-473.58%] max-w-none top-[-95.53%] w-[1537.57%]" src={imgImage109} />
                </div>
              </div>
            </div>
          </DraggableSticker>

        </div>
      </div>

      {/* Right Page (Bakpage1) */}
      <div className="absolute flex h-[872.477px] items-center justify-center right-0 top-0 w-[615.392px]">
        <div className="absolute flex h-[872.477px] items-center justify-center right-[0.26px] top-0 w-[615.134px]">
          <div className="bg-white h-[872.477px] overflow-visible relative w-[615.134px] rounded-r-[3.827px]" data-name="Bakpage">
            
            <div className="absolute flex items-center justify-center left-[51.4px] top-[486.94px]">
              <EditableText className="min-h-[60px] w-[273.178px] px-[30px] py-[11px]" defaultBgColor="#d9d9d9" textColor="#f3213a" text={data.right_text_red} onChange={(val) => onUpdate('right_text_red', val)} isViewerMode={isViewerMode} />
            </div>

            <div className="absolute flex h-[337.516px] items-center justify-center left-[24.58px] top-[149.05px] w-[556.986px]">
              <div className="flex-none">
                <EditableImage className="bg-[#ffeaa5] h-[337.516px] rounded-[3.827px] w-[556.987px]" defaultColor="#ffeaa5" imageUrl={data.right_yellow} onImageUpload={(url) => onUpdate('right_yellow', url)} isViewerMode={isViewerMode} />
              </div>
            </div>

            <DraggableSticker className="absolute flex h-[116.773px] items-center justify-center left-[470.99px] top-[95.16px] w-[148.108px]">
              <div className="flex-none rotate-[15.48deg]">
                <div className="h-[85.143px] relative w-[130.106px]" data-name="image 108">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[172.39%] left-[-33.92%] max-w-none top-[-26.6%] w-[169.16%]" src={imgImage108} />
                  </div>
                </div>
              </div>
            </DraggableSticker>

            <DraggableSticker className="absolute flex h-[57.492px] items-center justify-center left-[516.99px] top-[689.71px] w-[56.097px]">
              <div className="flex-none rotate-[13.95deg]">
                <div className="h-[47.833px] relative w-[45.92px]" data-name="image 84">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[726.24%] left-[-582.09%] max-w-none top-[-553.9%] w-[1146.27%]" src={imgImage109} />
                  </div>
                </div>
              </div>
            </DraggableSticker>

            <DraggableSticker className="absolute flex h-[68.49px] items-center justify-center left-[24.62px] top-[43.05px] w-[66.724px]">
              <div className="flex-none rotate-[-19.21deg]">
                <div className="h-[54.53px] relative w-[51.66px]" data-name="image 79">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[846.28%] left-[-398.26%] max-w-none top-[-64.46%] w-[1335.65%]" src={imgImage109} />
                  </div>
                </div>
              </div>
            </DraggableSticker>

            <DraggableSticker className="absolute flex h-[101.234px] items-center justify-center left-[404.41px] top-[86.1px] w-[93.671px]">
              <div className="flex-none rotate-[-22.88deg]">
                <div className="h-[81.485px] relative w-[67.284px]" data-name="image 76">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[424.9%] left-[-594.47%] max-w-none top-[-142.32%] w-[771.86%]" src={imgImage109} />
                  </div>
                </div>
              </div>
            </DraggableSticker>

            <DraggableSticker className="absolute h-[164.546px] left-[24.62px] top-[636.18px] w-[169.329px]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute h-[320%] left-[-21.52%] max-w-none top-[-6.56%] w-[465.45%]" src={imgImage109} />
              </div>
            </DraggableSticker>
            
          </div>
        </div>
      </div>
    </div>
  );
}