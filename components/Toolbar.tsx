
import React, { useState, useRef, useEffect } from 'react';
import { ViewMode, ToolbarProps } from '../types';
import { 
  PenLine, 
  SplitSquareHorizontal, 
  Eye, 
  Moon, 
  Sun, 
  Trash2, 
  Copy,
  SlidersHorizontal,
  X,
  Type,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Toolbar: React.FC<ToolbarProps> = ({ 
  viewMode, 
  setViewMode, 
  theme, 
  toggleTheme, 
  onClear,
  onCopy,
  contentWidth,
  setContentWidth,
  typography,
  setTypography
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [expandedAdvanced, setExpandedAdvanced] = useState(false);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getButtonClass = (isActive: boolean) => `
    p-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium
    ${isActive 
      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100' 
      : 'text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200'}
  `;

  const handleScaleChange = (key: keyof typeof typography.scales, value: number) => {
    setTypography({
      ...typography,
      scales: {
        ...typography.scales,
        [key]: value
      }
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-200">
      
      {/* Logo */}
      <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 font-bold font-mono text-lg shadow-sm">
              M
          </div>
          <h1 className="hidden sm:block text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
          MonoMark
          </h1>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-800/50 p-1 rounded-lg backdrop-blur-sm">
          <button 
            onClick={() => setViewMode(ViewMode.EDIT)}
            className={getButtonClass(viewMode === ViewMode.EDIT)}
            aria-label="Edit Mode"
            title="Edit"
          >
            <PenLine size={16} />
            <span className="hidden lg:inline text-xs">Edit</span>
          </button>
          
          <button 
            onClick={() => setViewMode(ViewMode.SPLIT)}
            className={getButtonClass(viewMode === ViewMode.SPLIT)}
            aria-label="Split Mode"
            title="Split"
          >
            <SplitSquareHorizontal size={16} />
            <span className="hidden lg:inline text-xs">Split</span>
          </button>

          <button 
            onClick={() => setViewMode(ViewMode.VIEW)}
            className={getButtonClass(viewMode === ViewMode.VIEW)}
            aria-label="View Mode"
            title="View"
          >
            <Eye size={16} />
            <span className="hidden lg:inline text-xs">Preview</span>
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-2" />

        {/* Actions */}
        <div className="flex items-center gap-1 relative" ref={settingsRef}>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 transition-colors rounded-lg ${showSettings ? 'text-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100'}`}
            title="Appearance Settings"
          >
            <SlidersHorizontal size={18} />
          </button>

          {showSettings && (
            <div className="absolute top-full right-0 mt-4 w-72 max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-5 z-50 animate-fade-in-up flex flex-col gap-6">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Appearance</span>
                  <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    <X size={14} />
                  </button>
               </div>
               
               {/* Width Control */}
               <div className="space-y-2">
                 <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Width</span>
                    <span className="font-mono">{contentWidth}%</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-xs text-zinc-400 font-mono">|</span>
                   <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={contentWidth}
                      onChange={(e) => setContentWidth(Number(e.target.value))}
                      className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                   />
                   <span className="text-xs text-zinc-400 font-mono">|||</span>
                 </div>
               </div>

               {/* Base Size Control */}
               <div className="space-y-2">
                 <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Base Size</span>
                    <span className="font-mono">{typography.baseSize}px</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <Type size={14} className="text-zinc-400" />
                   <input 
                      type="range" 
                      min="12" 
                      max="24" 
                      step="1"
                      value={typography.baseSize}
                      onChange={(e) => setTypography({...typography, baseSize: Number(e.target.value)})}
                      className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                   />
                   <Type size={20} className="text-zinc-400" />
                 </div>
               </div>

               {/* Advanced Typography Accordion */}
               <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2">
                 <button 
                    onClick={() => setExpandedAdvanced(!expandedAdvanced)}
                    className="flex items-center justify-between w-full text-left py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors px-1 -mx-1"
                 >
                    <span>Advanced Typography</span>
                    {expandedAdvanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                 </button>

                 {expandedAdvanced && (
                   <div className="space-y-4 pt-4 animate-fade-in-down">
                      {/* H1 Scale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>Heading 1</span>
                          <span className="font-mono text-[10px]">{typography.scales.h1}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="1.5" max="4.0" step="0.1"
                          value={typography.scales.h1}
                          onChange={(e) => handleScaleChange('h1', Number(e.target.value))}
                          className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500"
                        />
                      </div>

                      {/* H2 Scale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>Heading 2</span>
                          <span className="font-mono text-[10px]">{typography.scales.h2}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="1.2" max="3.0" step="0.1"
                          value={typography.scales.h2}
                          onChange={(e) => handleScaleChange('h2', Number(e.target.value))}
                          className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500"
                        />
                      </div>

                       {/* H3 Scale */}
                       <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>Heading 3</span>
                          <span className="font-mono text-[10px]">{typography.scales.h3}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="1.0" max="2.5" step="0.1"
                          value={typography.scales.h3}
                          onChange={(e) => handleScaleChange('h3', Number(e.target.value))}
                          className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500"
                        />
                      </div>

                      {/* Code Scale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>Code Blocks</span>
                          <span className="font-mono text-[10px]">{typography.scales.code}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.7" max="1.2" step="0.05"
                          value={typography.scales.code}
                          onChange={(e) => handleScaleChange('code', Number(e.target.value))}
                          className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500"
                        />
                      </div>
                   </div>
                 )}
               </div>
            </div>
          )}

          <button 
            onClick={onCopy}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 transition-colors rounded-lg"
            title="Copy Markdown"
          >
            <Copy size={18} />
          </button>
          
          <button 
            onClick={onClear}
            className="p-2 text-zinc-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 transition-colors rounded-lg"
            title="Clear All"
          >
            <Trash2 size={18} />
          </button>

          <button 
            onClick={toggleTheme}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 transition-colors rounded-lg ml-1"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Toolbar;
