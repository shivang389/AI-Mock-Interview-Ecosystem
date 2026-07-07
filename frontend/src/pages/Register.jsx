import React, { useState } from 'react';
import API from '../services/api';

export default function Register() {
  // Toggle state to switch seamlessly between Registration and Login modes
  const [isLoginMode, setIsLoginMode] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [loading, setLoading] = useState(false);
  const [errorBox, setErrorBox] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorBox('');
    setLoading(true);

    try {
      // 1. Determine target network endpoints based on form state mode
      const targetPath = isLoginMode ? '/auth/login' : '/auth/register';
      const payload = isLoginMode ? { email, password } : { name, email, password, role };

      console.log(`📡 [AUTH REQUEST]: Dispatching credentials payload to -> ${targetPath}`);
      const response = await API.post(targetPath, payload);

      if (response.data.success) {
        const tokenString = response.data.data.token;
        console.log("✅ [AUTH SUCCESS]: Authentication token generated smoothly.");

        // 2. Save the security signature into local storage memory
        localStorage.setItem('amie-auth', JSON.stringify({ token: tokenString }));

        // 3. Force an instantaneous application reload to update App.jsx state instantly
        window.location.href = '/';
      }
    } catch (err) {
      console.error("❌ [AUTH TRANS-FAIL]:", err);
      setErrorBox(err.response?.data?.error?.message || "Connection timed out. Check server node logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-md space-y-6 animate-fade-in">
        
        {/* Header Block text switches based on isLoginMode status */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">
            {isLoginMode ? 'Welcome Back to AMIE' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {isLoginMode ? 'Access your automated interview dashboard' : 'Join the AI Mock Interview Ecosystem'}
          </p>
        </div>

        {/* Dynamic Warning Alert Box */}
        {errorBox && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold leading-relaxed text-center">
            ⚠️ {errorBox}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Hide Name field if user toggles onto Login mode */}
          {!isLoginMode && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shivang Joshi"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-indigo-500 font-medium text-slate-800"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="shivjjoshi@gmail.com"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-indigo-500 font-medium text-slate-800"
            />
          </div>

          {/* Hide Role Dropdown inside Login View panels */}
          {!isLoginMode && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-indigo-500 bg-white font-medium text-slate-800"
              >
                <option value="candidate">Candidate (Student)</option>
                <option value="recruiter">Recruiter / Interviewer</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-sm shadow-sm transition-all cursor-pointer mt-2"
          >
            {loading ? 'Processing Transaction...' : isLoginMode ? 'Sign In Cleanly' : 'Sign Up'}
          </button>
        </form>

        {/* Interactive Mode Toggle Controls Area */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            {isLoginMode ? "Don't have an account yet? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setErrorBox('');
                setIsLoginMode(!isLoginMode);
              }}
              className="text-indigo-600 hover:text-indigo-800 font-extrabold underline cursor-pointer bg-transparent border-none"
            >
              {isLoginMode ? 'Register Here' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}