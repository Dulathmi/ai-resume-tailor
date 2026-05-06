'use client';
import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
      <div className="animate-pulse text-xl font-light tracking-widest">LOADING...</div>
    </div>
  );

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black p-4 text-white">
      
      {/* Main Glass Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <header className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            AI Resume Tailor
          </h1>
          <p className="mt-2 text-sm text-zinc-400">Optimize your career path with AI.</p>
        </header>

        {user ? (
          <div className="space-y-6 text-center">
            <div className="rounded-lg bg-white/5 p-4 border border-white/5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Account</p>
              <p className="mt-1 font-medium text-zinc-200">{user.email}</p>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="w-full rounded-xl bg-red-500/10 py-3 font-semibold text-red-400 border border-red-500/20 transition-all hover:bg-red-500 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3 font-bold text-black transition-all hover:bg-zinc-200"
            >
              Sign in with GitHub
            </button>
            <p className="text-center text-xs text-zinc-500">
              Securely authenticate to manage your resumes.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}