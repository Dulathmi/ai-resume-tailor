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
  const [isSaving, setIsSaving] = useState(false);

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
      const { data: { user } } = await supabase.auth.getUser();
      const { data: fileBlob } = await supabase.storage
        .from('resumes')
        .download(`${user?.id}/${selectedResume}`);

      const formData = new FormData();
      formData.append('file', fileBlob!, selectedResume);

      const extractRes = await fetch('/api/extract-pdf', { method: 'POST', body: formData });
      const { text: resumeText } = await extractRes.json();

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Act as a Senior Recruiter. Analyze this job: "${jobDescription}" 
        against this resume: "${resumeText}".
        
        IMPORTANT: Your response MUST start with "Match Score: [X]%" where X is a number.
        Then provide Skill Gaps, Golden Bullet Points, and a Verdict.
      `;

      const result = await model.generateContent(prompt);
      setAnalysisResult(result.response.text());
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveReport = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Extract the score from the text (finds the first number after "Match Score")
      const scoreMatch = analysisResult.match(/Match Score:\s*(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

      const { error } = await supabase
        .from('analysis_reports')
        .insert({
          user_id: user?.id,
          resume_name: selectedResume,
          job_title: "Analysis Report", // We can make this dynamic later
          match_score: score,
          report_content: analysisResult,
        });

      if (error) throw error;
      alert("Report saved to your history!");
    } catch (error: any) {
      alert("Save failed: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="relative py-6">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Tailor Workspace</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          {/* Inputs remain same as your previous version */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
             <select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)} className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-zinc-300 text-sm">
                <option value="">Choose a resume...</option>
                {resumes.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
             </select>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
             <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste Job Description..." className="w-full h-[300px] bg-black/60 border border-white/5 rounded-2xl p-5 text-zinc-300 text-sm" />
          </div>
          <button onClick={handleStartAnalysis} disabled={isAnalyzing} className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50 uppercase tracking-widest text-xs">
            {isAnalyzing ? "Processing..." : "Run AI Deep Match"}
          </button>
        </div>

        <div className="lg:col-span-7 bg-zinc-900/20 border border-white/5 rounded-[32px] p-8 min-h-[500px] relative">
          {analysisResult ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h2 className="text-xl font-black text-white italic uppercase">Consultant Feedback</h2>
                <button 
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="px-4 py-2 bg-purple-600 text-white text-[10px] font-black rounded-xl hover:bg-purple-500 transition-all uppercase tracking-widest"
                >
                  {isSaving ? "Saving..." : "Save to History"}
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {analysisResult}
              </div>
            </div>
          ) : (
             <div className="flex items-center justify-center h-full opacity-20 italic">Select a file to begin...</div>
          )}
        </div>
      </div>
    </div>
  );
}