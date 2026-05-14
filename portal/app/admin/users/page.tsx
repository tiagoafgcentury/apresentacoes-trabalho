'use client';

import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'viewer' });
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function fetchUsers() {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'viewer' });
      fetchUsers();
      setNotification({ type: 'success', message: 'Usuário criado!' });
    } else {
      const data = await res.json();
      setNotification({ type: 'error', message: data.error || 'Erro ao criar' });
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    
    const res = await fetch(`/api/users/${deleteConfirm}`, { method: 'DELETE' });
    if (res.ok) {
      fetchUsers();
      setNotification({ type: 'success', message: 'Usuário removido.' });
    } else {
      const data = await res.json();
      setNotification({ type: 'error', message: data.error || 'Erro ao excluir' });
    }
    setDeleteConfirm(null);
  }

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(filter.toLowerCase()) || 
    u.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
          <p className="text-gray-400 text-sm">Controle quem pode acessar o portal.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white hover:bg-gray-200 text-black px-5 py-2.5 rounded-xl transition font-bold text-sm"
        >
          + Novo Usuário
        </button>
      </div>

      {/* Filtro */}
      <div className="mb-6 relative">
        <input 
          type="text"
          placeholder="Buscar por nome ou email..."
          className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white pl-10"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <span className="absolute left-4 top-3.5 text-gray-500">🔍</span>
      </div>

      {/* Tabela Densa */}
      <div className="rounded-2xl border border-gray-800 overflow-hidden bg-white/[0.02]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-black/40">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Nome / Identificação</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Nível de Acesso</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-12 text-center text-gray-500 animate-pulse">Carregando usuários...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-12 text-center text-gray-500 italic">Nenhum usuário encontrado.</td></tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-white/[0.03] transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-100">{u.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{u.email}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-[#F06520]/10 text-[#F06520] border border-[#F06520]/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${u.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                    <span className="text-xs font-medium text-gray-300">{u.is_active ? 'Ativo' : 'Inativo'}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setDeleteConfirm(u.id)} 
                      className="p-2 text-gray-400 hover:text-red-500 transition hover:bg-red-500/10 rounded-lg"
                      title="Excluir Usuário"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmação */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md z-[100]">
          <div className="bg-[#020617] border border-gray-800 rounded-3xl p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
            <h2 className="text-xl font-bold mb-2 text-white">Excluir Usuário?</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Isso apagará o acesso, os logs e as permissões vinculadas. Esta ação não pode ser desfeita.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition font-bold">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition font-bold">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {notification && (
        <div className="fixed bottom-10 right-10 z-[110] animate-slide-up">
          <div className={`px-6 py-4 rounded-xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <span className="text-lg">{notification.type === 'success' ? '✓' : '✕'}</span>
            <span className="font-bold">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-[#020617] border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-white">Novo Usuário</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F06520] transition-colors"
                  required
                  placeholder="Ex: João Silva"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Email Corporativo</label>
                <input 
                  type="email" 
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F06520] transition-colors"
                  required
                  placeholder="exemplo@century.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Senha de Acesso</label>
                <input 
                  type="password" 
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F06520] transition-colors"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Nível de Permissão</label>
                <select 
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F06520] transition-colors appearance-none"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'viewer'})}
                >
                  <option value="viewer" className="bg-[#020617]">Viewer (Apenas Visualização)</option>
                  <option value="admin" className="bg-[#020617]">Admin (Gestor Total)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition font-bold">Cancelar</button>
                <button type="submit" className="flex-1 p-4 bg-[#F06520] hover:bg-[#d4561a] text-white rounded-xl transition font-bold shadow-lg shadow-orange-900/20">Criar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
