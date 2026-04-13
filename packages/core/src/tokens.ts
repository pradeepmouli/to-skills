/**
 * Rough token estimate: ~4 chars per token for English/code.
 * Not exact, but good enough for budgeting skill file sizes.
 *
 * @category Token Management
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within a token budget, preserving complete lines.
 *
 * @category Token Management
 */
export function truncateToTokenBudget(text: string, maxTokens: number): string {
  if (estimateTokens(text) <= maxTokens) return text;

  const maxChars = maxTokens * 4;
  const truncated = text.slice(0, maxChars);
  const lastNewline = truncated.lastIndexOf('\n');

  if (lastNewline > 0) {
    return truncated.slice(0, lastNewline) + '\n\n<!-- truncated -->\n';
  }

  return truncated + '\n\n<!-- truncated -->\n';
}
