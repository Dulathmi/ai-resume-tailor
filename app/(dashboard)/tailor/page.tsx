'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function TailorPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 1. Fetch resumes so the user can pick one
  useEffect(() => {
    const fetchResumes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.storage
        .from('resumes')
        .list(user.id);
      
      setResumes(data || []);
    };
    fetchResumes();
  }, []);

  const handleStartAnalysis = async () => {
    if (!jobDescription || !selectedResume) {
      alert("Please select a resume and paste a job description.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(''); 

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Act as a senior technical recruiter. 
        I am applying for a job with this description: "${jobDescription}"
        My resume filename is: "${selectedResume}"
        
        Task: Provide a "Compatibility Score" (0-100%) and 3 specific keywords 
        I should ensure are in my resume based on this job post.
      `;

      const result = await model.generateContent(prompt);
      setAnalysisResult(result.response.text());
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight italic">AI Tailor Workspace</h1>
        <p className="text-zinc-400 mt-1 text-sm">Compare your resume against any job description.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* NEW: Resume Selection Dropdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-[0.2em]">
              Step 1: Select Your Resume
            </label>
            <select 
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-zinc-300 text-sm focus:outline-none focus:border-white/20"
            >
              <option value="">-- Choose a file --</option>
              {resumes.map((file) => (
                <option key={file.id} value={file.name}>{file.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-[10px] font-bold text-zinc-500 mb-4 uppercase tracking-[0.2em]">
              Step 2: Paste Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste requirements here..."
              className="w-full h-[280px] bg-black/40 border border-white/5 rounded-xl p-4 text-zinc-300 text-sm resize-none"
            />
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!jobDescription || !selectedResume || isAnalyzing}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? "Gemini is analyzing..." : "Tailor Resume"}
          </button>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 min-h-[480px]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
              <p className="text-zinc-500 text-sm animate-pulse">Running AI Comparison...</p>
            </div>
          ) : analysisResult ? (
            <div className="prose prose-invert max-w-none">
               <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Analysis Result</h2>
               <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{analysisResult}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-20">
              <div className="text-6xl mb-4">📄🔍</div>
              <p className="text-sm italic">Select a file and paste a JD to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}