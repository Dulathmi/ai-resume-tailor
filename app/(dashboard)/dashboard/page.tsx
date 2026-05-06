'use client';

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
          <p className="text-zinc-400 mt-1 text-sm">Upload and manage your documents for AI tailoring.</p>
        </div>
        
        <button className="bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-all text-sm">
          + Upload New
        </button>
      </header>

      {/* Placeholder for the Resume List */}
      <div className="border border-white/5 bg-white/5 rounded-2xl p-20 text-center border-dashed">
        <div className="text-zinc-600 mb-2">No resumes found</div>
        <p className="text-zinc-500 text-xs">Start by uploading your first resume in PDF or Text format.</p>
      </div>
    </div>
  );
}