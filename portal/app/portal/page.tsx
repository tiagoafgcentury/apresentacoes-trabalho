'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PortalPage() {
  const [presentations, setPresentations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/presentations')
      .then(res => {
        if (res.status === 401) window.location.href = '/login';
        return res.json();
      })
      .then(data => {
        // Se o usuário for admin (vemos isso pelo fato de ele ter acesso a tudo ou via uma flag que podemos adicionar na API)
        // No nosso caso, vamos checar a role na API de presentations ou criar uma de perfil.
        // Mas por simplicidade, vamos checar se a URL contém algo ou se o usuário veio do admin.
        setPresentations(data);
        setLoading(false);
      });
      
    // Vamos fazer uma chamada simples para checar a sessão
    fetch('/api/auth/session').then(res => res.json()).then(session => {
      if (session?.role === 'admin') {
        window.location.href = '/admin';
      }
    });
  }, []);

  return (
    <main className="min-h-screen p-8" style={{ background: '#020617', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Minhas <span>Apresentações</span></h1>
            <p className="text-gray-400">Acesse o conteúdo estratégico autorizado para você.</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition underline decoration-gray-700">
              Sair do Portal
            </button>
          </form>
        </header>

        {loading ? (
          <div className="flex gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-1 h-64 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : presentations.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-gray-800">
            <p className="text-gray-500 italic">Você ainda não possui apresentações autorizadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {presentations.map(p => (
              <Link key={p.id} href={`/portal/viewer/${p.id}`} className="group block">
                <div className="relative h-56 rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 mb-4 transition-all duration-300 group-hover:border-[#F06520] group-hover:shadow-[0_0_30px_rgba(240,101,32,0.15)]">
                  <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20 group-hover:opacity-40 transition-opacity">
                    📊
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] uppercase tracking-widest text-[#F06520] font-bold">Apresentação Executiva</span>
                    <h3 className="text-lg font-bold truncate mt-1">{p.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {p.description || "Clique para visualizar o conteúdo completo da apresentação."}
                </p>
              </Link>
            ))}
          </div>
        )}

        <footer className="mt-20 pt-10 border-t border-gray-900 text-center text-xs text-gray-600">
          © 2026 • Century • Todos os direitos reservados.
        </footer>
      </div>
    </main>
  );
}
