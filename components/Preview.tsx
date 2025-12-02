import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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
      <div className="rounded-xl overflow-hidden my-6 border border-border bg-bg-secondary" style={style}>
        {/* Code Header Bar */}
        <div 
            className="flex items-center justify-between px-3 py-2 bg-bg-primary/50 border-b border-border cursor-pointer select-none"
            onClick={() => setIsCollapsed(!isCollapsed)}
        >
            <div className="flex items-center gap-2">
                <button 
                    className="text-fg-secondary hover:text-fg-primary transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>
                <span className="text-xs font-mono font-medium text-fg-secondary uppercase tracking-wider">
                    {language}
                </span>
            </div>
            
            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-bg-primary transition-colors text-xs font-medium text-fg-secondary"
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
                {/* Background layer to match theme opacity if needed, but handled by parent bg-bg-secondary */}
            </div>
        )}
      </div>
    );
  }

  return (
    <code className={`${className} bg-bg-secondary px-1.5 py-0.5 rounded text-fg-primary font-mono text-[0.9em]`} style={style} {...props}>
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
        span.className = 'folding-icon inline-flex items-center justify-center w-6 h-6 -ml-8 mr-2 text-fg-secondary hover:text-fg-primary transition-colors cursor-pointer rounded-md';
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
    code: (props: any) => <CodeBlock {...props} theme={theme} style={{ fontSize: `${baseSize * scales.code}px` }} />,
    
    // Custom Table Rendering
    table: ({node, ...props}: any) => (
      <div className="overflow-x-auto my-6 border border-border rounded-lg">
        <table className="w-full text-left border-collapse min-w-max" style={{ fontSize: `${baseSize}px` }} {...props} />
      </div>
    ),
    thead: ({node, ...props}: any) => <thead className="bg-bg-secondary/50 text-fg-primary" {...props} />,
    th: ({node, ...props}: any) => <th className="p-3 font-semibold border-b border-r border-border last:border-r-0 text-fg-primary" {...props} />,
    td: ({node, ...props}: any) => <td className="p-3 border-b border-r border-border last:border-r-0 last:border-b-0 text-fg-primary" {...props} />,
    
    // Custom Details/Summary Rendering
    details: ({node, ...props}: any) => (
      <details 
        className="group border border-border rounded-lg bg-bg-secondary/20 my-4 overflow-hidden" 
        style={{ fontSize: `${baseSize}px` }} 
        {...props} 
      />
    ),
    summary: ({node, ...props}: any) => (
      <summary 
        className="cursor-pointer p-3 font-medium bg-bg-secondary/40 text-fg-primary hover:bg-bg-secondary/60 transition-colors outline-none list-none select-none flex items-center gap-2" 
        {...props} 
      />
    ),
  }), [baseSize, scales, theme]);

  return (
    <div className={`h-full w-full overflow-y-auto px-6 sm:px-8 pt-24 pb-24 bg-bg-primary relative group scroll-smooth ${!visible ? 'hidden' : ''}`}>
        <div className="absolute top-24 right-4 text-xs text-fg-secondary font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            PREVIEW
        </div>
      <div 
        ref={containerRef}
        className="mx-auto transition-all duration-300 ease-in-out pl-8" 
        style={{ maxWidth: getMaxWidth(), width: '100%' }}
      >
        <article className="prose max-w-none prose-headings:font-bold prose-headings:scroll-mt-28 prose-a:text-accent prose-img:rounded-xl prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 text-fg-primary">
            {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={markdownComponents}
                >
                  {content}
                </ReactMarkdown>
            ) : (
                <p className="text-fg-secondary italic" style={{ fontSize: `${baseSize}px` }}>Nothing to preview yet...</p>
            )}
        </article>
      </div>
    </div>
  );
};

export default React.memo(Preview);