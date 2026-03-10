import axios from 'axios';
import { env } from '../../config.js';

export async function embed(text: string): Promise<number[]> {
  const res = await axios.post(`${env.OLLAMA_HOST}/api/embeddings`, {
    model: env.OLLAMA_EMBED_MODEL,
    prompt: text,
  });

  return res.data.embedding as number[];
}
