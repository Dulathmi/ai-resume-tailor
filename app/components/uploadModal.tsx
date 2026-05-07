'use client';
import { useState } from 'react';
import { supabase } from '../utils/supabase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      alert("Upload successful!");
      onClose();
      window.location.reload();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Upload Resume</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
        </div>

        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-white/5">
          <input 
            type="file" 
            accept=".pdf,.txt" 
            className="hidden" 
            id="file-upload"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-zinc-400 mb-2">
              {file ? <span className="text-white font-medium">{file.name}</span> : "Click to select PDF or Text file"}
            </div>
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-zinc-400">Cancel</button>
          <button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="flex-1 px-4 py-2 rounded-lg bg-white text-black font-bold disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}