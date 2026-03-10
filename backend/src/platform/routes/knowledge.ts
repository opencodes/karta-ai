import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { askKnowledge, indexPdf } from '../../services/knowledge/knowledgeService.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf' && file.mimetype !== 'application/x-pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    return cb(null, true);
  },
});

const uploadSchema = z.object({
  moduleSlug: z.string().trim().min(1).optional(),
  board: z.string().trim().min(1).max(120).optional(),
  classLevel: z.string().trim().min(1).max(40).optional(),
  subject: z.string().trim().min(1).max(120).optional(),
  title: z.string().trim().min(1).max(255).optional(),
});

const askSchema = z.object({
  question: z.string().trim().min(1),
  moduleSlug: z.string().trim().min(1).optional(),
  board: z.string().trim().min(1).max(120).optional(),
  classLevel: z.string().trim().min(1).max(40).optional(),
  subject: z.string().trim().min(1).max(120).optional(),
  title: z.string().trim().min(1).max(255).optional(),
});

export const knowledgeRouter = Router();

knowledgeRouter.use(requireAuth);

knowledgeRouter.post('/upload', upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'book', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]), async (req, res) => {
  const authed = (req as AuthedRequest).user;
  const orgId = authed.organizationId ?? null;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const files = (req as { files?: Record<string, Array<{ buffer: Buffer; mimetype: string; originalname: string }>> }).files ?? {};
  const file = files.document?.[0] ?? files.book?.[0] ?? files.file?.[0];
  if (!file) {
    return res.status(400).json({ error: 'Missing PDF upload' });
  }

  const filter = {
    orgId,
    moduleSlug: parsed.data.moduleSlug,
    board: parsed.data.board,
    classLevel: parsed.data.classLevel,
    subject: parsed.data.subject,
    title: parsed.data.title,
  };

  const result = await indexPdf({ buffer: file.buffer, filter });
  return res.status(201).json({ message: 'Document indexed', chunks: result.chunks });
});

knowledgeRouter.post('/ask', async (req, res) => {
  const authed = (req as AuthedRequest).user;
  const orgId = authed.organizationId ?? null;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = askSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const filter = {
    orgId,
    moduleSlug: parsed.data.moduleSlug,
    board: parsed.data.board,
    classLevel: parsed.data.classLevel,
    subject: parsed.data.subject,
    title: parsed.data.title,
  };

  const result = await askKnowledge({ question: parsed.data.question, filter });
  return res.json({ answer: result.answer, context: result.context });
});
