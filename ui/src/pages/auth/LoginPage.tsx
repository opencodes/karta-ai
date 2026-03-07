import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [email, setEmail] = useState('admin@karta.ai');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={isLight
      ? 'min-h-screen bg-[#eef4fb] flex items-center justify-center px-4 relative overflow-hidden'
      : 'min-h-screen bg-[#020611] flex items-center justify-center px-4 relative overflow-hidden'}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={isLight
          ? 'absolute -top-40 left-1/2 -translate-x-1/2 w-[860px] h-[860px] bg-teal/18 rounded-full blur-[140px]'
          : 'absolute -top-40 left-1/2 -translate-x-1/2 w-[860px] h-[860px] bg-teal/25 rounded-full blur-[140px]'}
        />
        <div className={isLight
          ? 'absolute bottom-[-120px] right-[-10%] w-[620px] h-[620px] bg-sky-400/20 rounded-full blur-[130px]'
          : 'absolute bottom-[-120px] right-[-10%] w-[620px] h-[620px] bg-sky-500/25 rounded-full blur-[130px]'}
        />
        <div className={isLight
          ? 'absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(15,23,42,0.06),transparent_36%)]'
          : 'absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.14),transparent_30%)]'}
        />
        <div className={isLight
          ? 'absolute inset-0 bg-[linear-gradient(180deg,rgba(20,184,166,0.08),rgba(238,244,251,0.9)_42%,rgba(238,244,251,1)_100%)]'
          : 'absolute inset-0 bg-[linear-gradient(180deg,rgba(100,255,218,0.08),rgba(2,6,17,0.85)_40%,rgba(2,6,17,1)_100%)]'}
        />
      </div>

      <div className={isLight
        ? 'w-full max-w-md rounded-3xl p-8 border border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.16)] relative z-10'
        : 'w-full max-w-md rounded-3xl p-8 border border-white/15 bg-[#07111f]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.55)] relative z-10'}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center shadow-[0_0_24px_rgba(100,255,218,0.35)]">
            <Zap className="text-midnight w-5 h-5 fill-current" />
          </div>
          <h1 className="text-2xl font-display font-bold text-heading">Login</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Sign in to access Karta admin workspace.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control-ui w-full h-11 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control-ui w-full h-11 rounded-xl"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-ui w-full h-11 rounded-xl font-semibold disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-400 text-center">
          New to Karta?{' '}
          <Link to="/signup" className="text-teal hover:text-teal/80 font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
