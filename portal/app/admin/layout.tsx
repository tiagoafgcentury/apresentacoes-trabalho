import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/portal');
  }

  return (
    <div className="min-h-screen flex text-white" style={{ background: '#020617', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-gray-800" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold" style={{ color: '#F06520' }}>Century</h2>
          <p className="text-xs text-gray-400 mt-1">Painel Administrativo</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Usuários
          </Link>
          <Link href="/admin/presentations" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Apresentações
          </Link>
          <Link href="/admin/logs" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Logs de Acesso
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 rounded transition">
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-800 flex items-center justify-end px-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{session.name}</p>
              <p className="text-xs text-gray-400">{session.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: '#F06520' }}>
              {session.name.charAt(0)}
            </div>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
