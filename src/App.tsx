/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { ImageGen } from './pages/ImageGen';
import { VideoGen } from './pages/VideoGen';
import { Analytics } from './pages/Analytics';
import { Sidebar } from './components/Sidebar';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading DeepDraft...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/image" element={<ImageGen />} />
          <Route path="/video" element={<VideoGen />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
