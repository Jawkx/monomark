
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { PreviewProps } from '../types';

const CodeBlock = ({ inline, className, children, theme, style, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group rounded-xl overflow-hidden my-6 border border-zinc-200 dark:border-zinc-800" style={style}>
        <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md bg-white/90 dark:bg-zinc-800/90 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700 backdrop-blur-sm transition-all"
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>
        <SyntaxHighlighter
          style={theme === 'dark' ? oneDark : oneLight}
          language={match[1]}
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
        {/* Background layer to ensure consistent styling regardless of highlighter theme gaps */}
        <div className="absolute inset-0 -z-10 bg-zinc-100 dark:bg-[#282c34]"></div>
      </div>
    );
  }

  return (
    <code className={`${className} bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono`} style={style} {...props}>
      {children}
    </code>
  );
};

const Preview: React.FC<PreviewProps> = ({ content, visible, contentWidth, theme, typography }) => {
  if (!visible) return null;

  // Calculate max-width based on slider value (0-100)
  const getMaxWidth = () => {
    if (contentWidth >= 100) return '100%';
    const minPx = 600;
    const maxPx = 1400;
    const calculated = minPx + (contentWidth / 99) * (maxPx - minPx);
    return `${calculated}px`;
  };

  const { baseSize, scales } = typography;

  return (
    <div className="h-full w-full overflow-y-auto px-6 sm:px-8 pt-24 pb-24 bg-white dark:bg-zinc-950 relative group">
        <div className="absolute top-24 right-4 text-xs text-zinc-300 dark:text-zinc-700 font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            PREVIEW
        </div>
      <div 
        className="mx-auto transition-all duration-300 ease-in-out"
        style={{ maxWidth: getMaxWidth(), width: '100%' }}
      >
        <article className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-zinc-900 dark:prose-a:text-zinc-100 prose-img:rounded-xl prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
            {content ? (
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 style={{ fontSize: `${baseSize * scales.h1}px` }} {...props} />,
                    h2: ({node, ...props}) => <h2 style={{ fontSize: `${baseSize * scales.h2}px` }} {...props} />,
                    h3: ({node, ...props}) => <h3 style={{ fontSize: `${baseSize * scales.h3}px` }} {...props} />,
                    p: ({node, ...props}) => <p style={{ fontSize: `${baseSize}px` }} {...props} />,
                    li: ({node, ...props}) => <li style={{ fontSize: `${baseSize}px` }} {...props} />,
                    code: (props) => <CodeBlock {...props} theme={theme} style={{ fontSize: `${baseSize * scales.code}px` }} />
                  }}
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

export default Preview;
