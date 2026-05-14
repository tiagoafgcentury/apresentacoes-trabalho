'use client';

import { use, useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function ViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [title, setTitle] = useState('Carregando...');
  const [backUrl, setBackUrl] = useState('/portal');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Busca os dados da sessão para decidir o link de volta
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(session => {
        if (session.role === 'admin') setBackUrl('/admin/presentations');
      });

    // Busca o título da apresentação para o header
    fetch('/api/presentations')
      .then(res => res.json())
      .then(data => {
        const p = data.find((item: any) => item.id === id);
        if (p) setTitle(p.title);
      });
  }, [id]);

  const handleIframeLoad = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        const win = iframeRef.current.contentWindow as any;
        if (win.Reveal) {
          win.Reveal.slide(0);
        }
      }
    } catch (e) {
      console.log('Reveal.js reset bypass or error:', e);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#000' }}>
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-white/10" style={{ background: '#050a14' }}>
        <div className="flex items-center gap-4">
          <Link href={backUrl} className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
            <span>←</span> Voltar
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-sm font-medium text-white truncate max-w-md">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-[#F06520] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Modo Visualização
          </span>
        </div>
      </header>

      {/* Viewer Area */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          ref={iframeRef}
          src={`/api/serve/${id}`}
          className="absolute inset-0 w-full h-full border-none"
          onLoad={handleIframeLoad}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
