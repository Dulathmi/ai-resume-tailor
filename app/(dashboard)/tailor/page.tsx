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

  // Fetch list of resumes from Supabase storage
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
      // 1. Get current user for the storage path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      // 2. Download the actual PDF file from Supabase
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from('resumes')
        .download(`${user.id}/${selectedResume}`);

      if (downloadError) throw downloadError;

      // 3. Send the PDF to our internal API to extract the text
      const formData = new FormData();
      formData.append('file', fileBlob, selectedResume);

      const extractRes = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!extractRes.ok) throw new Error("Failed to extract text from PDF");
      const { text: extractedResumeText } = await extractRes.json();

      // 4. Send the extracted text to Gemini
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Act as a senior technical recruiter. 
        Compare this Job Description: "${jobDescription}"
        With this Candidate's Resume Text: "${extractedResumeText}"
        
        Provide:
        1. A Compatibility Score (0-100%).
        2. A list of missing keywords or skills.
        3. A brief "Verdict" on their fit for this specific role.
      `;

      const result = await model.generateContent(prompt);
      setAnalysisResult(result.response.text());

    } catch (error: any) {
      console.error("Pipeline Error:", error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="relative py-6">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-600/20 blur-[100px] rounded-full"></div>
        <h1 className="text-4xl font-black text-white tracking-tighter">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Tailor Workspace</span>
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">Smart comparison engine for elite candidates.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 font-bold text-xs">01</div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Select Resume</h3>
            </div>
            <select 
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-zinc-300 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none"
            >
              <option value="">Choose a file...</option>
              {resumes.map((file) => (
                <option key={file.id} value={file.name}>{file.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 font-bold text-xs">02</div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Job Context</h3>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste Job Description here..."
              className="w-full h-[300px] bg-black/60 border border-white/5 rounded-2xl p-5 text-zinc-300 text-sm resize-none focus:ring-2 focus:ring-pink-500/40 outline-none"
            />
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!jobDescription || !selectedResume || isAnalyzing}
            className="group relative w-full overflow-hidden rounded-2xl bg-white p-[2px] transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"></div>
            <div className="relative flex h-full w-full items-center justify-center bg-zinc-950 py-4 rounded-[14px] transition-all group-hover:bg-transparent">
              <span className="font-bold text-white group-hover:text-black">
                {isAnalyzing ? "Analyzing Text..." : "Run AI Deep Match"}
              </span>
            </div>
          </button>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7 bg-zinc-900/20 border border-white/5 rounded-[32px] p-1 overflow-hidden">
          <div className="h-full w-full bg-zinc-950/40 backdrop-blur-3xl rounded-[30px] p-8">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                <p className="text-white font-bold animate-pulse">Gemini is reading your resume...</p>
              </div>
            ) : analysisResult ? (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Recruiter Report</h2>
                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-light">
                  {analysisResult}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center group">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl opacity-40">📝</span>
                </div>
                <h3 className="text-zinc-200 font-bold">Neural Analysis Ready</h3>
                <p className="text-zinc-600 text-xs mt-2">Pick a file to start the comparison.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}