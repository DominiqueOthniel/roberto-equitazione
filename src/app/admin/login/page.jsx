'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@robertoequitazione.it');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Vérifier les credentials
    const ADMIN_EMAIL = 'admin@robertoequitazione.it';
    const ADMIN_PASSWORD = 'admin123';
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Sauvegarder l'authentification
      localStorage.setItem('adminAuth', JSON.stringify({
        email: email,
        name: 'Administrateur',
        role: 'admin',
        loginTime: new Date().toISOString()
      }));
      
      // Redirection vers le dashboard admin
      router.push('/admin');
    } else {
      setError('Email o password non corretti');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-900 to-amber-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">R</span>
            </div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-amber-900">ROBERTO</h1>
        </div>

        {/* Form Card */}
        <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-serif font-bold text-amber-900 text-center mb-2">
            Amministrazione
          </h2>
          <p className="text-sm text-amber-700/70 text-center mb-6">
            Accedi al pannello di amministrazione
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                  <Icon name="EnvelopeIcon" size={20} variant="outline" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400"
                  placeholder="admin@robertoequitazione.it"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                  <Icon name="LockClosedIcon" size={20} variant="outline" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <Icon 
                    name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} 
                    size={20} 
                    variant="outline" 
                  />
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-amber-700">Ricordami</span>
              </label>
              <Link
                href="/admin/forgot-password"
                className="text-sm text-amber-700 hover:text-amber-900 transition-colors"
              >
                Password dimenticata?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-900 to-amber-800 text-white py-3 px-6 rounded-lg font-medium hover:from-amber-800 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Accesso in corso...</span>
                </>
              ) : (
                <>
                  <Icon name="ArrowRightIcon" size={20} variant="outline" />
                  <span>Accedi</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 transition-colors"
          >
            <Icon name="ArrowLeftIcon" size={16} variant="outline" />
            <span>Torna al sito</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
