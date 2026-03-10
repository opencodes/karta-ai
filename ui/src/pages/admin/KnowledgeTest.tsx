import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { askKnowledge, uploadKnowledgeDocument, type KnowledgeAskResponse } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function KnowledgeTestPage() {
  const { token } = useAuth();
  const [knowledgeFile, setKnowledgeFile] = useState<File | null>(null);
  const [knowledgeMeta, setKnowledgeMeta] = useState({
    moduleSlug: '',
    board: '',
    classLevel: '',
    subject: '',
    title: '',
  });
  const [knowledgeQuestion, setKnowledgeQuestion] = useState('');
  const [knowledgeResult, setKnowledgeResult] = useState<KnowledgeAskResponse | null>(null);
  const [knowledgeUploadInfo, setKnowledgeUploadInfo] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function onUploadKnowledge() {
    if (!token || !knowledgeFile) {
      setError('Select a PDF file to upload.');
      return;
    }
    setBusy('knowledge-upload');
    try {
      const result = await uploadKnowledgeDocument(token, {
        file: knowledgeFile,
        moduleSlug: knowledgeMeta.moduleSlug || undefined,
        board: knowledgeMeta.board || undefined,
        classLevel: knowledgeMeta.classLevel || undefined,
        subject: knowledgeMeta.subject || undefined,
        title: knowledgeMeta.title || undefined,
      });
      setKnowledgeUploadInfo(`Indexed ${result.chunks} chunks.`);
      setKnowledgeFile(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload knowledge document');
    } finally {
      setBusy('');
    }
  }

  async function onAskKnowledge() {
    if (!token || !knowledgeQuestion.trim()) return;
    setBusy('knowledge-ask');
    try {
      const result = await askKnowledge(token, {
        question: knowledgeQuestion.trim(),
        moduleSlug: knowledgeMeta.moduleSlug || undefined,
        board: knowledgeMeta.board || undefined,
        classLevel: knowledgeMeta.classLevel || undefined,
        subject: knowledgeMeta.subject || undefined,
        title: knowledgeMeta.title || undefined,
      });
      setKnowledgeResult(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ask knowledge');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">Knowledge Test</h1>
        <p className="text-sm text-slate-400 mt-1">Upload a PDF and ask questions against it.</p>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </Card>

      <Card title="Upload & Index" className="scroll-mt-24">
        <div className="space-y-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setKnowledgeFile(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-200 hover:file:bg-white/20"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={knowledgeMeta.moduleSlug} onChange={(e) => setKnowledgeMeta((prev) => ({ ...prev, moduleSlug: e.target.value }))} placeholder="moduleSlug" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200" />
            <input value={knowledgeMeta.board} onChange={(e) => setKnowledgeMeta((prev) => ({ ...prev, board: e.target.value }))} placeholder="board" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200" />
            <input value={knowledgeMeta.classLevel} onChange={(e) => setKnowledgeMeta((prev) => ({ ...prev, classLevel: e.target.value }))} placeholder="classLevel" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200" />
            <input value={knowledgeMeta.subject} onChange={(e) => setKnowledgeMeta((prev) => ({ ...prev, subject: e.target.value }))} placeholder="subject" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200" />
            <input value={knowledgeMeta.title} onChange={(e) => setKnowledgeMeta((prev) => ({ ...prev, title: e.target.value }))} placeholder="title" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 md:col-span-2" />
          </div>
          <button
            type="button"
            onClick={() => void onUploadKnowledge()}
            disabled={busy === 'knowledge-upload'}
            className="px-3 py-2 rounded-lg text-xs font-semibold btn-primary-ui disabled:opacity-50"
          >
            {busy === 'knowledge-upload' ? 'Uploading...' : 'Upload & Index'}
          </button>
          {knowledgeUploadInfo ? <p className="text-[11px] text-slate-400">{knowledgeUploadInfo}</p> : null}
        </div>
      </Card>

      <Card title="Ask" className="scroll-mt-24">
        <div className="space-y-2">
          <textarea
            value={knowledgeQuestion}
            onChange={(e) => setKnowledgeQuestion(e.target.value)}
            rows={3}
            placeholder="Ask a question"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200"
          />
          <button
            type="button"
            onClick={() => void onAskKnowledge()}
            disabled={busy === 'knowledge-ask'}
            className="px-3 py-2 rounded-lg text-xs font-semibold btn-secondary-ui disabled:opacity-50"
          >
            {busy === 'knowledge-ask' ? 'Asking...' : 'Ask'}
          </button>
          {knowledgeResult ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-100 font-semibold">Answer</p>
              <p className="text-xs text-slate-200 mt-1 whitespace-pre-wrap">{knowledgeResult.answer}</p>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
