'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

export default function JobMatchesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data } = await supabase
        .from('analysis_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      setReports(data || []);
      setLoading(false);
    };
    fetchReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
          Match <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">History</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Review your compatibility scores and AI suggestions.</p>
      </header>

      {loading ? (
        <div className="flex gap-4">
            <div className="w-full h-40 bg-white/5 rounded-3xl animate-pulse"></div>
        </div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="group bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] hover:border-purple-500/40 transition-all duration-500 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
                <div className={`text-2xl font-black ${report.match_score > 70 ? 'text-green-400' : 'text-orange-400'}`}>
                  {report.match_score}%
                </div>
              </div>
              
              <h3 className="text-white font-bold text-lg mb-1 truncate">{report.resume_name}</h3>
              <p className="text-purple-400 text-[10px] uppercase font-black tracking-[0.2em] mb-6">AI Verified Match</p>
              
              <div className="text-zinc-400 text-xs line-clamp-4 italic mb-8 font-light leading-relaxed border-l-2 border-white/5 pl-4">
                {report.report_content.substring(0, 200)}...
              </div>

              <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all duration-300">
                View Deep Insights
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/20 border border-dashed border-white/10 rounded-[40px] p-20 text-center">
            <p className="text-zinc-600 italic text-sm">Your match history is empty. Start by tailoring a resume!</p>
        </div>
      )}
    </div>
  );
}