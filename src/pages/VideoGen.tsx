import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebaseClient';
import { Video, Loader2, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const VideoGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const generateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError('');
    setVideoUrl(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      
      setVideoUrl(data.url);
      if (data.note) setNote(data.note);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Video className="w-8 h-8 text-purple-500" /> Video Synthesis
        </h1>
        <p className="text-slate-400 mt-2">Sora Powered Model. Costs 20 Credits per video.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <form onSubmit={generateVideo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Video Prompt</label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              placeholder="A futuristic aerial flythrough of neon-lit Tokyo in rain, highly detailed..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !prompt.trim()}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
            Synthesize Video
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-slate-400">Rendering video frames...</p>
          </div>
        )}

        {videoUrl && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 pt-8 border-t border-slate-800"
          >
            {note && (
              <div className="mb-4 bg-blue-900/20 border border-blue-800/50 text-blue-300 p-3 rounded-xl text-sm flex items-start gap-2">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p>{note}</p>
              </div>
            )}
            <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-800">
              <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover shadow-xl" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
