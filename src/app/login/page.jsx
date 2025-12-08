'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { safeNavigate } from '@/utils/navigation-safe';

// Fonction pour hasher le mot de passe (SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    cognome: '',
    telefono: ''
  });
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isNavigatingRef = useRef(false);
  
  // Fonction sécurisée pour mettre à jour l'état - ne fait rien si navigation en cours
  const safeSetState = (setter, value) => {
    if (isNavigatingRef.current || (typeof window !== 'undefined' && window.__isNavigating)) {
      return;
    }
    setter(value);
  };

  const handleInputChange = (e) => {
    if (isNavigatingRef.current || (typeof window !== 'undefined' && window.__isNavigating)) {
      return;
    }
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    safeSetState(setError, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ne rien faire si navigation déjà en cours
    if (isNavigatingRef.current || (typeof window !== 'undefined' && window.__isNavigating)) {
      return;
    }
    
    safeSetState(setError, '');
    safeSetState(setLoading, true);

    try {
      if (isNewUser) {
        // Nouvel utilisateur - inscription
        if (!formData.email || !formData.nome || !formData.cognome || !formData.password) {
          safeSetState(setError, 'Per favore, compila tutti i campi obbligatori.');
          safeSetState(setLoading, false);
          return;
        }
        
        // Vérifier que le mot de passe a au moins 6 caractères
        if (formData.password.length < 6) {
          safeSetState(setError, 'La password deve contenere almeno 6 caratteri.');
          safeSetState(setLoading, false);
          return;
        }

        // Hasher le mot de passe (SHA-256 simple, en production utiliser bcrypt)
        const passwordHash = await hashPassword(formData.password);
        
        const newUser = {
          name: `${formData.nome} ${formData.cognome}`,
          email: formData.email,
          phone: formData.telefono || '',
          password: passwordHash, // Hash du mot de passe
          memberSince: new Date().toLocaleDateString('it-IT'),
          isVerified: false
        };

        // NETTOYER ET DÉFINIR LE FLAG AVANT localStorage
        if (typeof window !== 'undefined') {
          // Nettoyer tous les intervals AVANT de définir le flag
          if (window.__trackedIntervals) {
            window.__trackedIntervals.forEach(intervalId => {
              clearInterval(intervalId);
            });
            window.__trackedIntervals.clear();
          }
          // Définir le flag pour empêcher les composants de réagir
          window.__isNavigating = true;
          isNavigatingRef.current = true;
        }

        // Sauvegarder l'utilisateur dans localStorage
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Sauvegarder l'email pour la synchronisation entre appareils
        if (newUser.email) {
          localStorage.setItem('sync_email', newUser.email.trim().toLowerCase());
          console.log('✅ Email de synchronisation sauvegardé:', newUser.email);
        }

        // Naviguer de manière sécurisée pour éviter les conflits de démontage
        // localStorage.setItem est synchrone, donc la valeur est déjà sauvegardée
        // Note: registerCustomer et createNotification seront gérés par UserAccountMenu
        // qui détectera le changement via localStorage au chargement de la nouvelle page
        if (typeof window !== 'undefined') {
          const navSuccess = safeNavigate('/user-dashboard');
          if (!navSuccess) {
            isNavigatingRef.current = false;
            if (typeof window !== 'undefined') {
              window.__isNavigating = false;
            }
            safeSetState(setError, 'Erreur lors de la redirection. Veuillez réessayer.');
            safeSetState(setLoading, false);
            return;
          }
        } else {
          router.replace('/user-dashboard');
        }
      } else {
        // Utilisateur existant - connexion
        if (!formData.email || !formData.password) {
          safeSetState(setError, 'Per favore, inserisci email e password.');
          safeSetState(setLoading, false);
          return;
        }

        // Vérifier le mot de passe via Supabase
        try {
          const { verifyPassword } = await import('@/utils/customers-supabase');
          const isValid = await verifyPassword(formData.email, formData.password);
          
          if (!isValid) {
            safeSetState(setError, 'Email o password non corretti.');
            safeSetState(setLoading, false);
            return;
          }

          // Récupérer les données du client
          const { getCustomerByEmail } = await import('@/utils/customers-supabase');
          const customer = await getCustomerByEmail(formData.email);
          
          if (!customer) {
            safeSetState(setError, 'Utente non trovato. Per favore, registrati prima.');
            safeSetState(setLoading, false);
            return;
          }

          const userData = {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            memberSince: customer.memberSince || new Date().toLocaleDateString('it-IT'),
            isVerified: customer.isVerified || false
          };

          // NETTOYER ET DÉFINIR LE FLAG AVANT localStorage
          if (typeof window !== 'undefined') {
            // Nettoyer tous les intervals AVANT de définir le flag
            if (window.__trackedIntervals) {
              window.__trackedIntervals.forEach(intervalId => {
                clearInterval(intervalId);
              });
              window.__trackedIntervals.clear();
            }
            // Définir le flag pour empêcher les composants de réagir
            window.__isNavigating = true;
            isNavigatingRef.current = true;
          }

          localStorage.setItem('user', JSON.stringify(userData));
          
          // Sauvegarder l'email pour la synchronisation entre appareils
          if (customer.email) {
            localStorage.setItem('sync_email', customer.email.trim().toLowerCase());
            console.log('✅ Email de synchronisation sauvegardé:', customer.email);
          }
          
          // Naviguer de manière sécurisée pour éviter les conflits de démontage
          // localStorage.setItem est synchrone, donc la valeur est déjà sauvegardée
          if (typeof window !== 'undefined') {
            const navSuccess = safeNavigate('/user-dashboard');
            if (!navSuccess) {
              isNavigatingRef.current = false;
              if (typeof window !== 'undefined') {
                window.__isNavigating = false;
              }
              safeSetState(setError, 'Erreur lors de la redirection. Veuillez réessayer.');
              safeSetState(setLoading, false);
              return;
            }
          } else {
            router.replace('/user-dashboard');
          }
          return;
        } catch (authError) {
          console.error('Erreur lors de la vérification:', authError);
          safeSetState(setError, 'Erreur de connexion. Vérifiez vos identifiants et réessayez.');
          safeSetState(setLoading, false);
          return;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = 'Si è verificato un errore. Riprova.';
      
      if (error?.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
        } else if (error.message.includes('password') || error.message.includes('auth')) {
          errorMessage = 'Email o password non corretti.';
        } else if (error.message.includes('not found') || error.message.includes('non trovato')) {
          errorMessage = 'Utente non trovato. Per favore, registrati prima.';
        }
      }
      
      safeSetState(setError, errorMessage);
      safeSetState(setLoading, false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="flex justify-center mb-6">
            <Image
              src="/assets/images/roberto.jpg"
              alt="Roberto Equitazione"
              width={180}
              height={40}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <h2 className="text-3xl font-heading font-bold text-text-primary">
            {isNewUser ? 'Registrazione' : 'Accedi'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {isNewUser 
              ? 'Crea un nuovo account per iniziare' 
              : 'Accedi al tuo account per continuare'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {isNewUser && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-body font-semibold text-text-primary mb-2">
                      Nome <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      autoComplete="given-name"
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="cognome" className="block text-sm font-body font-semibold text-text-primary mb-2">
                      Cognome <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="cognome"
                      name="cognome"
                      value={formData.cognome}
                      onChange={handleInputChange}
                      required
                      autoComplete="family-name"
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="telefono" className="block text-sm font-body font-semibold text-text-primary mb-2">
                    Telefono
                  </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      autoComplete="tel"
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-body font-semibold text-text-primary mb-2">
                Email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="tuo@email.it"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-body font-semibold text-text-primary mb-2">
                Password {!isNewUser && <span className="text-error">*</span>}
                {isNewUser && <span className="text-error">*</span>}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={isNewUser}
                minLength={isNewUser ? 6 : 0}
                autoComplete={isNewUser ? "new-password" : "current-password"}
                className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={isNewUser ? "Minimo 6 caratteri" : "Inserisci la tua password"}
              />
              {isNewUser && (
                <p className="mt-1 text-xs text-text-secondary">
                  La password deve contenere almeno 6 caratteri
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-body font-semibold hover:opacity-90 transition-fast disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isNewUser ? 'Registrazione in corso...' : 'Accesso in corso...'}
                  </>
                ) : (
                  isNewUser ? 'Registrati' : 'Accedi'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  if (isNavigatingRef.current || (typeof window !== 'undefined' && window.__isNavigating)) {
                    return;
                  }
                  setIsNewUser(!isNewUser);
                  safeSetState(setError, '');
                  setFormData(prev => ({ ...prev, password: '' }));
                }}
                className="text-sm text-primary hover:underline"
              >
                {isNewUser 
                  ? 'Hai già un account? Accedi' 
                  : 'Non hai un account? Registrati'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <Link href="/product-catalog" className="text-sm text-text-secondary hover:text-primary">
            Continua senza accedere
          </Link>
        </div>
      </div>
    </div>
  );
}

