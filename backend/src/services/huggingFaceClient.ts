import { env } from '../config.js';

const ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';
const INFERENCE_URL = 'https://api-inference.huggingface.co/models';

export class HuggingFaceClient {
  private token: string | null;
  private model: string;

  constructor() {
    this.token = env.HF_TOKEN;
    this.model = env.HF_MODEL;
  }

  isAvailable(): boolean {
    return Boolean(this.token);
  }

  async generate(prompt: string, maxTokens = 300): Promise<string | null> {
    if (!this.token) {
      return null;
    }

    const chat = await this.chatCompletions(prompt, maxTokens);
    if (chat) {
      return chat;
    }

    return this.textGeneration(prompt, maxTokens);
  }

  private async chatCompletions(prompt: string, maxTokens: number): Promise<string | null> {
    const payload = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: maxTokens,
    };

    const res = await this.postJson(ROUTER_URL, payload);
    if (!res || !res.ok) {
      return null;
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    return content?.trim() ?? null;
  }

  private async textGeneration(prompt: string, maxTokens: number): Promise<string | null> {
    const payload = {
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens,
        return_full_text: false,
      },
    };

    const res = await this.postJson(`${INFERENCE_URL}/${this.model}`, payload);
    if (!res || !res.ok) {
      return null;
    }

    const data = (await res.json()) as
      | Array<{ generated_text?: string }>
      | { generated_text?: string };

    if (Array.isArray(data)) {
      return data[0]?.generated_text?.trim() ?? null;
    }
    return data.generated_text?.trim() ?? null;
  }

  private async postJson(url: string, payload: unknown): Promise<Response | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      return res;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
