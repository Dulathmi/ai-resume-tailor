'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
// ... your other imports

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

      {/* Your Existing Upload Section Below */}
      <div className="bg-zinc-900/20 border border-dashed border-white/10 rounded-[40px] p-12">
          {/* ... put your UploadModal or upload logic here ... */}
          <h3 className="text-center text-zinc-500 font-medium italic">Ready to optimize a new resume?</h3>
      </div>
    </div>
  );
}