export type ContextMatch = {
  content: string;
  source: string;
  score: number;
};

export function scoreContextMatch(query: string, chunk: string): number {
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const normalizedChunk = chunk.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  if (queryTerms.length === 0) {
    return 0;
  }

  const matches = queryTerms.filter((term) => normalizedChunk.includes(term)).length;
  return matches * 1.5 + Math.min(2, chunk.length / 200);
}

export function rankRelevantContext(query: string, chunks: string[], sources: string[] = []): ContextMatch[] {
  return chunks
    .map((content, index) => ({
      content,
      source: sources[index] ?? `private-kb-${index + 1}`,
      score: scoreContextMatch(query, content),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export function buildPrivateChatPrompt(query: string, context: ContextMatch[]): string {
  if (context.length === 0) {
    return `You are a private assistant. The knowledge base is empty for this query: ${query}`;
  }

  const evidence = context
    .map((entry) => `Source: ${entry.source}\n${entry.content}`)
    .join("\n\n");

  return `Answer using only the provided private knowledge.\n\nQuestion: ${query}\n\nRelevant context:\n${evidence}`;
}

export function createChatSessionTitle(query: string): string {
  const cleaned = query.trim();
  if (!cleaned) {
    return "Private chat";
  }

  return cleaned.length > 42 ? `${cleaned.slice(0, 39)}...` : cleaned;
}
