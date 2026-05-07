'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import UploadModal from '../../components/UploadModal';

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch resumes from storage
  const fetchResumes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.storage
        .from('resumes')
        .list(user.id, {
          limit: 10,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      setResumes(data || []);
    } catch (error: any) {
      console.error("Error fetching resumes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Open PDF in a new tab
  const handleView = async (fileName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(`${user.id}/${fileName}`, 60);

      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    } catch (error: any) {
      alert("Error opening file: " + error.message);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">My Resumes</h1>
          <p className="text-zinc-400 mt-1 text-sm">Select a document to begin AI tailoring.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-all text-sm"
        >
          + Upload New
        </button>
      </header>

      {loading ? (
        <div className="text-zinc-500 animate-pulse text-center p-20">Loading...</div>
      ) : resumes.length === 0 ? (
        <div className="border border-white/5 bg-white/5 rounded-2xl p-20 text-center border-dashed">
          <p className="text-zinc-500 text-sm">No resumes found. Your journey starts here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumes.map((file) => (
            <div key={file.id} className="flex items-center justify-between border border-white/10 bg-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="text-white text-sm font-medium truncate max-w-[150px]">{file.name}</div>
                  <div className="text-zinc-500 text-[10px]">{new Date(file.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <button 
                onClick={() => handleView(file.name)}
                className="text-xs font-bold bg-white/5 hover:bg-white text-white hover:text-black px-3 py-2 rounded-lg transition-all"
              >
                View PDF
              </button>
            </div>
          ))}
        </div>
      )}

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchResumes();
        }} 
      />
    </div>
  );
}