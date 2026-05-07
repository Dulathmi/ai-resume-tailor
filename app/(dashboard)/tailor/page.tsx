'use client';
import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function TailorPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // THIS IS THE FUNCTION YOU WERE LOOKING FOR
  const handleStartAnalysis = async () => {
    if (!jobDescription) return;
    
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      alert("API Key is missing! Check your .env.local file.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(''); 

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using 'gemini-1.5-flash' for faster responses, but you can switch to 'gemini-2.5-flash' for deeper analysis
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Act as a senior technical recruiter. 
        Analyze the following Job Description and provide:
        - Top 5 Keywords/Skills to include in a resume.
        - A "Recruiter Perspective" on the ideal candidate.
        - 3 actionable tips to improve a resume for this role.

        Job Description: ${jobDescription}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnalysisResult(response.text());
      
    } catch (error: any) {
      console.error("AI Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight italic">AI Tailor Workspace</h1>
        <p className="text-zinc-400 mt-1 text-sm">Analyze job requirements using Google Gemini AI.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Input */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-[10px] font-bold text-zinc-500 mb-4 uppercase tracking-[0.2em]">
              Paste Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste requirements here..."
              className="w-full h-[380px] bg-black/40 border border-white/5 rounded-xl p-4 text-zinc-300 focus:outline-none focus:border-white/20 transition-all resize-none text-sm leading-relaxed"
            />
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!jobDescription || isAnalyzing}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 active:scale-95"
          >
            {isAnalyzing ? "Gemini is thinking..." : "Generate AI Insights"}
          </button>
        </div>

        {/* Right Side: AI Results */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 min-h-[480px]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
              <p className="text-zinc-500 text-sm animate-pulse">Consulting Gemini AI...</p>
            </div>
          ) : analysisResult ? (
            <div className="prose prose-invert max-w-none">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Analysis Complete</h2>
              </div>
              <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-light">
                {analysisResult}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-5xl opacity-20">🤖</div>
              <h3 className="text-white font-medium text-sm">Ready to Analyze</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}