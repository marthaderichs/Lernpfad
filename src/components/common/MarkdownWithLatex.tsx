import React, { useMemo, ReactNode, ComponentType, ReactElement } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import katex from 'katex';
import { splitTextWithLatex, hasLatex } from '../../utils/latexNormalizer';

/**
 * Props for MarkdownWithLatex component
 */
interface MarkdownWithLatexProps {
    /** Markdown content that may contain LaTeX */
    children: string;
    /** Additional CSS classes for the container */
    className?: string;
}

/**
 * Renders a single text node with LaTeX support
 */
const renderLatexInText = (text: string): ReactNode[] => {
    if (!hasLatex(text)) {
        return [text];
    }

    const segments = splitTextWithLatex(text);

    return segments.map((segment, index) => {
        if (segment.type === 'text') {
            return segment.content;
        }

        const isDisplay = segment.type === 'latex-display';

        try {
            const html = katex.renderToString(segment.content, {
                displayMode: isDisplay,
                throwOnError: false,
                errorColor: '#FF8B8B',
                strict: false,
                trust: false,
                macros: {
                    "\\R": "\\mathbb{R}",
                    "\\N": "\\mathbb{N}",
                    "\\Z": "\\mathbb{Z}",
                    "\\Q": "\\mathbb{Q}",
                    "\\C": "\\mathbb{C}",
                }
            });

            if (isDisplay) {
                return (
                    <div
                        key={index}
                        className="latex-display my-4 overflow-x-auto py-2 text-center"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                );
            } else {
                return (
                    <span
                        key={index}
                        className="latex-inline"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                );
            }
        } catch (error) {
            console.warn('LaTeX rendering error:', error);
            return (
                <span
                    key={index}
                    className="text-brand-red bg-red-50 px-1 rounded font-mono text-sm"
                >
                    {isDisplay ? `$$${segment.content}$$` : `$${segment.content}$`}
                </span>
            );
        }
    });
};

/**
 * Recursively process React children to add LaTeX support
 */
const processChildren = (children: ReactNode): ReactNode => {
    if (typeof children === 'string') {
        const rendered = renderLatexInText(children);
        // If it's just a single string with no LaTeX, return as-is
        if (rendered.length === 1 && typeof rendered[0] === 'string') {
            return children;
        }
        return <>{rendered}</>;
    }

    if (Array.isArray(children)) {
        return children.map((child, index) => {
            const processed = processChildren(child);
            // Wrap in fragment with key if needed
            if (processed !== child) {
                return <React.Fragment key={index}>{processed}</React.Fragment>;
            }
            return child;
        });
    }

    if (React.isValidElement(children)) {
        const element = children as ReactElement<{ children?: ReactNode }>;
        if (element.props && element.props.children) {
            return React.cloneElement(element, {
                ...element.props,
                children: processChildren(element.props.children)
            });
        }
    }

    return children;
};

/**
 * Create a wrapped component that processes children for LaTeX
 */
const createLatexWrapper = <T extends keyof JSX.IntrinsicElements>(
    Component: T
): ComponentType<JSX.IntrinsicElements[T]> => {
    return (props: JSX.IntrinsicElements[T]) => {
        const { children, ...rest } = props as { children?: ReactNode };
        const processedChildren = processChildren(children);
        return React.createElement(Component, rest as any, processedChildren);
    };
};

/**
 * MarkdownWithLatex - A Markdown renderer with seamless LaTeX support.
 * 
 * This component combines react-markdown with KaTeX for LaTeX math rendering.
 * It handles both inline ($...$) and display ($$...$$) math within markdown content.
 * 
 * Features:
 * - Full Markdown support via react-markdown with GFM
 * - Inline LaTeX: $E = mc^2$
 * - Display LaTeX: $$\int_0^1 x^2 dx = \frac{1}{3}$$
 * - Robust handling of JSON-escaped content
 * - Graceful error fallback for malformed LaTeX
 * 
 * @example
 * <MarkdownWithLatex>
 *   {"# Math Lesson\n\nThe quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$"}
 * </MarkdownWithLatex>
 */
export const MarkdownWithLatex: React.FC<MarkdownWithLatexProps> = ({
    children,
    className = ''
}) => {
    // Custom components that process LaTeX in their text content
    const components = useMemo<Partial<Components>>(() => ({
        // Handle paragraphs which contain most text
        p: ({ children: pChildren, ...props }) => {
            const processed = processChildren(pChildren);
            return <p {...props}>{processed}</p>;
        },
        // Handle list items
        li: ({ children: liChildren, ...props }) => {
            const processed = processChildren(liChildren);
            return <li {...props}>{processed}</li>;
        },
        // Handle headings
        h1: ({ children: hChildren, ...props }) => {
            const processed = processChildren(hChildren);
            return <h1 {...props}>{processed}</h1>;
        },
        h2: ({ children: hChildren, ...props }) => {
            const processed = processChildren(hChildren);
            return <h2 {...props}>{processed}</h2>;
        },
        h3: ({ children: hChildren, ...props }) => {
            const processed = processChildren(hChildren);
            return <h3 {...props}>{processed}</h3>;
        },
        h4: ({ children: hChildren, ...props }) => {
            const processed = processChildren(hChildren);
            return <h4 {...props}>{processed}</h4>;
        },
        // Handle table cells
        td: ({ children: tdChildren, ...props }) => {
            const processed = processChildren(tdChildren);
            return <td {...props}>{processed}</td>;
        },
        th: ({ children: thChildren, ...props }) => {
            const processed = processChildren(thChildren);
            return <th {...props}>{processed}</th>;
        },
        // Handle strong/bold
        strong: ({ children: strongChildren, ...props }) => {
            const processed = processChildren(strongChildren);
            return <strong {...props}>{processed}</strong>;
        },
        // Handle emphasis/italic
        em: ({ children: emChildren, ...props }) => {
            const processed = processChildren(emChildren);
            return <em {...props}>{processed}</em>;
        },
        // Handle blockquotes
        blockquote: ({ children: bqChildren, ...props }) => {
            const processed = processChildren(bqChildren);
            return <blockquote {...props}>{processed}</blockquote>;
        },
        // Handle spans
        span: ({ children: spanChildren, ...props }) => {
            const processed = processChildren(spanChildren);
            return <span {...props}>{processed}</span>;
        },
    }), []);

    if (!children) {
        return null;
    }

    return (
        <div className={`markdown-with-latex ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownWithLatex;
