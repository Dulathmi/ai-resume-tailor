'use client';
import { useState } from 'react';

export default function TailorPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    // We will plug in the AI logic here next!
    console.log("Analyzing job description:", jobDescription);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">AI Tailor Workspace</h1>
        <p className="text-zinc-400 mt-1">Paste the job description and let the AI optimize your resume.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Input Area */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-medium text-zinc-300 mb-4 uppercase tracking-wider">
              Target Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job requirements from LinkedIn or the company website here..."
              className="w-full h-[400px] bg-black/20 border border-white/5 rounded-xl p-4 text-zinc-300 focus:outline-none focus:border-white/20 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!jobDescription || isAnalyzing}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isAnalyzing ? "AI is thinking..." : "Start AI Analysis"}
          </button>
        </div>

        {/* Right Side: Preview / Results */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          {!isAnalyzing ? (
            <div className="space-y-4">
              <div className="text-4xl">🤖</div>
              <h3 className="text-white font-medium">Ready to Analyze</h3>
              <p className="text-zinc-500 text-sm max-w-[250px]">
                Once you click start, our AI will compare your resume against the job requirements.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-white font-medium">Extracting Keywords...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}