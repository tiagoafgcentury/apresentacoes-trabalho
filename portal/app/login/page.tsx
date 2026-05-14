'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@century.com');
  const [password, setPassword] = useState('century@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = data.role === 'admin' ? '/admin' : '/portal';
    } else {
      setError(data.error || 'Credenciais inválidas');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{
      background: 'radial-gradient(circle at center, #0D2B52 0%, #020617 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div className="w-full max-w-sm mx-4">
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '48px 40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        }}>
          {/* Ícone */}
          <div className="text-center mb-6">
            <div style={{ fontSize: '52px', filter: 'drop-shadow(0 0 12px #F06520)' }}>🔑</div>
          </div>

          {/* Título */}
          <h1 className="text-center text-white font-bold mb-2" style={{ fontSize: '26px' }}>
            Acesso Restrito
          </h1>
          <p className="text-center mb-8" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
            Portal de Apresentações Executivas
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              ref={emailRef}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {error && (
              <p style={{ color: '#ff4444', fontSize: '14px', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? 'rgba(240,101,32,0.6)' : '#F06520',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontWeight: '700',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s',
                marginTop: '4px',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar no Portal'}
            </button>
          </form>

          {/* Dica de credenciais para facilitar */}
          <div className="mt-6 p-4 rounded-lg bg-black/20 border border-white/5 text-center">
            <p className="text-xs text-gray-400 mb-1">Credenciais de Acesso Rápido:</p>
            <p className="text-sm text-gray-300 font-mono">admin@century.com / century@2026</p>
          </div>
        </div>

        <p className="text-center mt-6" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
          © 2026 • Century • Portal Corporativo
        </p>
      </div>
    </main>
  );
}
