import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Image as ImageIcon, Video, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
  const { signOut, profile } = useAuth();
  
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { to: '/image', icon: ImageIcon, label: 'Image Gen' },
    { to: '/video', icon: Video, label: 'Video Gen' },
    { to: '/analytics', icon: Activity, label: 'Analytics' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold font-sans text-white tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-md"></div>
          DeepDraft AI
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {links.map((item) => (
          <NavLink 
            key={item.to}
            to={item.to}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 px-3 py-3 bg-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 mb-1 font-mono uppercase tracking-wider">Credits Remaining</div>
          <div className="text-xl font-semibold text-white">{profile?.credits ?? 0}</div>
        </div>
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
