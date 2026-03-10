import crypto from 'node:crypto';
import { env } from '../../config.js';
import { extractPdfText } from './extractPdfText.js';
import { chunkText } from './chunkText.js';
import { embed } from './embed.js';
import { addDocs, searchDocs } from './vectorStore.js';
import { askModel } from './askModel.js';

export type KnowledgeFilter = {
  orgId: string;
  moduleSlug?: string;
  board?: string;
  classLevel?: string;
  subject?: string;
  title?: string;
};

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const current = nextIndex++;
      if (current >= items.length) break;
      results[current] = await worker(items[current], current);
    }
  });
  await Promise.all(runners);
  return results;
}

function buildWhere(filter: KnowledgeFilter): Record<string, string> | { $and: Array<Record<string, string>> } {
  const where: Record<string, string> = {
    orgId: String(filter.orgId),
  };
  if (filter.moduleSlug) where.moduleSlug = String(filter.moduleSlug);
  if (filter.board) where.board = String(filter.board);
  if (filter.classLevel) where.classLevel = String(filter.classLevel);
  if (filter.subject) where.subject = String(filter.subject);
  if (filter.title) where.title = String(filter.title);
  const entries = Object.entries(where);
  if (entries.length <= 1) return where;
  return { $and: entries.map(([key, value]) => ({ [key]: value })) };
}

export async function indexPdf(params: {
  buffer: Buffer;
  filter: KnowledgeFilter;
}): Promise<{ chunks: number }> {
  const text = await extractPdfText(params.buffer);
  const chunks = chunkText(text, 1000, 120);
  const embeddings = await mapWithConcurrency(chunks, 3, (chunk) => embed(chunk));
  const ids = chunks.map(() => crypto.randomUUID());
  const where = buildWhere(params.filter);
  const metadatas = chunks.map((_, idx) => ({ ...where, chunk: idx }));

  await addDocs({ ids, documents: chunks, embeddings, metadatas });

  return { chunks: chunks.length };
}

export async function askKnowledge(params: {
  question: string;
  filter: KnowledgeFilter;
}): Promise<{ answer: string; context: string[] }> {
  const queryEmbedding = await embed(params.question);
  const docs = await searchDocs({
    embedding: queryEmbedding,
    nResults: env.KNOWLEDGE_TOP_K,
    where: buildWhere(params.filter),
  });
  const answer = await askModel(docs, params.question);
  return { answer, context: docs };
}
