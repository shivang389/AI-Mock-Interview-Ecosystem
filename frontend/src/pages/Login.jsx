import React, { useState } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';

function Login({ onNavigate }) {
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">Welcome Back</h2>
      <p className="text-sm text-slate-400 text-center mb-6">Log in to continue your interview practice</p>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium py-2.5 rounded-xl text-sm shadow-sm hover:shadow transition-all"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <button onClick={() => onNavigate('register')} className="text-indigo-600 font-semibold hover:underline">
          Sign Up Free
        </button>
      </p>
    </div>
  );
}

export default Login;