import axios from 'axios';
import { env } from '../../config.js';

export async function embed(text: string): Promise<number[]> {
  console.log("Embed Url", env.OLLAMA_BASE_URL)
  const res = await axios.post(`${env.OLLAMA_BASE_URL}/api/embeddings`, {
    model: env.OLLAMA_EMBED_MODEL,
    prompt: text,
  });

  return res.data.embedding as number[];
}
