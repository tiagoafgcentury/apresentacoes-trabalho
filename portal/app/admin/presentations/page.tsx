'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PresentationsPage() {
  const [presentations, setPresentations] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchPresentations();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function fetchPresentations() {
    const res = await fetch('/api/presentations');
    const data = await res.json();
    setPresentations(data);
    setLoading(false);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    const res = await fetch('/api/presentations', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setShowModal(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchPresentations();
      setNotification({ type: 'success', message: 'Upload concluído!' });
    } else {
      const data = await res.json();
      setNotification({ type: 'error', message: data.error || 'Erro no upload' });
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    
    const res = await fetch(`/api/presentations/${deleteConfirm}`, { method: 'DELETE' });
    if (res.ok) {
      fetchPresentations();
      setNotification({ type: 'success', message: 'Apresentação excluída.' });
    } else {
      const data = await res.json();
      setNotification({ type: 'error', message: data.error || 'Erro ao excluir.' });
    }
    setDeleteConfirm(null);
  }

  const filtered = presentations.filter(p => 
    p.title.toLowerCase().includes(filter.toLowerCase()) || 
    p.description?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Apresentações</h1>
          <p className="text-gray-400 text-sm">Controle de arquivos e acesso ao conteúdo.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#F06520] hover:bg-[#d4561a] text-white px-5 py-2.5 rounded-xl transition font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-900/20"
        >
          <span>+</span> Upload HTML
        </button>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="mb-6 relative">
        <input 
          type="text"
          placeholder="Filtrar por título ou descrição..."
          className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F06520] transition-colors pl-10"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <span className="absolute left-4 top-3.5 text-gray-500 text-lg">🔍</span>
      </div>

      {/* Tabela Densa */}
      <div className="rounded-2xl border border-gray-800 overflow-hidden bg-white/[0.02]">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="border-b border-gray-800 bg-black/40">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-1/3">Apresentação</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-1/3 text-center">Data de Upload</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-12 text-center text-gray-500 animate-pulse">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={3} className="p-12 text-center text-gray-500 italic">Nenhuma apresentação encontrada.</td></tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-white/[0.03] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        📊
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-gray-100 truncate">{p.title}</p>
                        <p className="text-xs text-gray-500 truncate">{p.description || 'Sem descrição'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400 text-center font-mono">
                    {new Date(p.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-3">
                      <Link 
                        href={`/portal/viewer/${p.id}`} 
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-white transition bg-white/5 rounded-lg hover:bg-[#F06520]/20"
                        title="Visualizar"
                      >
                        👁️
                      </Link>
                      <Link 
                        href={`/admin/presentations/${p.id}/permissions`}
                        className="p-2 text-gray-400 hover:text-[#F06520] transition bg-white/5 rounded-lg hover:bg-[#F06520]/10"
                        title="Permissões"
                      >
                        🔑
                      </Link>
                      <button 
                        onClick={() => setDeleteConfirm(p.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition bg-white/5 rounded-lg hover:bg-red-500/10"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md z-[100]">
          <div className="bg-[#020617] border border-gray-800 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl shadow-red-900/10">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⚠️</div>
            <h2 className="text-2xl font-bold mb-3">Confirmar Exclusão?</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Isso removerá permanentemente o arquivo e todos os registros de acesso.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="flex-1 p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl transition font-bold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 p-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl transition font-bold"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificação Toast */}
      {notification && (
        <div className="fixed bottom-10 right-10 z-[110] animate-slide-up">
          <div className={`px-8 py-5 rounded-2xl border shadow-2xl backdrop-blur-2xl flex items-center gap-4 ${
            notification.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span className="text-2xl">{notification.type === 'success' ? '✨' : '⚠️'}</span>
            <span className="font-bold tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Modal de Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-[#020617] border border-gray-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Nova Apresentação</h2>
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Título</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F06520]"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Plano Estratégico 2026"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Descrição (opcional)</label>
                <textarea 
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F06520] h-24"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Breve resumo sobre o conteúdo..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Arquivo HTML</label>
                <input 
                  type="file" 
                  accept=".html"
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm cursor-pointer file:bg-[#F06520] file:border-none file:px-4 file:py-1 file:rounded-md file:text-white file:font-bold file:mr-4 file:cursor-pointer hover:file:bg-[#d4561a]"
                  required
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl transition font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 p-4 bg-[#F06520] hover:bg-[#d4561a] text-white rounded-2xl transition font-bold shadow-lg shadow-orange-900/20"
                >
                  Iniciar Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
