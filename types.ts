
export enum ViewMode {
  EDIT = 'EDIT',
  SPLIT = 'SPLIT',
  VIEW = 'VIEW'
}

export type Theme = 'light' | 'dark';

export type ThemePalette = 'zinc' | 'catppuccin' | 'nord' | 'solarized';

export interface TypographyState {
  baseSize: number; // in pixels, e.g., 16
  scales: {
    h1: number; // multiplier, e.g., 2.5
    h2: number; // multiplier, e.g., 2.0
    h3: number; // multiplier, e.g., 1.75
    code: number; // multiplier, e.g., 0.9
  };
}

export interface ToolbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: Theme;
  toggleTheme: () => void;
  onClear: () => void;
  onCopy: () => void;
  contentWidth: number;
  setContentWidth: (width: number) => void;
  typography: TypographyState;
  setTypography: (state: TypographyState) => void;
  palette: ThemePalette;
  setPalette: (palette: ThemePalette) => void;
}

export interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  visible: boolean;
  contentWidth: number;
  baseSize: number;
}

export interface PreviewProps {
  content: string;
  visible: boolean;
  contentWidth: number;
  theme: Theme;
  typography: TypographyState;
}
