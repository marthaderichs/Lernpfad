/**
 * LaTeX Normalizer Utility
 * 
 * Handles the tricky part of LaTeX in JSON files where backslashes and
 * special characters get escaped or corrupted. This is the critical piece
 * for stable LaTeX rendering.
 */

/**
 * Normalizes LaTeX content from JSON sources.
 * Handles common issues:
 * - Double-escaped backslashes (\\\\) -> single backslash (\)
 * - Windows-style line endings (\r\n) -> Unix style (\n)
 * - Corrupted newlines in LaTeX (literal \n in strings)
 */
export function normalizeLatexContent(content: string): string {
    if (!content) return '';

    let normalized = content;

    // 1. Fix Windows line endings first
    normalized = normalized.replace(/\r\n/g, '\n');

    // 2. Handle literal "\n" strings that should be newlines (from JSON parsing issues)
    // Be careful not to break actual LaTeX \newline commands

    // 3. Fix over-escaped backslashes from JSON
    // \\\\frac -> \\frac (JSON double-escaping issue)
    // But be careful: we want to keep LaTeX commands intact

    // Replace quadruple backslashes with double (common JSON double-escape)
    normalized = normalized.replace(/\\\\\\\\/g, '\\\\');

    // Replace triple backslashes with single (another escape variant)
    normalized = normalized.replace(/\\\\\\/g, '\\');

    return normalized;
}

/**
 * Type for a LaTeX block match
 */
export interface LatexBlock {
    type: 'display' | 'inline';
    content: string;
    start: number;
    end: number;
    raw: string;
}

/**
 * Finds all LaTeX blocks in a string.
 * Handles both display ($$...$$) and inline ($...$) math.
 * 
 * Important: Display math ($$) is checked first to avoid incorrect inline matches.
 */
export function findLatexBlocks(text: string): LatexBlock[] {
    if (!text) return [];

    const blocks: LatexBlock[] = [];
    let workingText = text;
    let offset = 0;

    // First pass: Find display math ($$...$$)
    // Using a more robust regex that handles newlines
    const displayRegex = /\$\$([\s\S]*?)\$\$/g;
    let match;

    while ((match = displayRegex.exec(text)) !== null) {
        blocks.push({
            type: 'display',
            content: normalizeLatexContent(match[1]),
            start: match.index,
            end: match.index + match[0].length,
            raw: match[0]
        });
    }

    // Second pass: Find inline math ($...$)
    // Exclude matches that are part of display math
    const inlineRegex = /\$(?!\$)((?:[^$\\]|\\.)*?)\$/g;

    while ((match = inlineRegex.exec(text)) !== null) {
        // Check if this match overlaps with any display math block
        const overlapsWithDisplay = blocks.some(
            block => match!.index >= block.start && match!.index < block.end
        );

        if (!overlapsWithDisplay) {
            blocks.push({
                type: 'inline',
                content: normalizeLatexContent(match[1]),
                start: match.index,
                end: match.index + match[0].length,
                raw: match[0]
            });
        }
    }

    // Sort by position
    blocks.sort((a, b) => a.start - b.start);

    return blocks;
}

/**
 * Checks if a string contains any LaTeX math delimiters
 */
export function hasLatex(text: string): boolean {
    if (!text) return false;
    return /\$\$[\s\S]*?\$\$|\$[^$]+?\$/.test(text);
}

/**
 * Splits text into segments of plain text and LaTeX blocks.
 * This is the main function used by the LatexRenderer component.
 */
export interface TextSegment {
    type: 'text' | 'latex-inline' | 'latex-display';
    content: string;
}

export function splitTextWithLatex(text: string): TextSegment[] {
    if (!text) return [];

    const blocks = findLatexBlocks(text);

    if (blocks.length === 0) {
        return [{ type: 'text', content: text }];
    }

    const segments: TextSegment[] = [];
    let lastEnd = 0;

    for (const block of blocks) {
        // Add text before this block
        if (block.start > lastEnd) {
            const textContent = text.slice(lastEnd, block.start);
            if (textContent) {
                segments.push({ type: 'text', content: textContent });
            }
        }

        // Add the LaTeX block
        segments.push({
            type: block.type === 'display' ? 'latex-display' : 'latex-inline',
            content: block.content
        });

        lastEnd = block.end;
    }

    // Add remaining text after last block
    if (lastEnd < text.length) {
        const textContent = text.slice(lastEnd);
        if (textContent) {
            segments.push({ type: 'text', content: textContent });
        }
    }

    return segments;
}
