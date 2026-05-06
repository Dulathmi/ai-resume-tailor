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
          <div className="text-sm font-medium text-white cursor-pointer bg-white/5 p-2 rounded-lg">Dashboard</div>
          <div className="text-sm font-medium text-zinc-400 hover:text-white cursor-pointer transition-colors p-2">My Resumes</div>
          <div className="text-sm font-medium text-zinc-400 hover:text-white cursor-pointer transition-colors p-2">Job Matches</div>
        </nav>
      </aside>

      {/* Main Page Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}