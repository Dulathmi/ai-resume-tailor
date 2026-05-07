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

      // 4. Send the extracted text to Gemini with the UPGRADED PROMPT
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Act as a Senior Technical Recruiter and Resume Architect. 
        
        CONTEXT:
        - Candidate Resume: "${extractedResumeText}"
        - Target Job: "${jobDescription}"

        TASK:
        Provide a highly structured analysis in the following format:

        ### 1. Match Score: [X]%
        (Provide a realistic score based on technical skills and requirements).

        ### 2. Critical Skill Gaps
        - List the top 3-5 technical skills or tools mentioned in the Job Description that are MISSING from the resume.

        ### 3. "The Golden Bullet Points"
        - Write 2-3 specific, high-impact bullet points the candidate should add to their resume to better match this job. 
        - Use the "Action Verb + Task + Result" formula.

        ### 4. Recruiter's Verdict
        - A 2-sentence brutal but honest assessment of the candidate's chances.
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
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500">Tailor Workspace</span>
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">Professional resume architect powered by Gemini.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 font-bold text-[10px]">01</div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Select Resume</h3>
            </div>
            <select 
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-zinc-300 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none transition-all cursor-pointer"
            >
              <option value="">Choose from your uploads...</option>
              {resumes.map((file) => (
                <option key={file.id} value={file.name}>{file.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 font-bold text-[10px]">02</div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Target Context</h3>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the Job Description requirements here..."
              className="w-full h-[300px] bg-black/60 border border-white/5 rounded-2xl p-5 text-zinc-300 text-sm resize-none focus:ring-2 focus:ring-pink-500/40 outline-none transition-all"
            />
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!jobDescription || !selectedResume || isAnalyzing}
            className="group relative w-full overflow-hidden rounded-2xl bg-white p-[2px] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"></div>
            <div className="relative flex h-full w-full items-center justify-center bg-zinc-950 py-4 rounded-[14px] transition-all group-hover:bg-transparent">
              <span className="font-bold text-white group-hover:text-black tracking-widest text-xs uppercase">
                {isAnalyzing ? "Processing Neural Data..." : "Generate Pro Analysis"}
              </span>
            </div>
          </button>
        </div>

        {/* Right Side: Output */}
        <div className="lg:col-span-7 bg-zinc-900/20 border border-white/5 rounded-[32px] p-1 overflow-hidden">
          <div className="h-full w-full bg-zinc-950/40 backdrop-blur-3xl rounded-[30px] p-8 relative">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold tracking-tight">AI is architecting your resume...</p>
                  <p className="text-zinc-600 text-[10px] mt-1 uppercase tracking-widest">Applying STAR method logic</p>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Consultant Feedback</h2>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_green]"></div>
                </div>
                {/* Prose class added here to format bullet points and headings correctly */}
                <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-[1.8] font-light whitespace-pre-wrap">
                  {analysisResult}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl flex items-center justify-center mb-6 border border-white/5 group-hover:rotate-6 transition-transform">
                    <span className="text-4xl opacity-20">📊</span>
                </div>
                <h3 className="text-zinc-200 font-bold text-sm">Neural Comparison Ready</h3>
                <p className="text-zinc-600 text-[10px] max-w-[200px] mt-2 uppercase tracking-widest">Select a resume and paste a job to begin analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}