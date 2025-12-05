'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation d'envoi d'email de réinitialisation
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      // Dans une vraie application, vous feriez un appel API ici
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo et Titre */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/assets/images/roberto.jpg"
              alt="Roberto Equitazione"
              width={180}
              height={40}
              className="h-12 w-auto mx-auto"
              priority
            />
          </Link>
          <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
            Password Dimenticata?
          </h1>
          <p className="text-text-secondary">
            Inserisci la tua email per ricevere le istruzioni di reset
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-card">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Messaggio di errore */}
              {error && (
                <div className="bg-error/10 border border-error/20 rounded-md p-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              {/* Champ Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-body font-semibold text-text-primary mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-fast"
                    placeholder="admin@robertoequitazione.it"
                  />
                </div>
              </div>

              {/* Pulsante di invio */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md font-body font-semibold hover:opacity-90 transition-fast disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Invio in corso...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Invia Istruzioni</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-success/10 border border-success/20 rounded-md p-4">
                <svg className="w-12 h-12 text-success mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
                  Email Inviata!
                </h3>
                <p className="text-sm text-text-secondary">
                  Controlla la tua casella email per le istruzioni di reset password.
                </p>
              </div>
              <Link
                href="/admin/login"
                className="inline-block text-sm text-primary hover:underline font-body"
              >
                Torna al login
              </Link>
            </div>
          )}
        </div>

        {/* Lien retour */}
        <div className="text-center mt-6">
          <Link
            href="/admin/login"
            className="text-sm text-text-secondary hover:text-primary transition-fast inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Torna al login
          </Link>
        </div>
      </div>
    </div>
  );
}


