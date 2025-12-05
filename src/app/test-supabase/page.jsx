'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);
  const [productsCount, setProductsCount] = useState(null);

  useEffect(() => {
    let mounted = true;
    let abortController = new AbortController();

    async function testConnection() {
      try {
        // Test 1: Vérifier la connexion
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true });

        if (productsError) {
          throw productsError;
        }

        if (mounted && !abortController.signal.aborted) {
          setProductsCount(products?.length || 0);
          setStatus('✅ Connexion Supabase réussie !');
          setError(null);
        }
      } catch (err) {
        if (mounted && !abortController.signal.aborted) {
          setStatus('❌ Erreur de connexion');
          setError(err.message);
          console.error('Erreur Supabase:', err);
        }
      }
    }

    testConnection();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">
          Test Connexion Supabase
        </h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-text-secondary mb-2">Status:</p>
            <p className={`font-semibold ${
              status.includes('✅') ? 'text-success' : 'text-error'
            }`}>
              {status}
            </p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error rounded p-4">
              <p className="text-error text-sm">{error}</p>
              <p className="text-text-secondary text-xs mt-2">
                Vérifiez que :
                <br />• Le fichier .env.local existe
                <br />• Les clés Supabase sont correctes
                <br />• Le schéma de base de données est créé
              </p>
            </div>
          )}

          {productsCount !== null && (
            <div>
              <p className="text-text-secondary mb-2">Produits dans la base:</p>
              <p className="text-text-primary font-semibold">{productsCount}</p>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-text-secondary">
              Si vous voyez ✅, Supabase est correctement configuré !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


