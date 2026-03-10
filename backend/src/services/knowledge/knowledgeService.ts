import crypto from 'node:crypto';
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

function buildWhere(filter: KnowledgeFilter): Record<string, string> {
  const where: Record<string, string> = {
    orgId: filter.orgId,
  };
  if (filter.moduleSlug) where.moduleSlug = filter.moduleSlug;
  if (filter.board) where.board = filter.board;
  if (filter.classLevel) where.classLevel = filter.classLevel;
  if (filter.subject) where.subject = filter.subject;
  if (filter.title) where.title = filter.title;
  return where;
}

export async function indexPdf(params: {
  buffer: Buffer;
  filter: KnowledgeFilter;
}): Promise<{ chunks: number }> {
  const text = await extractPdfText(params.buffer);
  const chunks = chunkText(text, 1000, 120);
  const embeddings = await Promise.all(chunks.map((chunk) => embed(chunk)));
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
    nResults: 5,
    where: buildWhere(params.filter),
  });
  const answer = await askModel(docs, params.question);
  return { answer, context: docs };
}
