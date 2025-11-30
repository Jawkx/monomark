import React, { useEffect, useState } from 'react';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import useLocalStorage from './hooks/useLocalStorage';
import useDebounce from './hooks/useDebounce';
import { ViewMode, Theme, TypographyState, ThemePalette } from './types';

const INITIAL_MARKDOWN = `# Welcome to MonoMark

MonoMark is a **minimal**, dual-color Markdown editor designed for focus.

## Features
- **Theming**: Choose from Zinc, Catppuccin, Nord, or Solarized.
- **Split View**: Edit and preview side-by-side.
- **Adjustable Width**: Use the slider in the toolbar to focus.

## Typography
You can write code blocks:

\`\`\`javascript
const greet = (name) => {
  console.log(\`Hello, \${name}!\`);
};
\`\`\`

> "Simplicity is the ultimate sophistication." 
> — Leonardo da Vinci

Enjoy writing!
`;

const INITIAL_TYPOGRAPHY: TypographyState = {
  baseSize: 16,
  scales: {
    h1: 2.25,
    h2: 1.75,
    h3: 1.5,
    code: 0.9,
  }
};

// Map of theme background colors for PWA status bar
const THEME_COLORS: Record<ThemePalette, { light: string; dark: string }> = {
  zinc: { light: '#ffffff', dark: '#09090b' },
  catppuccin: { light: '#eff1f5', dark: '#1e1e2e' },
  nord: { light: '#eceff4', dark: '#2e3440' },
  solarized: { light: '#fdf6e3', dark: '#002b36' }
};

const App: React.FC = () => {
  // State
  const [markdown, setMarkdown] = useLocalStorage<string>('monomark-content', INITIAL_MARKDOWN);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('monomark-viewmode', ViewMode.SPLIT);
  const [theme, setTheme] = useLocalStorage<Theme>('monomark-theme', 'light');
  const [palette, setPalette] = useLocalStorage<ThemePalette>('monomark-palette', 'zinc');
  
  const [contentWidth, setContentWidth] = useLocalStorage<number>('monomark-width', 50); // Default to ~50%
  const [typography, setTypography] = useLocalStorage<TypographyState>('monomark-typography', INITIAL_TYPOGRAPHY);
  const [toast, setToast] = useState<string | null>(null);

  // Debounce content for heavy preview rendering (300ms)
  const debouncedMarkdown = useDebounce(markdown, 300);
  // Debounce width changes to prevent layout thrashing during sliding (100ms)
  const debouncedContentWidth = useDebounce(contentWidth, 100);

  // Apply Theme and Palette
  useEffect(() => {
    const root = window.document.documentElement;
    // Handle Dark Mode
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }

    // Handle Palette
    // Remove all existing theme-* classes
    root.classList.forEach(cls => {
        if (cls.startsWith('theme-')) {
            root.classList.remove(cls);
        }
    });
    // Add new palette
    root.classList.add(`theme-${palette}`);

    // Update PWA Theme Color (Status Bar)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? THEME_COLORS[palette].dark : THEME_COLORS[palette].light;
      metaThemeColor.setAttribute('content', color);
    }
    
  }, [theme, palette]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      showToast('Copied to clipboard!');
    } catch (err) {
      showToast('Failed to copy.');
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all text?')) {
      setMarkdown('');
      showToast('Cleared!');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // Layout logic based on ViewMode
  const renderLayout = () => {
    const isSplit = viewMode === ViewMode.SPLIT;
    const isEdit = viewMode === ViewMode.EDIT;
    const isView = viewMode === ViewMode.VIEW;

    // We render both components but toggle their visibility with CSS.
    // This maintains internal state (scrolling, etc) and avoids unmount/remount lag.
    
    return (
      <div className={`flex h-full w-full overflow-hidden relative ${isSplit ? 'flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border' : ''}`}>
        
        {/* Editor Pane */}
        <div className={`${isSplit ? 'h-1/2 md:h-full md:w-1/2' : 'w-full h-full'} ${(isEdit || isSplit) ? '' : 'hidden'}`}>
            <Editor 
              content={markdown} 
              onChange={setMarkdown} 
              visible={isEdit || isSplit}
              contentWidth={debouncedContentWidth}
              baseSize={typography.baseSize}
            />
        </div>

        {/* Preview Pane - Uses debounced content and width for performance */}
        <div className={`${isSplit ? 'h-1/2 md:h-full md:w-1/2' : 'w-full h-full'} ${(isView || isSplit) ? '' : 'hidden'}`}>
            <Preview 
              content={debouncedMarkdown} 
              visible={isView || isSplit} 
              contentWidth={debouncedContentWidth}
              theme={theme}
              typography={typography}
            />
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-bg-primary text-fg-primary font-sans transition-colors duration-200 relative overflow-hidden">
      
      <Toolbar 
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        toggleTheme={toggleTheme}
        onClear={handleClear}
        onCopy={handleCopy}
        contentWidth={contentWidth}
        setContentWidth={setContentWidth}
        typography={typography}
        setTypography={setTypography}
        palette={palette}
        setPalette={setPalette}
      />

      <main className="h-full w-full">
        {renderLayout()}
      </main>

      {/* Minimal Toast Notification */}
      {toast && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-fg-primary text-bg-primary text-sm font-medium rounded-full shadow-lg animate-fade-in-up z-[60]">
          {toast}
        </div>
      )}
    </div>
  );
};

export default App;