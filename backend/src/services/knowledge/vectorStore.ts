import { ChromaClient } from 'chromadb';
import { env } from '../../config.js';

const client = new ChromaClient({ path: env.CHROMA_HOST });
const COLLECTION_NAME = 'karta_knowledge';

async function getCollection() {
  return client.getOrCreateCollection({ name: COLLECTION_NAME });
}

export async function addDocs(params: {
  ids: string[];
  documents: string[];
  embeddings: number[][];
  metadatas: Array<Record<string, string | number>>;
}) {
  const col = await getCollection();
  await col.add({
    ids: params.ids,
    documents: params.documents,
    embeddings: params.embeddings,
    metadatas: params.metadatas,
  });
}

export async function searchDocs(params: {
  embedding: number[];
  nResults?: number;
  where?: Record<string, string>;
}): Promise<string[]> {
  const col = await getCollection();
  const res = await col.query({
    queryEmbeddings: [params.embedding],
    nResults: params.nResults ?? 5,
    where: params.where,
  });

  return (res.documents?.[0] ?? []) as string[];
}
