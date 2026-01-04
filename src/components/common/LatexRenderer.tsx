import React, { useMemo } from 'react';
import katex from 'katex';
import { splitTextWithLatex, TextSegment } from '../../utils/latexNormalizer';

/**
 * Props for the LatexRenderer component
 */
interface LatexRendererProps {
    /** The text content that may contain LaTeX (with $ or $$ delimiters) */
    children: string;
    /** Additional CSS classes for the container */
    className?: string;
    /** Error handling mode: 'warn' logs errors, 'ignore' silently fails, 'error' throws */
    errorMode?: 'warn' | 'ignore' | 'error';
}

/**
 * Renders LaTeX math expressions using KaTeX.
 * 
 * Supports:
 * - Inline math: $...$
 * - Display math: $$...$$
 * 
 * Handles edge cases from JSON imports where backslashes may be double-escaped.
 * 
 * @example
 * <LatexRenderer>The formula $E = mc^2$ is famous.</LatexRenderer>
 * <LatexRenderer>$$\int_0^1 x^2 dx$$</LatexRenderer>
 */
export const LatexRenderer: React.FC<LatexRendererProps> = ({
    children,
    className = '',
    errorMode = 'warn'
}) => {
    const renderedContent = useMemo(() => {
        if (!children || typeof children !== 'string') {
            return null;
        }

        const segments = splitTextWithLatex(children);

        return segments.map((segment, index) => {
            if (segment.type === 'text') {
                return <span key={index}>{segment.content}</span>;
            }

            const isDisplay = segment.type === 'latex-display';

            try {
                const html = katex.renderToString(segment.content, {
                    displayMode: isDisplay,
                    throwOnError: errorMode === 'error',
                    errorColor: '#FF8B8B', // brand-red
                    strict: false, // Be lenient with unknown commands
                    trust: false, // Don't trust HTML in LaTeX
                    macros: {
                        // Common macros that might be used
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
                            className="latex-display my-4 overflow-x-auto py-2"
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
                if (errorMode === 'warn') {
                    console.warn('LaTeX rendering error:', error, 'Content:', segment.content);
                }

                // Return the original content with error styling
                return (
                    <span
                        key={index}
                        className="text-brand-red bg-red-50 px-1 rounded font-mono text-sm"
                        title={error instanceof Error ? error.message : 'LaTeX Error'}
                    >
                        {isDisplay ? `$$${segment.content}$$` : `$${segment.content}$`}
                    </span>
                );
            }
        });
    }, [children, errorMode]);

    return (
        <span className={`latex-container ${className}`}>
            {renderedContent}
        </span>
    );
};

export default LatexRenderer;
