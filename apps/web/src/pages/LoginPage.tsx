import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { BrandLogo } from '../components/BrandLogo';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@karta.ai');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const ok = await login(email.trim(), password);
    if (!ok) {
      setError('Invalid credentials. Try demo accounts below.');
      return;
    }

    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
    navigate(from, { replace: true });
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <BrandLogo compact />
        <h1>Sign in to Karta</h1>
        <p>Use your account to access workspace and admin controls.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="btn-primary">
            Continue
          </button>
        </form>

        <div className="auth-help">
          <p>Demo admin: admin@karta.ai / admin123</p>
          <p>Demo member: member@karta.ai / member123</p>
          <Link to="/">Back</Link>
        </div>
      </section>
    </main>
  );
}
