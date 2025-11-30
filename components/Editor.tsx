import React, { useRef } from 'react';
import { EditorProps } from '../types';

const Editor: React.FC<EditorProps> = ({ content, onChange, visible, contentWidth, baseSize }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate max-width based on slider value (0-100)
  const getMaxWidth = () => {
    if (contentWidth >= 100) return '100%';
    const minPx = 600;
    const maxPx = 1400;
    const calculated = minPx + (contentWidth / 99) * (maxPx - minPx);
    return `${calculated}px`;
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target !== textareaRef.current) {
        textareaRef.current?.focus();
    }
  };

  return (
    <div 
        className={`h-full w-full relative group cursor-text overflow-y-auto ${!visible ? 'hidden' : ''}`}
        onClick={handleContainerClick}
    >
        <div className="absolute top-24 right-4 text-xs text-fg-secondary font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
            EDITOR
        </div>
        
        <div 
            className="mx-auto min-h-full transition-all duration-300 ease-in-out pt-24 pb-24"
            style={{ maxWidth: getMaxWidth(), width: '100%' }}
        >
            <textarea
                ref={textareaRef}
                className="w-full h-full min-h-[calc(100vh-12rem)] resize-none bg-transparent px-6 sm:px-8 outline-none border-none text-fg-primary font-mono leading-relaxed placeholder-fg-secondary block"
                style={{ fontSize: `${baseSize}px` }}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="# Start typing your masterpiece..."
                spellCheck={false}
            />
        </div>
    </div>
  );
};

export default React.memo(Editor);