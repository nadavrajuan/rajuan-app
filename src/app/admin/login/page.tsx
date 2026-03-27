'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'AUTH_FAILED');
      setLoading(false);
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen font-sans flex items-center justify-center relative overflow-hidden">
      {/* Overlays */}
      <div className="fixed inset-0 crt-overlay z-[100] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-indigo-950/50 via-transparent to-violet-950/80 pointer-events-none" />
      <div className="fixed inset-0 z-0 retro-grid pointer-events-none" />

      {/* Fixed Header */}
      <header
        className="fixed top-0 w-full h-8 border-b-2 border-violet-400 bg-violet-950/80 backdrop-blur-md flex items-center px-4 z-50"
        style={{ boxShadow: 'inset 2px 2px 0px #b99fff' }}
      >
        <Link href="/" className="text-[10px] text-secondary font-bold uppercase flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">arrow_back</span>
          BACK
        </Link>
        <div className="flex-1" />
        <span className="text-primary font-black tracking-widest uppercase text-xs">RAJUAN.EXE</span>
      </header>

      {/* Dialog window */}
      <div
        className="relative z-10 w-full max-w-sm px-4"
        style={{ marginTop: '-2rem' }}
      >
        <div className="bevel-raised bg-surface-container" style={{ boxShadow: '8px 8px 0px 0px rgba(26,28,28,0.5)' }}>
          {/* Title bar */}
          <div className="bg-primary-container px-3 py-1 flex justify-between items-center">
            <span className="text-on-primary-container font-black text-xs uppercase tracking-widest">
              AUTHENTICATION_REQUIRED
            </span>
            <Link href="/" className="w-5 h-5 bevel-raised bg-error flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ml-2">
              X
            </Link>
          </div>

          {/* Body */}
          <div className="p-6 bg-surface-container-low space-y-4">
            <div className="text-center mb-4">
              <span className="material-symbols-outlined text-5xl text-primary mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                ENTER ADMIN PASSWORD
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                className="w-full px-3 py-2.5 bevel-pressed bg-surface-container-lowest text-on-surface text-sm font-mono focus:outline-none tracking-widest placeholder:text-outline"
              />
              {error && (
                <div className="text-[10px] text-error font-bold uppercase bg-error-container/20 px-3 py-2 border border-error/30">
                  ERROR: {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full py-3 bevel-raised bg-primary text-on-primary font-black text-xs uppercase tracking-widest hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                {loading ? 'AUTHENTICATING...' : 'EXECUTE: LOGIN'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer
        className="fixed bottom-0 left-0 w-full h-12 bg-indigo-900/90 backdrop-blur-xl z-50 flex items-center px-2 gap-2 border-t-4 border-indigo-950"
        style={{ boxShadow: '0 -4px 20px rgba(0,227,253,0.2), inset 2px 2px 0px #b99fff' }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 px-4 h-9 bg-violet-600 text-white font-black text-[10px] tracking-tight uppercase scale-95"
          style={{ boxShadow: 'inset 3px 3px 0px #38008d' }}
        >
          <span className="material-symbols-outlined text-lg">apps</span>
          START
        </Link>
        <div className="h-9 w-[2px] bg-indigo-950 mx-1" />
        <button
          className="flex items-center gap-2 px-3 h-9 bg-violet-600 text-white font-bold text-[10px] scale-95"
          style={{ boxShadow: 'inset 3px 3px 0px #38008d' }}
        >
          <span className="material-symbols-outlined text-sm">lock</span>
          AUTHENTICATION.EXE
        </button>
      </footer>
    </div>
  );
}
