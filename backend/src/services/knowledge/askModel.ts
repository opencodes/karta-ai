import axios from 'axios';
import { env } from '../../config.js';

export async function askModel(context: string[], question: string): Promise<string> {
  const maxChars = env.KNOWLEDGE_MAX_CONTEXT_CHARS;
  let contextText = '';
  for (const doc of context) {
    const separator = contextText ? '\n' : '';
    const available = maxChars - contextText.length - separator.length;
    if (available <= 0) break;
    contextText += separator + doc.slice(0, available);
  }

  const prompt = `Answer using the context below.\n\n${contextText}\n\nQuestion: ${question}\n`;

  const res = await axios.post(`${env.OLLAMA_BASE_URL}/api/generate`, {
    model: env.OLLAMA_CHAT_MODEL,
    prompt,
    stream: false,
    options: { num_predict: env.OLLAMA_NUM_PREDICT },
  });

  return String(res.data.response ?? '').trim();
}
