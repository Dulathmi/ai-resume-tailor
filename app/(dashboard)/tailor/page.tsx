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

  useEffect(() => {
    const fetchResumes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.storage.from('resumes').list(user.id);
      setResumes(data || []);
    };
    fetchResumes();
  }, []);

  const handleStartAnalysis = async () => {
    if (!jobDescription || !selectedResume) return;
    setIsAnalyzing(true);
    setAnalysisResult(''); 

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Act as a senior technical recruiter. Match this job: "${jobDescription}" with resume: "${selectedResume}". Give a score and 3 tips.`;
      const result = await model.generateContent(prompt);
      setAnalysisResult(result.response.text());
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header with Gradient Text */}
      <header className="relative py-6">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-600/20 blur-[100px] rounded-full"></div>
        <h1 className="text-4xl font-black text-white tracking-tighter">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Tailor Workspace</span>
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">Smart comparison engine for elite candidates.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="group bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:border-purple-500/30 transition-all duration-500 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 font-bold text-xs">01</div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Select Source</h3>
            </div>
            
            <select 
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-zinc-300 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Choose a resume...</option>
              {resumes.map((file) => (
                <option key={file.id} value={file.name}>{file.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 font-bold text-xs">02</div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Target Context</h3>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the Job Description here..."
              className="w-full h-[300px] bg-black/60 border border-white/5 rounded-2xl p-5 text-zinc-300 text-sm resize-none focus:ring-2 focus:ring-pink-500/40 outline-none transition-all"
            />
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!jobDescription || !selectedResume || isAnalyzing}
            className="group relative w-full overflow-hidden rounded-2xl bg-white p-[2px] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 animate-gradient-x"></div>
            <div className="relative flex h-full w-full items-center justify-center bg-zinc-950 py-4 rounded-[14px] transition-all group-hover:bg-transparent">
              <span className="font-bold text-white group-hover:text-black">
                {isAnalyzing ? "Processing Data..." : "Run AI Analysis"}
              </span>
            </div>
          </button>
        </div>

        {/* Right Output Panel (Span 7) */}
        <div className="lg:col-span-7 bg-zinc-900/20 border border-white/5 rounded-[32px] p-1 overflow-hidden">
          <div className="h-full w-full bg-zinc-950/40 backdrop-blur-3xl rounded-[30px] p-8 relative">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                    <p className="text-white font-bold text-lg">Consulting Gemini 2.5</p>
                    <p className="text-zinc-500 text-xs mt-1">Cross-referencing datasets...</p>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="animate-in fade-in slide-in-from-right-8 duration-1000">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white">Insight Report</h2>
                    <span className="px-4 py-1 bg-green-500/10 text-green-400 text-[10px] font-black rounded-full border border-green-500/20 uppercase tracking-widest">Live Analysis</span>
                </div>
                <div className="text-zinc-300 text-sm leading-[1.8] font-light whitespace-pre-wrap selection:bg-purple-500/30">
                  {analysisResult}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center group">
                <div className="w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-5xl grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">✨</span>
                </div>
                <h3 className="text-zinc-200 font-bold text-lg">Intelligence Awaiting</h3>
                <p className="text-zinc-600 text-xs max-w-[240px] mt-2">Connect a resume and job description to unlock neural insights.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}