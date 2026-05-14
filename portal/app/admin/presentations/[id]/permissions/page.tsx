'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function PermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [allowedUserIds, setAllowedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch(`/api/permissions?presentation_id=${id}`).then(r => r.json())
    ]).then(([usersData, permsData]) => {
      setUsers(usersData);
      setAllowedUserIds(new Set(permsData));
      setLoading(false);
    });
  }, [id]);

  function togglePermission(userId: string) {
    const next = new Set(allowedUserIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setAllowedUserIds(next);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        presentation_id: id,
        user_ids: Array.from(allowedUserIds)
      }),
    });

    setSaving(false);
    if (res.ok) {
      setNotification({ type: 'success', message: 'Permissões salvas com sucesso!' });
      setTimeout(() => router.push('/admin/presentations'), 1500);
    } else {
      setNotification({ type: 'error', message: 'Erro ao salvar permissões.' });
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">← Voltar</button>
        <h1 className="text-2xl font-bold">Definir Permissões</h1>
      </div>

      <div className="bg-[#020617] border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-white/5">
          <p className="text-sm text-gray-400">
            Selecione quais usuários podem visualizar esta apresentação.
          </p>
        </div>
        
        <div className="divide-y divide-gray-800">
          {users.map(u => (
            <label key={u.id} className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition">
              <div>
                <p className="font-medium text-white">{u.name}</p>
                <p className="text-sm text-gray-500">{u.email} • {u.role}</p>
              </div>
              <input
                type="checkbox"
                checked={allowedUserIds.has(u.id)}
                onChange={() => togglePermission(u.id)}
                className="w-5 h-5 accent-[#F06520] cursor-pointer"
              />
            </label>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800 bg-black/20 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#F06520] hover:bg-[#d5581b] text-white px-6 py-2 rounded font-medium transition disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Permissões'}
          </button>
        </div>
      </div>

      {/* Notificação Elegante */}
      {notification && (
        <div className="fixed bottom-8 right-8 z-[100] animate-slide-up">
          <div className={`px-6 py-4 rounded-xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <span className="text-xl">{notification.type === 'success' ? '✓' : '✕'}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
