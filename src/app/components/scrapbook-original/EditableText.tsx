import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export interface EditableTextProps {
  className?: string;
  defaultBgColor?: string;
  textColor?: string;
  text?: string;
  onChange?: (val: string) => void;
  isViewerMode?: boolean;
}

export function EditableText({ className = "", defaultBgColor, textColor, text, onChange, isViewerMode }: EditableTextProps) {
  // Replace fixed h-[Xpx] with min-h-[Xpx] to let it grow,
  // but we still want width to be constrained.
  const modifiedClassName = className.replace(/(?<!min-)h-\[([^\]]+)\]/g, 'min-h-[$1] h-auto');

  return (
    <div 
      className={`relative p-3 shadow-sm rounded-md transition-shadow hover:shadow-md flex flex-col ${modifiedClassName}`}
      style={{ backgroundColor: defaultBgColor, color: textColor, fontFamily: 'var(--font-family, "Caveat", cursive)' }}
    >
      {isViewerMode ? (
        <div className="whitespace-pre-wrap text-xl leading-relaxed break-words flex-1">
          {text || " "}
        </div>
      ) : (
        <TextareaAutosize
          value={text || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write your memories here..."
          className="w-full flex-1 bg-transparent resize-none outline-none text-xl leading-relaxed placeholder:opacity-50 overflow-hidden"
          minRows={1}
        />
      )}
    </div>
  );
}