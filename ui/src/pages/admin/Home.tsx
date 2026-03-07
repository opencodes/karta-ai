import React, { useRef, useState } from 'react';
import { Bot, LoaderCircle, User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { createTask } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  tone?: 'normal' | 'status';
};

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div className={isUser ? 'max-w-[90%] rounded-2xl bg-teal text-black px-4 py-3' : 'max-w-[90%] rounded-2xl bg-white/5 border border-white/10 px-4 py-3'}>
        <div className="flex items-center gap-2 mb-1">
          {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-teal" />}
          <span className={isUser ? 'text-[11px] font-semibold uppercase tracking-wide text-black/70' : 'text-[11px] font-semibold uppercase tracking-wide text-slate-400'}>
            {isUser ? 'You' : 'Karta'}
          </span>
          {message.tone === 'status' ? <LoaderCircle className="w-3.5 h-3.5 animate-spin text-teal" /> : null}
        </div>
        <p className={isUser ? 'text-sm leading-relaxed text-black' : 'text-sm leading-relaxed text-slate-200'}>{message.text}</p>
      </div>
    </div>
  );
}

export const AdminHome = () => {
  const { token, logout } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Describe a task in one sentence. I will parse and schedule it for execution.',
    },
  ]);

  function scrollToBottom() {
    window.requestAnimationFrame(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }

  async function submitTask() {
    const trimmed = input.trim();
    if (!trimmed || isProcessing || !token) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
    };

    const processingId = crypto.randomUUID();
    const processingMessage: ChatMessage = {
      id: processingId,
      role: 'assistant',
      text: 'We are processing your request.',
      tone: 'status',
    };

    setMessages((prev) => [...prev, userMessage, processingMessage]);
    setInput('');
    setIsProcessing(true);
    scrollToBottom();

    try {
      const response = await createTask(token, trimmed);
      const completionMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `Task added: "${response.task.title}". You can view it in the ToDo page from the sidebar for more details.`,
      };
      setMessages((prev) => [...prev.filter((msg) => msg.id !== processingId), completionMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      if (errorMessage.toLowerCase().includes('unauthorized')) {
        logout();
      }
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== processingId),
        { id: crypto.randomUUID(), role: 'assistant', text: `Error: ${errorMessage}` },
      ]);
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
      scrollToBottom();
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <Card className="p-0 flex flex-col flex-1 min-h-0">
        <div className="px-6 py-4 border-b border-white/10">
          <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">Karta Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">Chat-style task intake for admin execution.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          <div ref={chatBottomRef} />
        </div>

        <footer className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 h-12 px-3 rounded-xl bg-white/5 border border-white/10 focus-within:border-teal/40 transition-colors">
            <span className="text-teal text-sm font-bold tracking-wide whitespace-nowrap shrink-0">Karta {'>'}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void submitTask();
                }
              }}
              placeholder="Type a task, e.g. Pay electricity bill tomorrow at 4 PM"
              className="w-full bg-transparent outline-none text-heading placeholder:text-slate-500"
              disabled={isProcessing}
            />
            <button
              type="button"
              onClick={() => void submitTask()}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary-ui whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              {isProcessing ? 'Processing...' : 'Execute'}
            </button>
          </div>
        </footer>
      </Card>
    </div>
  );
};
