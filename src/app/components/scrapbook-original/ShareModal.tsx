import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import svgPaths from "../../../imports/Desktop5/svg-f291molzrm";
import imgImage122 from "../../../imports/Desktop5/0bd4e23f24a646a01f3e77b7524de44c008be2ab.png";

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

function Group({ onCopy, copied }: { onCopy: () => void, copied: boolean }) {
  return (
    <button 
      onClick={onCopy}
      className="absolute inset-[34.38%_3.82%_34.38%_92.75%] cursor-pointer hover:scale-110 transition-transform flex items-center justify-center bg-transparent border-none outline-none z-10" 
      data-name="Group"
      title="Copy Link"
    >
      {copied ? (
        <Check size={20} className="text-green-600 absolute inset-0 m-auto" />
      ) : (
        <div className="absolute inset-[-3.75%_-4.17%] w-full h-full">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.5 21.5">
            <g id="Group">
              <path d={svgPaths.p197ce900} id="Vector" stroke="var(--stroke-0, black)" strokeWidth="1.5" />
              <path d={svgPaths.p2b5baa80} id="Vector_2" opacity="0.5" stroke="var(--stroke-0, black)" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
      )}
    </button>
  );
}

function Frame3({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute bg-[#e2effb] h-[64px] left-[87px] overflow-clip rounded-[12px] top-[286px] w-[524px]">
      <div className="absolute inset-y-0 left-0 right-[50px] flex items-center pl-6 pr-2 overflow-hidden z-0">
        <span className="text-gray-800 font-['Instrument_Sans:Regular',sans-serif] text-[20px] whitespace-nowrap truncate w-full">
          {link}
        </span>
      </div>
      <Group onCopy={handleCopy} copied={copied} />
    </div>
  );
}

export function ShareModal({ link, isOpen, onClose }: { link: string, isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" 
          onClick={onClose}
        >
          <motion.div 
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white h-[442px] rounded-[32px] w-[699px] shadow-2xl overflow-visible scale-[0.5] sm:scale-[0.75] lg:scale-100 origin-center"
          >
            <Frame1 />
            
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors z-50 bg-gray-100 rounded-full p-2"
            >
              <X size={20} />
            </button>

            <p className="absolute font-['Instrument_Serif:Regular',sans-serif] leading-[normal] left-[calc(50%-262.5px)] not-italic text-[48px] text-black top-[103px] tracking-[0.96px] whitespace-nowrap">Share with your special person</p>
            <p className="absolute font-['Instrument_Serif:Regular',sans-serif] leading-[normal] left-[calc(50%-262.5px)] not-italic text-[24px] text-black top-[239px] whitespace-nowrap">Share your link:</p>
            <p className="absolute font-['Instrument_Sans:Regular',sans-serif] font-normal leading-[normal] left-[calc(50%-193.5px)] text-[24px] text-black top-[177px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Share what words alone can’t say ✨
            </p>
            
            <Frame3 link={link} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
