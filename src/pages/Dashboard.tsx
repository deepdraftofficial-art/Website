import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { MessageSquare, ImageIcon, Video, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  
  const features = [
    { name: 'AI Chat', desc: 'GPT-4 powered conversational assistant', icon: MessageSquare, to: '/chat', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Image Gen', desc: 'DALL-E 3 image generation', icon: ImageIcon, to: '/image', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Video Gen', desc: 'Sora-based video synthesis', icon: Video, to: '/video', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Analytics', desc: 'Your usage metrics and history', icon: Activity, to: '/analytics', color: 'text-orange-500', bg: 'bg-orange-500/10' }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-slate-400 mt-2">Welcome back. You have <span className="text-white font-mono">{profile?.credits ?? 0}</span> credits remaining in your {profile?.subscriptionTier} tier.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((f, i) => (
          <Link key={f.name} to={f.to}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group border border-slate-800 bg-slate-900 rounded-2xl p-6 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${f.bg} ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">{f.name}</h3>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};
