import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebaseClient';
import { Image as ImageIcon, Loader2, Download } from 'lucide-react';
import { motion } from 'motion/react';

export const ImageGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError('');
    setImageUrl(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      
      setImageUrl(data.url);
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
          <ImageIcon className="w-8 h-8 text-blue-500" /> Image Generation
        </h1>
        <p className="text-slate-400 mt-2">DALL-E 3 Powered. Costs 5 Credits per image.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <form onSubmit={generateImage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Image Prompt</label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              placeholder="A futuristic city cyberpunk neon lights..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !prompt.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            Generate Image
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-400">Pondering the prompt...</p>
          </div>
        )}

        {imageUrl && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 pt-8 border-t border-slate-800"
          >
            <div className="relative group rounded-xl overflow-hidden aspect-square max-w-lg mx-auto bg-slate-950 border border-slate-800">
              <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a href={imageUrl} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white transition-colors">
                  <Download className="w-6 h-6" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
