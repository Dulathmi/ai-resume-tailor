'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'AI Workspace', href: '/tailor', icon: '✨' },
    { name: 'Job Matches', href: '/job-matches', icon: '🎯' },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-zinc-900/20 backdrop-blur-2xl p-8 flex flex-col">
        <div className="mb-12">
          <h2 className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-white via-zinc-400 to-zinc-800 bg-clip-text text-transparent">
            Tailor AI
          </h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">Version 2.5 Premium</p>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300
                  ${isActive 
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[1.02]' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'}
                `}>
                  <span className={`text-lg ${isActive ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Status / Footer */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[1px]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-bold">
                DS
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Dulathmi</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">Pro Developer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Page Content */}
      <main className="flex-1 overflow-y-auto p-12 scrollbar-hide">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}