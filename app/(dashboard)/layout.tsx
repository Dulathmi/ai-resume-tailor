import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-zinc-900/50 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent italic">
          Tailor AI
        </h2>
        <nav className="space-y-2 flex-1">
          {/* Dashboard Link */}
          <Link href="/dashboard">
            <div className="text-sm font-medium text-zinc-400 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all">
              Dashboard
            </div>
          </Link>
          
          {/* Workspace Link - The page where you run the AI */}
          <Link href="/tailor">
            <div className="text-sm font-medium text-zinc-400 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all">
              AI Workspace
            </div>
          </Link>

          {/* Job Matches Link - Now correctly points to the History page */}
          <Link href="/job-matches">
            <div className="text-sm font-medium text-zinc-400 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all">
              Job Matches
            </div>
          </Link>
        </nav>
      </aside>

      {/* Main Page Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}