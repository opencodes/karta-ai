import axios from 'axios';
import { env } from '../../config.js';

export async function askModel(context: string[], question: string): Promise<string> {
  const prompt = `Answer using the context below.\n\n${context.join('\n')}\n\nQuestion: ${question}\n`;

  const res = await axios.post(`${env.OLLAMA_HOST}/api/generate`, {
    model: env.OLLAMA_CHAT_MODEL,
    prompt,
    stream: false,
  });

  return String(res.data.response ?? '').trim();
}
