import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebaseClient';
import { motion } from 'motion/react';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import Markdown from 'react-markdown';

export const Chat: React.FC = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch response');
      
      setMessages(prev => [...prev, data]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Chat</h1>
        <p className="text-sm text-slate-400">Powered by GPT-4 Model API. Costs 1 Credit per response.</p>
      </header>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-500 italic">
              Send a message to start conversing with the AI.
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                {m.role === 'user' ? (
                  m.content
                ) : (
                  <div className="markdown-body text-sm prose prose-invert">
                    <Markdown>{m.content}</Markdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={sendMessage} className="relative mt-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your message..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="absolute right-3 top-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
