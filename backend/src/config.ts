import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const normalizeHttpUrl = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  return withScheme.replace(/\/+$/, '');
};

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isWildcardHost = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.hostname === '0.0.0.0' || url.hostname === '::';
  } catch {
    return false;
  }
};

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  MYSQL_HOST: z.string(),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  HF_TOKEN: z.preprocess((val) => (val === '' ? undefined : val), z.string().optional()).default(undefined),
  HF_MODEL: z.string().default('meta-llama/Llama-3.1-8B-Instruct'),
  HF_OCR_MODEL: z.string().default('deepseek-ai/DeepSeek-OCR'),
  HF_VISION_MODEL: z.string().default('Qwen/Qwen2.5-VL-7B-Instruct'),
  HF_MAX_TOKENS: z.coerce.number().default(2000),
  OLLAMA_BASE_URL: z
    .preprocess(normalizeHttpUrl, z.string())
    .refine(isValidHttpUrl, { message: 'OLLAMA_BASE_URL must be a valid http(s) URL.' })
    .refine((value) => !isWildcardHost(value), {
      message: 'OLLAMA_BASE_URL cannot use a wildcard host (0.0.0.0 or ::). Use a real address.',
    })
    .default('http://localhost:11434'),
  OLLAMA_EMBED_MODEL: z.string().default('nomic-embed-text'),
  OLLAMA_CHAT_MODEL: z.string().default('llama3'),
  OLLAMA_NUM_PREDICT: z.coerce.number().int().positive().default(256),
  KNOWLEDGE_TOP_K: z.coerce.number().int().positive().default(3),
  KNOWLEDGE_MAX_CONTEXT_CHARS: z.coerce.number().int().positive().default(4000),
  CHROMA_HOST: z
    .preprocess(normalizeHttpUrl, z.string())
    .refine(isValidHttpUrl, { message: 'CHROMA_HOST must be a valid http(s) URL.' })
    .refine((value) => !isWildcardHost(value), {
      message: 'CHROMA_HOST cannot use a wildcard host (0.0.0.0 or ::). Use a real address.',
    })
    .default('http://localhost:8000'),
});

const envInput = {
  ...process.env,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL ?? process.env.OLLAMA_HOST,
};

const parsed = envSchema.safeParse(envInput);
if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
  const setupHint = [
    '',
    '[Config Error] Missing/invalid environment variables.',
    `Required: ${missing}`,
    '',
    'Setup steps:',
    '1) Copy backend/.env.example to backend/.env',
    '2) Fill in MySQL and JWT values in backend/.env',
    '3) Restart the backend server',
    '',
    'Example:',
    'cp backend/.env.example backend/.env',
    '',
  ].join('\n');

  // Print a user-friendly setup message instead of a stack trace.
  console.error(setupHint);
  process.exit(1);
}

export const env = parsed.data;
