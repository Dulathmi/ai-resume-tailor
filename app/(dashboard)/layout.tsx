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
        <nav className="space-y-4 flex-1">
          {/* Dashboard Link */}
          <Link href="/dashboard">
            <div className="text-sm font-medium text-white cursor-pointer bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-all">
              Dashboard
            </div>
          </Link>
          
          {/* My Resumes Link (Points to Dashboard as well) */}
          <Link href="/dashboard">
            <div className="text-sm font-medium text-zinc-400 hover:text-white cursor-pointer transition-colors p-2">
              My Resumes
            </div>
          </Link>

          {/* Job Matches Link (Points to your new Tailor page) */}
          <Link href="/tailor">
            <div className="text-sm font-medium text-zinc-400 hover:text-white cursor-pointer transition-colors p-2">
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