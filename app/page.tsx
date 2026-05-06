'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './utils/supabase';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for any change in the auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    // 2. Also do an initial check to see if the user is already here
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      if (user) {
        router.push('/dashboard');
      }
    };
    
    checkUser();

    // Clean up the listener when the page is closed
    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
      <div className="animate-pulse text-xl font-light tracking-widest uppercase">Initializing...</div>
    </div>
  );

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black p-4 text-white">
      
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <header className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            AI Resume Tailor
          </h1>
          <p className="mt-2 text-sm text-zinc-400 font-light">Optimize your career path with AI.</p>
        </header>

        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3 font-bold text-black transition-all hover:bg-zinc-200 active:scale-95"
          >
            Sign in with GitHub
          </button>
          <p className="text-center text-[10px] uppercase tracking-widest text-zinc-600 font-medium">
            Secure Authentication via Supabase
          </p>
        </div>
      </div>
    </main>
  );
}