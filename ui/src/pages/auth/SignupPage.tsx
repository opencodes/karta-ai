import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await signup(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020611] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[860px] h-[860px] bg-teal/25 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-120px] right-[-10%] w-[620px] h-[620px] bg-sky-500/25 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.14),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(100,255,218,0.08),rgba(2,6,17,0.85)_40%,rgba(2,6,17,1)_100%)]" />
      </div>

      <div className="w-full max-w-md rounded-3xl p-8 border border-white/15 bg-[#07111f]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.55)] relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center shadow-[0_0_24px_rgba(100,255,218,0.35)]">
            <Zap className="text-midnight w-5 h-5 fill-current" />
          </div>
          <h1 className="text-2xl font-display font-bold text-heading">Create account</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Sign up to start using Karta workspace.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-heading outline-none focus:border-teal/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-heading outline-none focus:border-teal/40"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-heading outline-none focus:border-teal/40"
              minLength={6}
              required
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-teal text-midnight font-semibold hover:bg-teal/90 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-400 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-teal hover:text-teal/80 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
