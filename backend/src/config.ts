import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

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
  HF_MODEL: z.string().default('mistralai/Mistral-7B-Instruct-v0.2'),
  HF_MAX_TOKENS: z.coerce.number().default(300),
});

const parsed = envSchema.safeParse(process.env);

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
