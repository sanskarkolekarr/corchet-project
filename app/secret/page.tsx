
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecretPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/chat');
      } else {
        setError(data.message || 'Incorrect password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-pink-light/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 soft-shadow border border-brand-pink-soft/30">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-brand-text mb-2">Secret Access</h2>
          <p className="text-sm text-brand-text/60 italic">Enter password to proceed</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-6 py-3 rounded-full border border-brand-pink-soft focus:outline-none focus:ring-2 focus:ring-brand-pink-accent/50 transition-all text-brand-text"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm text-center font-medium animate-pulse">
              {error}
            </p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-pink-accent text-white rounded-full font-medium hover:bg-brand-pink-accent/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            {loading ? 'Authenticating...' : 'Enter Secret Chat'}
          </button>
        </form>
      </div>
    </div>
  );
}
