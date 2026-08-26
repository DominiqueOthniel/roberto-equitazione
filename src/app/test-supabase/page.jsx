'use client';

import { useState } from 'react';
import { testSupabaseConnection } from '@/utils/test-supabase-connection';
import { addToCart, getCart } from '@/utils/cart-supabase';
import { supabase } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [testResult, setTestResult] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const result = await testSupabaseConnection();
      setTestResult(result ? '✅ Test réussi' : '❌ Test échoué - Vérifiez la console');
    } catch (error) {
      setTestResult('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testAddToCart = async () => {
    setLoading(true);
    try {
      console.log('🧪 Test: Ajout d\'un produit au panier...');
      await addToCart({
        id: 'test-' + Date.now(),
        name: 'Produit Test',
        price: 100,
        quantity: 1
      });
      
      const updatedCart = await getCart();
      setCart(updatedCart);
      console.log('✅ Produit ajouté, panier:', updatedCart);
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSupabaseData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_carts')
        .select('*')
        .limit(10);
      
      if (error) {
        console.error('❌ Erreur:', error);
        alert('Erreur: ' + error.message);
      } else {
        console.log('✅ Données dans user_carts:', data);
        alert(`Trouvé ${data.length} panier(s) dans Supabase. Vérifiez la console pour les détails.`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Connexion Supabase</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Test en cours...' : 'Lancer le test de connexion'}
          </button>
          
          {testResult && (
            <div className={`p-4 rounded-md ${testResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {testResult}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold">Tests spécifiques</h2>
          
          <button
            onClick={testAddToCart}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 disabled:opacity-50 block"
          >
            Test: Ajouter un produit au panier
          </button>
          
          <button
            onClick={checkSupabaseData}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 disabled:opacity-50 block"
          >
            Vérifier les données dans Supabase
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Ouvrez la console du navigateur (F12)</li>
            <li>Cliquez sur "Lancer le test de connexion"</li>
            <li>Vérifiez les messages dans la console</li>
            <li>Si vous voyez des erreurs, suivez les instructions affichées</li>
          </ol>
        </div>

        {cart.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold mb-2">Panier actuel:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(cart, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
