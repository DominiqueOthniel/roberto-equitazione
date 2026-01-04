'use client';

import { useState } from 'react';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Logique de réinitialisation simplifiée
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Email envoyé !</h1>
          <p className="text-text-secondary mb-6">
            Un email de réinitialisation a été envoyé à {email}
          </p>
          <a
            href="/admin/login"
            className="text-primary hover:underline"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Mot de passe oublié</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90"
          >
            Envoyer le lien de réinitialisation
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/admin/login" className="text-primary hover:underline">
            Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  );
}