
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { PreviewProps } from '../types';

const CodeBlock = ({ inline, className, children, theme, style, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    const language = match[1];
    return (
      <div className="rounded-xl overflow-hidden my-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#282c34]/50" style={style}>
        {/* Code Header Bar */}
        <div 
            className="flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 cursor-pointer select-none"
            onClick={() => setIsCollapsed(!isCollapsed)}
        >
            <div className="flex items-center gap-2">
                <button 
                    className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>
                <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {language}
                </span>
            </div>
            
            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-medium text-zinc-500 dark:text-zinc-400"
                title="Copy code"
            >
                {copied ? (
                    <>
                        <Check size={12} className="text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                    </>
                ) : (
                    <>
                        <Copy size={12} />
                        <span>Copy</span>
                    </>
                )}
            </button>
        </div>

        {/* Code Content */}
        {!isCollapsed && (
            <div className="relative overflow-x-auto">
                 <SyntaxHighlighter
                    style={theme === 'dark' ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        background: 'transparent',
                        padding: '1.5rem',
                        fontSize: '1em', // Let parent control scaling via style prop
                        lineHeight: 1.5,
                    }}
                    codeTagProps={{
                        style: { fontFamily: 'inherit' }
                    }}
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
                {/* Background layer */}
                <div className="absolute inset-0 -z-10 bg-white dark:bg-[#282c34]"></div>
            </div>
        )}
      </div>
    );
  }

  return (
    <code className={`${className} bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono text-[0.9em]`} style={style} {...props}>
      {children}
    </code>
  );
};

const Preview: React.FC<PreviewProps> = ({ content, visible, contentWidth, theme, typography }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { baseSize, scales } = typography;

  // Calculate max-width based on slider value (0-100)
  const getMaxWidth = () => {
    if (contentWidth >= 100) return '100%';
    const minPx = 600;
    const maxPx = 1400;
    const calculated = minPx + (contentWidth / 99) * (maxPx - minPx);
    return `${calculated}px`;
  };

  // Setup Section Folding (DOM Manipulation)
  useEffect(() => {
    if (!visible || !containerRef.current) return;

    const container = containerRef.current;
    // Select all headers
    const headers = container.querySelectorAll('h1, h2, h3, h4, h5, h6');

    // Helper to create the chevron icon
    const createChevron = (isFolded: boolean) => {
        const span = document.createElement('span');
        span.className = 'folding-icon inline-flex items-center justify-center w-6 h-6 -ml-8 mr-2 text-zinc-300 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer rounded-md';
        span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transform transition-transform duration-200 ${isFolded ? '-rotate-90' : 'rotate-0'}"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        return span;
    };

    headers.forEach((header) => {
        // Avoid double initialization
        if (header.hasAttribute('data-folding-init')) return;
        header.setAttribute('data-folding-init', 'true');

        // Style the header to support the absolute icon position or flex layout
        // We use -ml-8 to hang the icon in the gutter
        header.classList.add('relative', 'group', 'cursor-pointer');
        
        // Initial state
        let isFolded = false;

        // Insert Icon
        const iconContainer = createChevron(isFolded);
        header.insertBefore(iconContainer, header.firstChild);

        // Click Handler
        const toggleSection = (e: Event) => {
            // e.stopPropagation(); // Allow text selection? maybe not if clicking whole header
            isFolded = !isFolded;
            
            // Rotate Icon
            const svg = iconContainer.querySelector('svg');
            if (svg) {
                if (isFolded) {
                    svg.classList.add('-rotate-90');
                } else {
                    svg.classList.remove('-rotate-90');
                }
            }

            // Find siblings to toggle
            const level = parseInt(header.tagName.substring(1));
            let next = header.nextElementSibling;

            while (next) {
                // Check if next element is a header
                const nextTagName = next.tagName.toLowerCase();
                if (/^h[1-6]$/.test(nextTagName)) {
                    const nextLevel = parseInt(nextTagName.substring(1));
                    // Stop if we reach a header of same or higher importance (lower number)
                    if (nextLevel <= level) {
                        break;
                    }
                }

                // Toggle visibility
                if (isFolded) {
                    (next as HTMLElement).style.display = 'none';
                } else {
                    (next as HTMLElement).style.display = '';
                }

                next = next.nextElementSibling;
            }
        };

        header.addEventListener('click', toggleSection);
        // Also allow clicking the icon specifically
        iconContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSection(e);
        });
    });

  }, [content, visible, typography]); // Re-run when content changes to attach listeners to new nodes

  // Memoize markdown components to prevent unnecessary re-renders of ReactMarkdown
  const markdownComponents = useMemo(() => ({
    h1: ({node, ...props}: any) => <h1 style={{ fontSize: `${baseSize * scales.h1}px` }} {...props} />,
    h2: ({node, ...props}: any) => <h2 style={{ fontSize: `${baseSize * scales.h2}px` }} {...props} />,
    h3: ({node, ...props}: any) => <h3 style={{ fontSize: `${baseSize * scales.h3}px` }} {...props} />,
    h4: ({node, ...props}: any) => <h4 style={{ fontSize: `${baseSize * 1.25}px` }} {...props} />,
    h5: ({node, ...props}: any) => <h5 style={{ fontSize: `${baseSize * 1.1}px` }} {...props} />,
    h6: ({node, ...props}: any) => <h6 style={{ fontSize: `${baseSize}px` }} {...props} />,
    p: ({node, ...props}: any) => <p style={{ fontSize: `${baseSize}px` }} {...props} />,
    li: ({node, ...props}: any) => <li style={{ fontSize: `${baseSize}px` }} {...props} />,
    code: (props: any) => <CodeBlock {...props} theme={theme} style={{ fontSize: `${baseSize * scales.code}px` }} />
  }), [baseSize, scales, theme]);

  return (
    <div className={`h-full w-full overflow-y-auto px-6 sm:px-8 pt-24 pb-24 bg-white dark:bg-zinc-950 relative group scroll-smooth ${!visible ? 'hidden' : ''}`}>
        <div className="absolute top-24 right-4 text-xs text-zinc-300 dark:text-zinc-700 font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            PREVIEW
        </div>
      <div 
        ref={containerRef}
        className="mx-auto transition-all duration-300 ease-in-out pl-8" 
        style={{ maxWidth: getMaxWidth(), width: '100%' }}
      >
        <article className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-headings:scroll-mt-28 prose-a:text-zinc-900 dark:prose-a:text-zinc-100 prose-img:rounded-xl prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
            {content ? (
                <ReactMarkdown
                  components={markdownComponents}
                >
                  {content}
                </ReactMarkdown>
            ) : (
                <p className="text-zinc-400 dark:text-zinc-600 italic" style={{ fontSize: `${baseSize}px` }}>Nothing to preview yet...</p>
            )}
        </article>
      </div>
    </div>
  );
};

// Use React.memo to ensure Preview only re-renders when debounced content changes,
// ignoring parent re-renders caused by rapid typing in Editor.
export default React.memo(Preview);
