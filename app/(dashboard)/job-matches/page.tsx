'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

export default function JobMatchesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('analysis_reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    
    const { error } = await supabase
      .from('analysis_reports')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Delete failed");
    } else {
      // Refresh the list locally after deleting
      setReports(reports.filter(r => r.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
            Match <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">History</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold text-[10px]">Neural Records</p>
        </div>
      </header>

      {loading ? (
        <div className="text-zinc-600 animate-pulse text-xs uppercase tracking-widest">Accessing Database...</div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="relative group bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] hover:border-purple-500/40 transition-all duration-500">
              
              {/* Delete Button */}
              <button 
                onClick={() => handleDelete(report.id)}
                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-10"
                title="Delete Report"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>

              <div className="flex justify-between items-start mb-6">
                <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
                <div className={`text-2xl font-black ${report.match_score > 70 ? 'text-green-400' : 'text-orange-400'}`}>
                  {report.match_score}%
                </div>
              </div>
              
              <h3 className="text-white font-bold text-lg mb-1 truncate pr-8">{report.resume_name}</h3>
              <p className="text-purple-400 text-[10px] uppercase font-black tracking-[0.2em] mb-6 italic">Verified Insight</p>
              
              <div className="text-zinc-400 text-xs line-clamp-4 italic mb-8 font-light leading-relaxed border-l-2 border-white/5 pl-4">
                {report.report_content.substring(0, 200)}...
              </div>

              <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Full View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/20 border border-dashed border-white/10 rounded-[40px] p-20 text-center">
            <p className="text-zinc-600 italic text-sm">History is clear.</p>
        </div>
      )}
    </div>
  );
}