import React, { useState, useRef, useEffect } from 'react';
import { ViewMode, ToolbarProps, ThemePalette } from '../types';
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
  ChevronRight,
  Palette
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
  setTypography,
  palette,
  setPalette
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
      ? 'bg-bg-secondary text-fg-primary' 
      : 'text-fg-secondary hover:text-fg-primary'}
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

  const themes: { id: ThemePalette; name: string }[] = [
    { id: 'zinc', name: 'Zinc (Default)' },
    { id: 'catppuccin', name: 'Catppuccin' },
    { id: 'nord', name: 'Nord' },
    { id: 'solarized', name: 'Solarized' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-bg-primary/80 backdrop-blur-md transition-colors duration-200 border-b border-transparent">
      
      {/* Logo */}
      <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-lg bg-fg-primary flex items-center justify-center text-bg-primary font-bold font-mono text-lg shadow-sm">
              M
          </div>
          <h1 className="hidden sm:block text-lg font-bold tracking-tight text-fg-primary">
          MonoMark
          </h1>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-bg-secondary/50 p-1 rounded-lg backdrop-blur-sm">
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

        <div className="w-px h-6 bg-border mx-2" />

        {/* Actions */}
        <div className="flex items-center gap-1 relative" ref={settingsRef}>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 transition-colors rounded-lg ${showSettings ? 'text-fg-primary bg-bg-secondary' : 'text-fg-secondary hover:text-fg-primary'}`}
            title="Appearance Settings"
          >
            <SlidersHorizontal size={18} />
          </button>

          {showSettings && (
            <div className="absolute top-full right-0 mt-4 w-72 max-h-[80vh] overflow-y-auto bg-bg-primary border border-border rounded-xl shadow-xl p-5 z-50 animate-fade-in-up flex flex-col gap-6">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-fg-primary">Appearance</span>
                  <button onClick={() => setShowSettings(false)} className="text-fg-secondary hover:text-fg-primary">
                    <X size={14} />
                  </button>
               </div>
               
               {/* Theme Palette */}
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-fg-secondary">
                    <Palette size={14} />
                    <span>Theme</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setPalette(t.id)}
                        className={`text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${palette === t.id ? 'bg-fg-primary text-bg-primary' : 'bg-bg-secondary text-fg-primary hover:bg-border'}`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="w-full h-px bg-border" />

               {/* Width Control */}
               <div className="space-y-2">
                 <div className="flex justify-between text-xs text-fg-secondary">
                    <span>Width</span>
                    <span className="font-mono">{contentWidth}%</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-xs text-fg-secondary font-mono">|</span>
                   <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={contentWidth}
                      onChange={(e) => setContentWidth(Number(e.target.value))}
                      className="flex-1 h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-fg-primary"
                   />
                   <span className="text-xs text-fg-secondary font-mono">|||</span>
                 </div>
               </div>

               {/* Base Size Control */}
               <div className="space-y-2">
                 <div className="flex justify-between text-xs text-fg-secondary">
                    <span>Base Size</span>
                    <span className="font-mono">{typography.baseSize}px</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <Type size={14} className="text-fg-secondary" />
                   <input 
                      type="range" 
                      min="12" 
                      max="24" 
                      step="1"
                      value={typography.baseSize}
                      onChange={(e) => setTypography({...typography, baseSize: Number(e.target.value)})}
                      className="flex-1 h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-fg-primary"
                   />
                   <Type size={20} className="text-fg-secondary" />
                 </div>
               </div>

               {/* Advanced Typography Accordion */}
               <div className="border-t border-border pt-2">
                 <button 
                    onClick={() => setExpandedAdvanced(!expandedAdvanced)}
                    className="flex items-center justify-between w-full text-left py-2 text-xs font-medium text-fg-primary hover:bg-bg-secondary rounded-lg transition-colors px-1 -mx-1"
                 >
                    <span>Advanced Typography</span>
                    {expandedAdvanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                 </button>

                 {expandedAdvanced && (
                   <div className="space-y-4 pt-4 animate-fade-in-down">
                      {/* H1 Scale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-fg-secondary">
                          <span>Heading 1</span>
                          <span className="font-mono text-[10px]">{typography.scales.h1}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="1.5" max="4.0" step="0.1"
                          value={typography.scales.h1}
                          onChange={(e) => handleScaleChange('h1', Number(e.target.value))}
                          className="w-full h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-fg-secondary"
                        />
                      </div>

                      {/* H2 Scale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-fg-secondary">
                          <span>Heading 2</span>
                          <span className="font-mono text-[10px]">{typography.scales.h2}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="1.2" max="3.0" step="0.1"
                          value={typography.scales.h2}
                          onChange={(e) => handleScaleChange('h2', Number(e.target.value))}
                          className="w-full h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-fg-secondary"
                        />
                      </div>

                       {/* H3 Scale */}
                       <div className="space-y-1">
                        <div className="flex justify-between text-xs text-fg-secondary">
                          <span>Heading 3</span>
                          <span className="font-mono text-[10px]">{typography.scales.h3}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="1.0" max="2.5" step="0.1"
                          value={typography.scales.h3}
                          onChange={(e) => handleScaleChange('h3', Number(e.target.value))}
                          className="w-full h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-fg-secondary"
                        />
                      </div>

                      {/* Code Scale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-fg-secondary">
                          <span>Code Blocks</span>
                          <span className="font-mono text-[10px]">{typography.scales.code}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.7" max="1.2" step="0.05"
                          value={typography.scales.code}
                          onChange={(e) => handleScaleChange('code', Number(e.target.value))}
                          className="w-full h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-fg-secondary"
                        />
                      </div>
                   </div>
                 )}
               </div>
            </div>
          )}

          <button 
            onClick={onCopy}
            className="p-2 text-fg-secondary hover:text-fg-primary transition-colors rounded-lg"
            title="Copy Markdown"
          >
            <Copy size={18} />
          </button>
          
          <button 
            onClick={onClear}
            className="p-2 text-fg-secondary hover:text-red-500 transition-colors rounded-lg"
            title="Clear All"
          >
            <Trash2 size={18} />
          </button>

          <button 
            onClick={toggleTheme}
            className="p-2 text-fg-secondary hover:text-fg-primary transition-colors rounded-lg ml-1"
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