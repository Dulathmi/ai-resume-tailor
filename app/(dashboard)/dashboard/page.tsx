'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, highest: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('analysis_reports').select('match_score');
      if (data) {
        const highest = Math.max(...data.map(r => r.match_score), 0);
        setStats({ total: data.length, highest });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/40 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Total Analyses</p>
          <h2 className="text-5xl font-black text-white">{stats.total}</h2>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 p-8 rounded-[32px] backdrop-blur-xl">
          <p className="text-purple-400 text-xs font-black uppercase tracking-widest mb-2">Best Match</p>
          <h2 className="text-5xl font-black text-white">{stats.highest}%</h2>
        </div>
      </div>

      {/* Hero Action Section - Updated for beauty and attraction */}
      <div className="relative group overflow-hidden bg-zinc-900/20 border border-white/5 rounded-[40px] p-12 transition-all duration-500 hover:border-purple-500/20">
        {/* Background Decoration */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full group-hover:bg-purple-600/20 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span className="text-4xl">🚀</span>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Crush the Competition?</span>
            </h3>
            <p className="text-zinc-500 text-xs font-medium max-w-md mx-auto uppercase tracking-widest leading-relaxed">
              Upload a new job description and let Gemini architect the perfect resume for your next career move.
            </p>
          </div>

          <Link href="/tailor">
            <button className="px-10 py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
              Start New Analysis
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}