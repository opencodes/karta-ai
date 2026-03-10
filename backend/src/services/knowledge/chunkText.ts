export function chunkText(text: string, size = 1000, overlap = 100): string[] {
  const chunks: string[] = [];
  if (!text) return chunks;
  const safeSize = Math.max(200, size);
  const safeOverlap = Math.max(0, Math.min(overlap, safeSize - 1));

  for (let i = 0; i < text.length; i += safeSize - safeOverlap) {
    const chunk = text.slice(i, i + safeSize).trim();
    if (chunk.length > 0) chunks.push(chunk);
  }

  return chunks;
}
